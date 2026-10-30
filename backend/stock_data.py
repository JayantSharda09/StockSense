import yfinance as yf
import pandas as pd

STOCKS = {
    "RELIANCE.NS": "Reliance Industries",
    "TCS.NS": "Tata Consultancy Services",
    "INFY.NS": "Infosys",
    "HDFCBANK.NS": "HDFC Bank",
    "ICICIBANK.NS": "ICICI Bank",
    "SBIN.NS": "State Bank of India",
    "ITC.NS": "ITC Limited",
    "LT.NS": "Larsen & Toubro",
    "BHARTIARTL.NS": "Bharti Airtel",
    "WIPRO.NS": "Wipro",
}

ALLOWED_PERIODS = {"1y", "2y", "5y"}


def get_stock_data(symbol: str, period: str = "2y") -> pd.DataFrame:
    if symbol not in STOCKS:
        raise ValueError("Unsupported stock symbol.")
    if period not in ALLOWED_PERIODS:
        raise ValueError("Period must be 1y, 2y or 5y.")

    ticker = yf.Ticker(symbol)
    data = ticker.history(
        period=period,
        interval="1d",
        auto_adjust=True,
        actions=False,
    )

    if data.empty or "Close" not in data.columns:
        raise ValueError(
            "No historical data returned. Check the ticker or try again later."
        )

    data = data[["Close"]].copy()
    data["Close"] = pd.to_numeric(data["Close"], errors="coerce")
    data.dropna(subset=["Close"], inplace=True)
    data.sort_index(inplace=True)

    # Remove timezone information for consistent JSON date formatting.
    index = pd.to_datetime(data.index)
    if index.tz is not None:
        index = index.tz_localize(None)
    data.index = index

    if len(data) < 100:
        raise ValueError("Not enough historical observations. Try a longer period.")

    return data
