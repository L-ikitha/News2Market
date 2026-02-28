import yfinance as yf
import pandas as pd
import numpy as np


class StockDataFetcher:
    def __init__(self, ticker):
        self.ticker = ticker

    def fetch_data(self, period="6mo", interval="1d"):
        stock = yf.Ticker(self.ticker)
        df = stock.history(period=period, interval=interval)

        df.dropna(inplace=True)

        # Compute returns
        df["return_1d"] = df["Close"].pct_change()
        df["return_5d"] = df["Close"].pct_change(5)

        # Volatility (rolling std of returns)
        df["volatility"] = df["return_1d"].rolling(window=10).std()

        df.dropna(inplace=True)

        return df

    def latest_features(self):
        df = self.fetch_data()
        latest = df.iloc[-1]

        return {
            "return_1d": latest["return_1d"],
            "return_5d": latest["return_5d"],
            "volatility": latest["volatility"],
            "volume": latest["Volume"]
        }