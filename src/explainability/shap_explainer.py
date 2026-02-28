def _run_explainability(self) -> bool:
    try:
        display_info("Generating SHAP explanations...")

        if self.prediction_result is None:
            display_error("Prediction not available.")
            return False

        explainer = SHAPExplainer(self.predictor.model)
        explanation = explainer.explain(self.feature_df)

        display_info("Feature Impact Analysis:")
        for feature, value in explanation.items():
            display_info(f"  {feature}: {round(value, 4)}")

        return True

    except Exception as e:
        display_error(f"Explainability step failed: {str(e)}")
        return False