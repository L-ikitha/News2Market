import pandas as pd


class FeatureEngineer:
    def __init__(self):
        pass

    def build_feature_vector(self, sentiment_score, news_volume,
                             entity_count, stock_features):

        feature_vector = {
            "sentiment_score": sentiment_score,
            "news_volume": news_volume,
            "entity_count": entity_count,
            "return_1d": stock_features["return_1d"],
            "return_5d": stock_features["return_5d"],
            "volatility": stock_features["volatility"],
            "volume": stock_features["volume"]
        }

        return pd.DataFrame([feature_vector])