import warnings
import numpy as np
import pandas as pd

from sklearn.metrics import mean_absolute_error, mean_squared_error
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.stattools import adfuller


ARIMA_ORDER = (5, 1, 0)


def _records(series, value_name):
    return [
        {
            "date": pd.Timestamp(date).strftime("%Y-%m-%d"),
            value_name: round(float(value), 2),
        }
        for date, value in series.items()
    ]


def run_forecast(data: pd.DataFrame, horizon: int) -> dict:
    if horizon not in (7, 15, 30):
        raise ValueError("Horizon must be 7, 15 or 30.")

    prices = data["Close"].astype(float).dropna().sort_index()
    if len(prices) < 100:
        raise ValueError("At least 100 observations are required.")

    split_index = int(len(prices) * 0.8)
    train, test = prices.iloc[:split_index], prices.iloc[split_index:]

    if len(test) == 0:
        raise ValueError("Not enough observations for holdout evaluation.")

    try:
    # ARIMA needs a supported index for forecasting.
    # NSE trading dates are irregular because of weekends and holidays.
    # Use a simple integer index for model fitting.
        model_prices = pd.Series(
            prices.to_numpy(dtype=float),
            index=pd.RangeIndex(len(prices)),
            name="Close",
        )

        model_train = model_prices.iloc[:split_index]

        with warnings.catch_warnings():
            warnings.simplefilter("ignore")

            # Train on the first 80% of observations
            holdout_model = ARIMA(
                model_train,
                order=ARIMA_ORDER,
                enforce_stationarity=False,
                enforce_invertibility=False,
            ).fit()

            # Predict the remaining 20%
            test_prediction = holdout_model.forecast(
                steps=len(test)
            )

            # Train final model on all available observations
            final_model = ARIMA(
                model_prices,
                order=ARIMA_ORDER,
                enforce_stationarity=False,
                enforce_invertibility=False,
            ).fit()

            # Forecast future stock prices
            forecast_result = final_model.get_forecast(
                steps=horizon
            )

    except Exception as exc:
        raise ValueError(f"ARIMA model could not be fitted: {exc}") from exc

    test_prediction = pd.Series(
        np.asarray(test_prediction, dtype=float),
        index=test.index,
    )
    mae = mean_absolute_error(test, test_prediction)
    rmse = np.sqrt(mean_squared_error(test, test_prediction))

    future_values = forecast_result.predicted_mean
    confidence = forecast_result.conf_int(alpha=0.05)

    # Approximate future weekdays; exchange holidays are not excluded.
    future_dates = pd.bdate_range(
        start=prices.index[-1] + pd.Timedelta(days=1),
        periods=horizon,
    )
    future = [
        {
            "date": date.strftime("%Y-%m-%d"),
            "predicted": round(float(value), 2),
            "lower": round(float(low), 2),
            "upper": round(float(high), 2),
        }
        for date, value, low, high in zip(
            future_dates,
            np.asarray(future_values),
            confidence.iloc[:, 0].to_numpy(),
            confidence.iloc[:, 1].to_numpy(),
        )
    ]

    # ADF test on the original closing-price series.
    try:
        adf_stat, adf_pvalue, *_ = adfuller(prices, autolag="AIC")
        adf_result = {
            "statistic": round(float(adf_stat), 4),
            "p_value": round(float(adf_pvalue), 6),
            "interpretation": (
                "Evidence of stationarity at the 5% level."
                if adf_pvalue < 0.05
                else "Insufficient evidence of stationarity at the 5% level."
            ),
        }
    except Exception:
        adf_result = {
            "statistic": None,
            "p_value": None,
            "interpretation": "ADF test could not be calculated for this series.",
        }

    history = _records(prices, "close")
    backtest = [
        {
            "date": pd.Timestamp(date).strftime("%Y-%m-%d"),
            "actual": round(float(actual), 2),
            "predicted": round(float(predicted), 2),
        }
        for date, actual, predicted in zip(
            test.index, test.to_numpy(), test_prediction.to_numpy()
        )
    ]

    return {
        "history": history,
        "backtest": backtest,
        "forecast": future,
        "metrics": {
            "mae": round(float(mae), 2),
            "rmse": round(float(rmse), 2),
        },
        "adf": adf_result,
        "latest_price": round(float(prices.iloc[-1]), 2),
        "latest_date": prices.index[-1].strftime("%Y-%m-%d"),
        "training_records": int(len(train)),
        "testing_records": int(len(test)),
        "model": f"ARIMA{ARIMA_ORDER}",
    }
