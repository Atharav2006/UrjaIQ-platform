from fastapi import APIRouter, Depends
from sqlalchemy import func, text
from database import SessionLocal, engine
from models import Reading, ApplianceUsage
from auth import get_current_user
import math
from datetime import datetime

router = APIRouter(prefix="/carbon", tags=["Carbon Intelligence"])

@router.get("/insights")
async def get_carbon_insights(current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        user_id = current_user["user_id"]
        city = current_user.get("city", "Ahmedabad")
        
        # 1. Fetch latest reading
        latest = db.query(Reading).filter(Reading.user_id == user_id).order_by(Reading.id.desc()).first()
        
        # 2. Base Fallback Data (Smart & Realistic)
        if not latest:
            # Generate realistic progression for demo
            months = ["Jan", "Feb", "Mar", "Apr", "May"]
            trend = [
                {"month": "Jan", "co2": 410.5},
                {"month": "Feb", "co2": 435.2},
                {"month": "Mar", "co2": 390.8},
                {"month": "Apr", "co2": 460.0},
                {"month": "May", "co2": 520.4}
            ]
            appliances = [
                {"name": "Air Conditioner", "co2": 220.5},
                {"name": "Refrigerator", "co2": 80.2},
                {"name": "Washing Machine", "co2": 45.0}
            ]
            return {
                "total_co2": 520.4,
                "trees_saved": 25,
                "green_score": 55,
                "carbon_status": "High Consumption",
                "sustainability_badge": "Carbon Optimizer",
                "city_average_co2": 490.0,
                "user_vs_city_percent": 6.2,
                "monthly_trend": trend,
                "appliance_impact": appliances,
                "city_name": city,
                "status": "demo"
            }

        # 3. Real Calculations
        units = latest.units
        total_co2 = round(units * 0.82, 2)
        trees_saved = round(total_co2 / 21)
        
        # 4. Green Score System (Step 6)
        if total_co2 < 250:
            green_score = 95
            carbon_status = "Excellent"
            badge = "Eco Warrior"
        elif total_co2 < 400:
            green_score = 82
            carbon_status = "Good"
            badge = "Sustainability Hero"
        elif total_co2 < 600:
            green_score = 65
            carbon_status = "Average"
            badge = "Energy Observer"
        elif total_co2 < 800:
            green_score = 42
            carbon_status = "High Consumption"
            badge = "Carbon Optimizer"
        else:
            green_score = 28
            carbon_status = "Critical"
            badge = "Green Home" # Replaced based on user list order or logic

        # 5. City Comparison (Step 11)
        avg_units = db.query(func.avg(Reading.units)).filter(Reading.city == latest.city).scalar()
        avg_units = float(avg_units) if avg_units else units
        city_avg_co2 = round(avg_units * 0.82, 2)
        
        user_vs_city_percent = 0
        if city_avg_co2 > 0:
            user_vs_city_percent = round(((total_co2 - city_avg_co2) / city_avg_co2) * 100, 1)

        # 6. Monthly Trend (Step 9)
        if "postgresql" in str(engine.url):
            month_func = func.to_char(Reading.created_at, 'MM')
        else:
            month_func = func.strftime('%m', Reading.created_at)

        trend_query = db.query(
            month_func.label('m_num'),
            func.avg(Reading.units).label('avg_units')
        ).filter(Reading.user_id == user_id).group_by('m_num').order_by('m_num').limit(6).all()
        
        months_map = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        monthly_trend = []
        for t in trend_query:
            try:
                m_idx = int(t.m_num) - 1
                monthly_trend.append({
                    "month": months_map[m_idx],
                    "co2": round(float(t.avg_units) * 0.82, 1)
                })
            except: continue
            
        if not monthly_trend:
            # Progression fallback for single reading
            monthly_trend = [{"month": months_map[datetime.utcnow().month-1], "co2": total_co2}]

        # 7. Appliance Impact (Step 10)
        appliance_query = db.query(
            ApplianceUsage.appliance,
            func.sum(ApplianceUsage.units).label('total_units')
        ).filter(ApplianceUsage.user_id == user_id).group_by(ApplianceUsage.appliance).all()
        
        appliance_impact = []
        for row in appliance_query:
            appliance_impact.append({
                "name": row.appliance.replace("_", " ").title(),
                "co2": round(float(row.total_units) * 0.82, 1)
            })

        if not appliance_impact:
            # Estimate if no direct data (Step 10 Requirement)
            appliance_impact = [
                {"name": "Air Conditioner", "co2": round(total_co2 * 0.45, 1)},
                {"name": "Refrigerator", "co2": round(total_co2 * 0.15, 1)},
                {"name": "Lights & Fans", "co2": round(total_co2 * 0.10, 1)},
                {"name": "Others", "co2": round(total_co2 * 0.30, 1)}
            ]

        return {
            "total_co2": total_co2,
            "trees_saved": trees_saved,
            "green_score": green_score,
            "carbon_status": carbon_status,
            "sustainability_badge": badge,
            "city_average_co2": city_avg_co2,
            "user_vs_city_percent": user_vs_city_percent,
            "monthly_trend": monthly_trend,
            "appliance_impact": appliance_impact,
            "city_name": latest.city,
            "status": "live"
        }
        
    except Exception as e:
        print(f"CARBON REBUILD ERROR: {e}")
        return {
            "total_co2": 0, "trees_saved": 0, "green_score": 0,
            "carbon_status": "Unknown", "sustainability_badge": "Energy Observer",
            "city_average_co2": 0, "user_vs_city_percent": 0,
            "monthly_trend": [], "appliance_impact": []
        }
    finally:
        db.close()

def calculate_carbon_metrics(units: float, appliances: dict, city: str):
    # Backward compatibility for /analyze
    co2 = round(units * 0.82, 2)
    return {
        "carbon_kg": co2,
        "green_score": 75 if co2 < 400 else 40,
        "solar_recommendation": {"monthly_savings": round(units * 0.45, 2)}
    }
