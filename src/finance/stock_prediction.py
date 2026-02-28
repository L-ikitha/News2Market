import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score


class StockPredictor:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100)

    def train(self, df, target_column="target"):
        X = df.drop(columns=[target_column])
        y = df[target_column]

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, shuffle=False
        )

        self.model.fit(X_train, y_train)

        preds = self.model.predict(X_test)
        acc = accuracy_score(y_test, preds)

        print(f"Model Accuracy: {acc:.2f}")

        return acc

    def predict(self, feature_df):
        prediction = self.model.predict(feature_df)[0]
        probability = self.model.predict_proba(feature_df)[0]

        return {
            "prediction": "UP" if prediction == 1 else "DOWN",
            "confidence": max(probability)
        }

    def save_model(self, path="model.pkl"):
        joblib.dump(self.model, path)

    def load_model(self, path="model.pkl"):
        self.model = joblib.load(path)