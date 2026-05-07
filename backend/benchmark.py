from sqlalchemy.orm import Session
from models import Reading

def calculate_percentile(units: float, city: str, household_type: str, db: Session) -> dict:
    # 1. Fetch filtered readings
    readings = db.query(Reading).filter(
        Reading.city == city,
        Reading.household_type == household_type
    ).all()

    # 2. Fallback if less than 5 records
    if len(readings) < 5:
        readings = db.query(Reading).all()

    total_users = len(readings)

    # 3. Handle edge case: No data at all (shouldn't happen if they just saved, but just in case)
    if total_users == 0:
        return {
            "percentile": 50,
            "total_users": 0
        }

    # 4. Count how many users have lower units
    count_lower = sum(1 for r in readings if r.units < units)

    # 5. Compute percentile
    percentile = (count_lower / total_users) * 100

    return {
        "percentile": round(percentile),
        "total_users": total_users
    }
