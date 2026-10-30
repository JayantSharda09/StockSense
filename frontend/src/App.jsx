import { useEffect, useState } from "react";
import { TrendingUp, Activity, BrainCircuit, BarChart3, RefreshCw } from "lucide-react";
import { getStocks, getForecast } from "./services/api";
import StockSelector from "./components/StockSelector";
import StockChart from "./components/StockChart";
import MetricCard from "./components/MetricCard";

const money = (value) =>
  `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export default function App() {
  const [stocks, setStocks] = useState([]);
  const [symbol, setSymbol] = useState("RELIANCE.NS");
  const [period, setPeriod] = useState("2y");
  const [horizon, setHorizon] = useState(7);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getStocks()
      .then(setStocks)
      .catch((err) => setError(err.message));
  }, []);

  async function predict() {
    if (!symbol) return;
    setLoading(true);
    setError("");
    try {
      const result = await getForecast(symbol, period, horizon);
      setData(result);
    } catch (err) {
      setData(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (stocks.length) predict();
    // Initial fetch after stock list is loaded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stocks]);

  const selectedStock = stocks.find((stock) => stock.symbol === symbol);

  return (
    <div className="app-shell">
      <header className="navbar">
        <a className="brand" href="/" aria-label="StockSense home">
          <span className="brand-icon"><TrendingUp size={23} /></span>
          <span><strong>StockSense</strong><small>Predictive Market Analytics</small></span>
        </a>
        <div className="market-label"><span className="status-dot" /> NSE STOCK DATA</div>
      </header>

      <main className="dashboard">
        <section className="hero">
          <div>
            
            <h1>Stock Market Forecasting</h1>
            <p className="hero-copy">Explore historical NSE prices and estimate future closing prices with ARIMA time-series analysis.</p>
          </div>
          <div className="model-badge"><BrainCircuit size={18} /> ARIMA MODEL</div>
        </section>

        <StockSelector
          stocks={stocks} symbol={symbol} setSymbol={setSymbol}
          period={period} setPeriod={setPeriod}
          horizon={horizon} setHorizon={setHorizon}
          onPredict={predict} loading={loading}
        />

        {error && <div className="error-message">{error}</div>}

        {loading && (
          <div className="loading-panel">
            <RefreshCw className="spin" size={23} />
            <div><strong>Analyzing historical prices</strong><p>Fetching data and fitting the ARIMA model...</p></div>
          </div>
        )}

        {!loading && !data && !error && (
          <div className="empty-panel"><Activity size={28} /><p>Choose a stock and generate a forecast to get started.</p></div>
        )}

        {data && !loading && (
          <>
            <section className="stock-summary">
              <div>
                <p className="eyebrow">SELECTED NSE LISTING</p>
                <h2>{data.company}</h2>
                <p className="muted">{data.symbol} · Latest available data: {data.latest_date}</p>
              </div>
              <div className="latest-price">
                <span>Latest adjusted close</span>
                <strong>{money(data.latest_price)}</strong>
              </div>
            </section>

            <section className="metrics-grid">
              <MetricCard title="Latest Closing Price" value={money(data.latest_price)} subtitle="Most recent available record" />
              <MetricCard title="Mean Absolute Error" value={money(data.metrics.mae)} subtitle="Holdout evaluation · MAE" />
              <MetricCard title="Root Mean Squared Error" value={money(data.metrics.rmse)} subtitle="Holdout evaluation · RMSE" />
              <MetricCard title="Forecast Horizon" value={`${horizon} days`} subtitle="Approximate trading weekdays" />
            </section>

            <StockChart data={data} />

            <section className="panel forecast-panel">
              <div className="section-title">
                <div><h2>Predicted Stock Prices</h2><p>Estimated future adjusted closing prices</p></div>
                <BarChart3 color="#60a5fa" />
              </div>
              <div className="table-scroll">
                <table>
                  <thead><tr><th>Date</th><th>Forecast</th><th>Lower 95% bound</th><th>Upper 95% bound</th></tr></thead>
                  <tbody>
                    {data.forecast.map((item) => (
                      <tr key={item.date}>
                        <td>{item.date}</td>
                        <td className="forecast-value">{money(item.predicted)}</td>
                        <td>{money(item.lower)}</td>
                        <td>{money(item.upper)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="panel diagnostics">
              <div className="diagnostic-icon"><BrainCircuit size={22} /></div>
              <div>
                <h3>Model diagnostics</h3>
                <p><strong>ADF p-value:</strong> {data.adf.p_value ?? "Unavailable"} · {data.adf.interpretation}</p>
                <p><strong>Model:</strong> {data.model} · <strong>Training observations:</strong> {data.training_records} · <strong>Testing observations:</strong> {data.testing_records}</p>
                <p className="muted">The holdout evaluation uses a chronological split and a fixed-origin multi-step forecast. Future weekdays are approximate and do not exclude NSE holidays.</p>
              </div>
            </section>
          </>
        )}
      </main>

      <footer>
        <strong>StockSense</strong> · Educational Predictive Analytics Project
        <p>Forecasts are uncertain and are not investment advice.</p>
      </footer>
    </div>
  );
}
