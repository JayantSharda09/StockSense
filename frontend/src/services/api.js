const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function getStocks() {
  const response = await fetch(`${API_URL}/api/stocks`);
  if (!response.ok) throw new Error("Unable to fetch supported stocks.");
  return response.json();
}

export async function getForecast(symbol, period, horizon) {
  const params = new URLSearchParams({
    symbol,
    period,
    horizon: String(horizon),
  });
  const response = await fetch(`${API_URL}/api/forecast?${params}`);
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.detail || "Forecast request failed.");
  }
  return result;
}
