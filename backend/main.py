from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from stock_data import get_stock_data, STOCKS
from forecasting import run_forecast

app = FastAPI(
    title="StockSense API",
    description="NSE stock price forecasting using ARIMA",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "Welcome to StockSense API", "status": "running"}


@app.get("/api/stocks")
def available_stocks():
    return [{"symbol": symbol, "name": name} for symbol, name in STOCKS.items()]


@app.get("/api/forecast")
def forecast_stock(
    symbol: str = Query(...),
    period: str = Query("2y"),
    horizon: int = Query(7),
):
    if symbol not in STOCKS:
        raise HTTPException(status_code=400, detail="Unsupported stock symbol.")
    if period not in {"1y", "2y", "5y"}:
        raise HTTPException(status_code=400, detail="Period must be 1y, 2y or 5y.")
    if horizon not in {7, 15, 30}:
        raise HTTPException(status_code=400, detail="Horizon must be 7, 15 or 30.")

    try:
        data = get_stock_data(symbol, period)
        result = run_forecast(data, horizon)
        result["symbol"] = symbol
        result["company"] = STOCKS[symbol]
        return result
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Could not retrieve or forecast this stock: {exc}",
        ) from exc
