from sklearn.ensemble import IsolationForest

def detect_anomaly(current_units: float, user_history: list) -> dict:
    """
    Detects anomalies in electricity usage using an Isolation Forest model.
    """
    if len(user_history) < 5:
        return {
            "anomaly": False,
            "msg_key": "anomaly_low_data"
        }
    
    # Prepare dataset
    X = [[u] for u in user_history]
    
    # Train model
    model = IsolationForest(contamination=0.2, random_state=42)
    model.fit(X)
    
    # Predict
    result = model.predict([[current_units]])
    
    if result[0] == -1:
        return {
            "anomaly": True,
            "msg_key": "anomaly_detected"
        }
    else:
        return {
            "anomaly": False,
            "msg_key": "anomaly_none"
        }
