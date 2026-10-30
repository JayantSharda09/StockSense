import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ReferenceArea
} from "recharts";

const currency = (value) =>
  `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export default function StockChart({ data }) {
  if (!data) return null;

  const points = new Map();

  data.history.forEach((item) => {
    points.set(item.date, { date: item.date, actual: item.close });
  });

  data.backtest.forEach((item) => {
    points.set(item.date, {
      ...points.get(item.date),
      date: item.date,
      actual: item.actual,
      predicted: item.predicted
    });
  });

  data.forecast.forEach((item) => {
    points.set(item.date, {
      date: item.date,
      forecast: item.predicted,
      lower: item.lower,
      upper: item.upper
    });
  });

  const chartData = Array.from(points.values()).sort(
    (a, b) => a.date.localeCompare(b.date)
  );

  const firstForecast = data.forecast[0]?.date;
  const lastForecast = data.forecast[data.forecast.length - 1]?.date;

  return (
    <section className="chart-container">
      <div className="section-title">
        <div>
          <h3>Stock Price Analysis & Forecast</h3>
          <p>Historical closing prices, holdout predictions and future forecast</p>
        </div>
        <span className="model-pill">{data.model}</span>
      </div>

      <ResponsiveContainer width="100%" height={380}>
        <LineChart data={chartData} margin={{ top: 16, right: 20, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#26364d" />
          <XAxis dataKey="date" stroke="#94a3b8" minTickGap={35} tick={{ fontSize: 11 }} />
          <YAxis
            stroke="#94a3b8"
            domain={["auto", "auto"]}
            tickFormatter={currency}
            tick={{ fontSize: 11 }}
            width={85}
          />
          <Tooltip
            labelStyle={{ color: "#cbd5e1" }}
            contentStyle={{ background: "#111c2e", border: "1px solid #334155", borderRadius: 10 }}
            formatter={(value) => value == null ? "—" : currency(value)}
          />
          <Legend />
          {firstForecast && (
            <ReferenceArea x1={firstForecast} x2={lastForecast} fill="#3b82f6" fillOpacity={0.08} />
          )}
          <Line type="monotone" dataKey="actual" name="Actual Price" stroke="#38bdf8" strokeWidth={2} dot={false} connectNulls={false} />
          <Line type="monotone" dataKey="predicted" name="Holdout Prediction" stroke="#f59e0b" strokeWidth={2} dot={false} connectNulls={false} />
          <Line type="monotone" dataKey="forecast" name="Future Forecast" stroke="#4ade80" strokeWidth={2.5} dot={false} connectNulls={false} />
          <Line type="monotone" dataKey="upper" name="95% Upper Bound" stroke="#64748b" strokeDasharray="4 4" dot={false} connectNulls={false} />
          <Line type="monotone" dataKey="lower" name="95% Lower Bound" stroke="#64748b" strokeDasharray="4 4" dot={false} connectNulls={false} />
        </LineChart>
      </ResponsiveContainer>
      <p className="chart-note">The shaded forecast region and confidence bounds are model estimates, not guarantees.</p>
    </section>
  );
}
