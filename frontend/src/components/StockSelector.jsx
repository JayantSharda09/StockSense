export default function StockSelector({
  stocks, symbol, setSymbol, period, setPeriod,
  horizon, setHorizon, onPredict, loading
}) {
  return (
    <section className="controls">
      <div className="control-group">
        <label htmlFor="stock">SELECT STOCK</label>
        <select id="stock" value={symbol} onChange={(e) => setSymbol(e.target.value)}>
          {stocks.map((stock) => (
            <option key={stock.symbol} value={stock.symbol}>
              {stock.name} ({stock.symbol.replace(".NS", "")})
            </option>
          ))}
        </select>
      </div>
      <div className="control-group">
        <label htmlFor="period">HISTORICAL DATA</label>
        <select id="period" value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="1y">1 Year</option>
          <option value="2y">2 Years</option>
          <option value="5y">5 Years</option>
        </select>
      </div>
      <div className="control-group">
        <label htmlFor="horizon">FORECAST PERIOD</label>
        <select id="horizon" value={horizon} onChange={(e) => setHorizon(Number(e.target.value))}>
          <option value={7}>7 Trading Days</option>
          <option value={15}>15 Trading Days</option>
          <option value={30}>30 Trading Days</option>
        </select>
      </div>
      <button onClick={onPredict} disabled={loading || !stocks.length}>
        {loading ? "Analyzing..." : "Generate Prediction"}
      </button>
    </section>
  );
}
