from sklearn.ensemble import RandomForestRegressor
from sqlalchemy.orm import Session
from models import Reading

def predict_consumption(city: str, household_type: str, db: Session) -> dict:
    """
    Trains a Random Forest model on historical data to predict the expected
    electricity consumption based on city and household type.
    """
    readings = db.query(Reading).all()
    
    if len(readings) < 10:
        return {
            "predicted_units": None,
            "message": "Not enough data for prediction"
        }
        
    # Dynamically encode categorical features
    unique_cities = list(set(r.city for r in readings))
    city_map = {c: i for i, c in enumerate(unique_cities)}
    
    unique_types = list(set(r.household_type for r in readings))
    type_map = {t: i for i, t in enumerate(unique_types)}
    
    X = []
    y = []
    
    for r in readings:
        X.append([city_map[r.city], type_map[r.household_type]])
        y.append(r.units)
        
    # Train the Random Forest Regressor
    model = RandomForestRegressor(n_estimators=50, random_state=42)
    model.fit(X, y)
    
    # Encode current inputs (safely fallback to 0 if an edge case creates a miss)
    city_encoded = city_map.get(city, 0)
    type_encoded = type_map.get(household_type, 0)
    
    # Predict
    predicted_units = model.predict([[city_encoded, type_encoded]])[0]
    
    return {
        "predicted_units": round(predicted_units, 2)
    }

from weather import get_temperature_factor, get_weather_message_key

def predict_next_3_months(city, household_type, db: Session):
    readings = db.query(Reading).filter(
        Reading.city == city,
        Reading.household_type == household_type
    ).order_by(Reading.created_at.desc()).limit(6).all()

    if len(readings) < 3:
        # Fallback to general average if not enough cohort data
        readings = db.query(Reading).order_by(Reading.created_at.desc()).limit(6).all()
        if len(readings) < 3:
            return {"forecast": [], "weather_factor": 1.0, "weather_message_key": "weather_normal_info"}

    values = [r.units for r in readings]
    avg = sum(values) / len(values)

    factor = get_temperature_factor(city)

    predictions = [
        round(avg * factor, 2),
        round(avg * factor * 1.02, 2),
        round(avg * factor * 1.04, 2)
    ]

    return {
        "forecast": [
            {"month_key": "forecast_month_1", "units": predictions[0]},
            {"month_key": "forecast_month_2", "units": predictions[1]},
            {"month_key": "forecast_month_3", "units": predictions[2]}
        ],
        "weather_factor": factor,
        "weather_message_key": get_weather_message_key(city)
    }
