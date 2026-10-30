# StockSense — NSE Stock Price Forecasting

An educational mini-project demonstrating **ARIMA time-series forecasting** on Indian NSE-listed stocks.

## Features
- Select from a list of NSE tickers.
- Fetch daily historical prices using `yfinance`.
- Display historical closing prices.
- Fit an ARIMA(5,1,0) model.
- Evaluate a chronological holdout forecast using MAE and RMSE.
- Forecast 7, 15, or 30 approximate trading weekdays with 95% model confidence intervals.
- Display an Augmented Dickey-Fuller (ADF) stationarity test.

> **Disclaimer:** This is an educational demonstration, not investment advice. Stock prices are noisy and forecasts are uncertain. `yfinance` is an unofficial data access library; data availability and ticker coverage may change. Forecast dates use weekdays and do not account for NSE holidays.

## Requirements
- Python 3.10+
- Node.js 18+
- Internet access for downloading stock data and frontend dependencies

## 1. Backend setup (Windows PowerShell)

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload
```

If PowerShell blocks activation, use Command Prompt:
```bat
.venv\Scripts\activate.bat
```

Backend:
- API: http://127.0.0.1:8000
- Swagger docs: http://127.0.0.1:8000/docs

## 2. Frontend setup (new terminal)

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, usually http://localhost:5173.

## Example stocks
- RELIANCE.NS — Reliance Industries
- TCS.NS — Tata Consultancy Services
- INFY.NS — Infosys
- HDFCBANK.NS — HDFC Bank
- ICICIBANK.NS — ICICI Bank
- SBIN.NS — State Bank of India

## API endpoints
- `GET /` — API status
- `GET /api/stocks` — supported stock list
- `GET /api/forecast?symbol=RELIANCE.NS&period=2y&horizon=7` — history, holdout predictions, metrics, ADF test and future forecast

Allowed periods: `1y`, `2y`, `5y`  
Allowed horizons: `7`, `15`, `30`

## Model methodology
1. Fetch daily adjusted OHLCV history.
2. Use the closing price series and sort chronologically.
3. Split chronologically: first 80% training, last 20% testing.
4. Fit ARIMA(5,1,0) on the training segment and forecast the complete holdout segment.
5. Calculate MAE and RMSE on the holdout.
6. Refit ARIMA(5,1,0) on all available observations and forecast the requested horizon.

The fixed-origin holdout forecast is a multi-step forecast. It is not the same as repeatedly refitting a one-day-ahead model.

## Troubleshooting
- **No data returned:** Check internet access, ticker symbol and Yahoo Finance availability. Try another supported ticker or period.
- **Model fitting fails:** Some symbols or short/irregular series may not fit this fixed ARIMA order. Try a different stock or longer period.
- **CORS error:** Keep Vite on `http://localhost:5173`, or add your frontend origin to `allow_origins` in `backend/main.py`.
- **PowerShell activation error:** Use Command Prompt or enable script execution for the current user according to your organization's policy.
