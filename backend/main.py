from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File, Request
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, case
from pydantic import BaseModel
from database import SessionLocal, engine
from models import Base, Reading, User, Alert, ApplianceUsage
from tariff import calculate_bill, check_slab_alert, get_providers_for_state
from benchmark import calculate_percentile
from scoring import calculate_score, get_badge_and_rank
from recommendation import generate_recommendations
from anomaly import detect_anomaly
from prediction import predict_consumption, predict_next_3_months
from report import generate_pdf
from auth import get_password_hash, verify_password, create_access_token, get_current_user
from address_normalizer import normalize_address
from appliance_smart import calculate_appliance_usage
from appliance_data import APPLIANCE_POWER
from advisor import generate_dynamic_advice
from carbon import calculate_carbon_metrics, router as carbon_router
from report_generator import generate_user_report
import os
import json
from fastapi.staticfiles import StaticFiles

# pyrefly: ignore [missing-import]
import pytesseract
# pyrefly: ignore [missing-import]
from PIL import Image
import re
import io

import platform
if platform.system() == "Windows":
    pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Create tables
Base.metadata.create_all(bind=engine)

import math
from datetime import datetime

# Auto-migration for user_id if table was already created
from sqlalchemy import text
with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE readings ADD COLUMN user_id INTEGER REFERENCES users(id);"))
        conn.commit()
    except Exception:
        pass 
    try:
        # Check if column exists first to avoid error spam
        conn.execute(text("ALTER TABLE users ADD COLUMN society_name VARCHAR;"))
        conn.commit()
    except Exception:
        pass
    try:
        conn.execute(text("ALTER TABLE readings ADD COLUMN city_tier VARCHAR;"))
        conn.execute(text("ALTER TABLE readings ADD COLUMN region VARCHAR;"))
        conn.execute(text("ALTER TABLE readings ADD COLUMN climate VARCHAR;"))
        conn.execute(text("ALTER TABLE readings ADD COLUMN carbon_kg FLOAT;"))
        conn.execute(text("ALTER TABLE readings ADD COLUMN green_score INTEGER;"))
        conn.execute(text("ALTER TABLE readings ADD COLUMN renewable_potential FLOAT;"))
        conn.commit()
    except Exception:
        pass

app = FastAPI(
    title="UrjaIQ API",
    description="AI-powered electricity intelligence platform for Indian households"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(carbon_router)

# Mount reports directory (using absolute path for stability)
_REPORTS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "reports")
if not os.path.exists(_REPORTS_DIR):
    os.makedirs(_REPORTS_DIR)
app.mount("/reports", StaticFiles(directory=_REPORTS_DIR), name="reports")


# -----------------------------
# AUTHENTICATION ROUTES
# -----------------------------
@app.post("/signup")
def signup(data: dict):
    db = SessionLocal()
    try:
        username = data.get("username")
        password = data.get("password")
        city = data.get("city")
        society_name = data.get("society_name")
        
        if not username or not password:
            raise HTTPException(status_code=400, detail="Username and password required")
            
        existing_user = db.query(User).filter(User.username == username).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already exists")
            
        # Hardcode first user as admin for testing if no users exist, else user
        role = "user"
        if db.query(User).count() == 0:
            role = "admin"
            
        hashed_pw = get_password_hash(password)
        new_user = User(username=username, password=hashed_pw, role=role, city=city, society_name=society_name)
        db.add(new_user)
        db.commit()
        
        return {"message": "User created successfully", "role": role}
    finally:
        db.close()

@app.post("/login")
def login(data: dict):
    db = SessionLocal()
    try:
        username = data.get("username")
        password = data.get("password")
        
        user = db.query(User).filter(User.username == username).first()
        if not user or not verify_password(password, user.password):
            raise HTTPException(status_code=401, detail="Invalid username or password")
            
        access_token = create_access_token(
            data={"sub": user.username, "user_id": user.id, "role": user.role, "city": user.city}
        )
        return {"access_token": access_token, "token_type": "bearer", "role": user.role}
    finally:
        db.close()

# -----------------------------
# POST /analyze
# -----------------------------
@app.post("/analyze")
def analyze(data: dict, current_user: dict = Depends(get_current_user)):
    db = SessionLocal()

    try:
        units = float(data["units"])
        city = data["city"]
        state = data["state"]
        household_type = data["household_type"]
        provider = data.get("provider", "default")

        # Calculate bill with provider (added DB and year)
        year = data.get("year", 2026)
        result = calculate_bill(units, state, provider, year=year, db=db)
        total_bill = result["total_bill"]
        
        # FAIL-SAFE: If bill is 0 but units > 0, use standard rate (₹7.5/unit)
        if total_bill == 0 and units > 0:
            total_bill = round(units * 7.5, 2)
            print(f"ANALYZE FAIL-SAFE: Bill set to {total_bill} for {units} units")
            
        breakdown = result["breakdown"]
        provider_used = result.get("provider_used", provider)

        # Normalize address
        normalized = normalize_address(city, state)

        # Smart Appliance Breakdown (Advanced Estimation)
        appliances_input = data.get("appliances", {})
        appliance_results = calculate_appliance_usage(appliances_input)
        appliance_data = appliance_results["breakdown"]

        # Save to database mapped to user
        new_reading = Reading(
            units=units,
            city=city,
            state=state,
            household_type=household_type,
            total_bill=total_bill,
            city_tier=normalized["city_tier"],
            region=normalized["region"],
            climate=normalized["climate"],
            user_id=current_user["user_id"]
        )

        # Carbon & Sustainability Metrics
        carbon_data = calculate_carbon_metrics(units, appliances_input, city)
        new_reading.carbon_kg = carbon_data["carbon_kg"]
        new_reading.green_score = carbon_data["green_score"]
        new_reading.renewable_potential = carbon_data["solar_recommendation"]["monthly_savings"]

        db.add(new_reading)
        db.commit()
        db.refresh(new_reading)

        # Save appliance usage to database
        for app, units in appliance_data.items():
            db.add(ApplianceUsage(
                reading_id=new_reading.id,
                user_id=current_user["user_id"],
                appliance=app,
                units=units
            ))
        db.commit()

        # Calculate percentile benchmarking
        benchmark_data = calculate_percentile(units, city, household_type, db)
        percentile = benchmark_data["percentile"]
        total_users = benchmark_data["total_users"]

        # Formulate benchmark message (keys)
        if total_users <= 1:
            benchmark_data_frontend = {"key": "benchmark_low_data"}
        else:
            if percentile > 50:
                benchmark_data_frontend = {"key": "benchmark_more", "params": {"value": percentile}}
            else:
                benchmark_data_frontend = {"key": "benchmark_less", "params": {"value": 100 - percentile}}

        # Calculate score and grade
        score_data = calculate_score(percentile)

        # Gamification: Badge and Rank
        gamification_data = get_badge_and_rank(score_data["score"], percentile)

        # Generate smart recommendations (provider-aware)
        recommendations_data = generate_recommendations(
            units=units, 
            state=state, 
            percentile=percentile, 
            total_bill=total_bill,
            provider=provider
        )

        # Anomaly Detection
        cohort_readings = db.query(Reading).filter(
            Reading.city == city,
            Reading.household_type == household_type
        ).all()
        user_history = [r.units for r in cohort_readings]
        anomaly_data = detect_anomaly(units, user_history)

        # ML Prediction (3-month forecast)
        prediction_data = predict_consumption(city, household_type, db)
        forecast_data = predict_next_3_months(city, household_type, db)
        future_predictions = forecast_data["forecast"]
        weather_factor = forecast_data["weather_factor"]
        weather_msg_key = forecast_data["weather_message_key"]

        # Slab Alert (provider-aware)
        slab_data = check_slab_alert(units, state, provider, year=year, db=db)

        # --- Generate and Save Smart Alerts (using keys) ---
        user_id = current_user["user_id"]
        response_alerts = []
        
        if units > 400:
            db.add(Alert(user_id=user_id, message="alert_high_usage", type="high_usage"))
            response_alerts.append({"type": "high_usage", "key": "alert_high_usage"})
        
        if anomaly_data["anomaly"]:
            db.add(Alert(user_id=user_id, message="alert_anomaly", type="anomaly"))
            response_alerts.append({"type": "anomaly", "key": "alert_anomaly"})
            
        if slab_data["slab_alert"]:
            db.add(Alert(user_id=user_id, message="alert_slab_cross", type="slab"))
            response_alerts.append({
                "type": "slab", 
                "key": "alert_slab_cross", 
                "params": slab_data.get("params")
            })
            
        db.commit()

        final_response = {
            "message": "Saved successfully",
            "units": units,
            "total_bill": total_bill,
            "breakdown": breakdown,
            "percentile": percentile,
            "benchmark": benchmark_data_frontend,
            "score": score_data["score"],
            "grade": score_data["grade"],
            "badge_key": gamification_data["badge_key"],
            "rank_key": gamification_data["rank_key"],
            "tips": recommendations_data["tips"],
            "anomaly": anomaly_data["anomaly"],
            "anomaly_msg_key": anomaly_data["msg_key"],
            "predicted_units": prediction_data.get("predicted_units"),
            "future_predictions": future_predictions,
            "weather_factor": weather_factor,
            "weather_msg_key": weather_msg_key,
            "slab_alert": slab_data["slab_alert"],
            "slab_msg_key": slab_data["msg_key"],
            "slab_params": slab_data.get("params"),
            "city_tier": normalized["city_tier"],
            "region": normalized["region"],
            "climate": normalized["climate"],
            "appliance_breakdown": appliance_data,
            "provider": provider_used,
            "fixed_charge": result.get("fixed_charge", 0),
            "tax": result.get("tax", 0),
            "subtotal": result.get("subtotal", 0),
            "alerts": response_alerts,
            "carbon_kg": carbon_data["carbon_kg"],
            "green_score": carbon_data["green_score"],
            "solar_recommendation": carbon_data["solar_recommendation"]
        }
        
        print("Final API Response:", json.dumps(final_response, indent=2))
        return final_response

    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Missing field: {e}")
    except Exception as e:
        print(f"Analyze Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.get("/generate-report")
def get_report(request: Request, current_user: dict = Depends(get_current_user)):
    print(f"DEBUG: /generate-report CALLED BY USER {current_user.get('user_id')}")
    try:
        base_url = str(request.base_url).rstrip("/")
        filename = generate_user_report(current_user["user_id"], base_url=base_url)
        if not filename:
            raise HTTPException(status_code=500, detail="Report generation failed — no consumption data found.")
        pdf_url = f"{base_url}/reports/{filename}"
        
        # WhatsApp Share Logic with Success Flag
        msg = f"⚡ My UrjaIQ AI Energy Report\n\nView my full AI energy analysis:\n{pdf_url}\n\nGenerated by UrjaIQ — India's AI Energy Platform"
        from urllib.parse import quote
        whatsapp_url = f"https://wa.me/?text={quote(msg)}"
        
        return {
            "success": True,
            "pdf_url": pdf_url,
            "whatsapp_url": whatsapp_url,
            "filename": filename
        }
    except Exception as e:
        print(f"Report Generation Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# -----------------------------
# GET /providers
# -----------------------------
@app.get("/providers")
def get_providers(state: str):
    """Returns available electricity providers for a given state."""
    return {"providers": get_providers_for_state(state)}

class AdvisorRequest(BaseModel):
    query: str
    units: float
    bill: float
    percentile: float
    city: str = ""
    state: str = ""
    household_type: str = ""
    appliances: dict = {}

@app.post("/advisor")
def get_advisor_response(req: AdvisorRequest, current_user: dict = Depends(get_current_user)):
    try:
        context = {
            "units": req.units,
            "bill": req.bill,
            "percentile": req.percentile,
            "city": req.city,
            "state": req.state,
            "household_type": req.household_type,
            "appliances": req.appliances
        }
        response_text = generate_dynamic_advice(req.query, context)
        return {"response": response_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -----------------------------
# GET /readings (User Specific)
# -----------------------------
@app.get("/readings")
def get_readings(current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        data = db.query(Reading).filter(Reading.user_id == current_user["user_id"]).order_by(Reading.id.desc()).limit(10).all()
        return [
            {
                "id": r.id,
                "units": r.units,
                "city": r.city,
                "state": r.state,
                "household_type": r.household_type,
                "total_bill": r.total_bill,
                "created_at": r.created_at
            }
            for r in data
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

# -----------------------------
# GET /history (User Full History ASC)
# -----------------------------
@app.get("/history")
def get_user_history(current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        data = db.query(Reading).filter(Reading.user_id == current_user["user_id"]).order_by(Reading.created_at.asc()).all()
        return [
            {
                "units": r.units,
                "total_bill": r.total_bill,
                "created_at": r.created_at
            }
            for r in data
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

# -----------------------------
# GET /society/dashboard
# -----------------------------
@app.get("/society/dashboard")
def get_society_dashboard(current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        user_obj = db.query(User).filter(User.id == current_user["user_id"]).first()
        if not user_obj or not user_obj.society_name:
            return {"society": None, "users": [], "avg_units": 0}
            
        society_name = user_obj.society_name
        
        # Get all users in same society
        society_users = db.query(User).filter(User.society_name == society_name).all()
        
        user_stats = []
        total_society_units = 0
        readings_count = 0
        
        for u in society_users:
            # Get latest reading and avg
            readings = db.query(Reading).filter(Reading.user_id == u.id).all()
            if readings:
                avg_u = sum(r.units for r in readings) / len(readings)
                latest_u = readings[-1].units
                user_stats.append({
                    "username": u.username,
                    "avg_units": round(avg_u, 1),
                    "latest_units": latest_u
                })
                total_society_units += avg_u
                readings_count += 1
            else:
                user_stats.append({
                    "username": u.username,
                    "avg_units": 0,
                    "latest_units": 0
                })

        # Sort by avg usage (ascending = rank 1 is lowest usage)
        user_stats.sort(key=lambda x: x["avg_units"] if x["avg_units"] > 0 else 999999)
        
        # Add rank
        for i, stat in enumerate(user_stats):
            stat["rank"] = i + 1

        society_avg = round(total_society_units / readings_count, 1) if readings_count > 0 else 0

        return {
            "society": society_name,
            "avg_units": society_avg,
            "users": user_stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

# -----------------------------
# GET /city/insights
# -----------------------------
@app.get("/city/insights")
def get_city_insights():
    db = SessionLocal()
    try:
        normalized_city = func.lower(func.trim(Reading.city))
        
        results = db.query(
            normalized_city.label("normalized_city"),
            func.avg(Reading.units).label("avg_units"),
            func.avg(Reading.carbon_kg).label("avg_carbon"),
            func.count(Reading.id).label("total_users"),
            func.sum(case((Reading.units > 400, 1), else_=0)).label("high_usage_count")
        ).group_by(normalized_city).all()

        city_stats = []
        for city_lower, avg_units, avg_carbon, total_users, high_usage_count in results:
            city_display = city_lower.title() if city_lower else "Unknown"
            high_usage_count = high_usage_count or 0
            high_usage_percent = round((high_usage_count / total_users) * 100, 1) if total_users > 0 else 0
            
            city_stats.append({
                "city": city_display,
                "avg_units": round(avg_units, 1) if avg_units else 0,
                "avg_carbon": round(avg_carbon, 1) if avg_carbon else 0,
                "users": total_users,
                "high_usage_percent": high_usage_percent
            })

        # Sort by avg usage descending
        city_stats.sort(key=lambda x: x["avg_units"], reverse=True)

        return city_stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

# -----------------------------
# GET /admin/readings (Global)
# -----------------------------
@app.get("/admin/readings")
def get_admin_readings(city: str = None, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
        
    db = SessionLocal()
    try:
        query = db.query(Reading)
        if city:
            query = query.filter(Reading.city.ilike(f"%{city}%"))
            
        data = query.order_by(Reading.id.desc()).all()
        return [
            {
                "id": r.id,
                "user_id": r.user_id,
                "units": r.units,
                "city": r.city,
                "state": r.state,
                "household_type": r.household_type,
                "total_bill": r.total_bill,
                "created_at": r.created_at
            }
            for r in data
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

# -----------------------------
# GET /admin/stats
# -----------------------------
@app.get("/admin/stats")
def get_admin_stats(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
        
    db = SessionLocal()
    try:
        total_users = db.query(User).count()
        total_readings = db.query(Reading).count()
        high_usage_count = db.query(Reading).filter(Reading.units > 200).count()
        
        city_stats_query = db.query(
            Reading.city, 
            func.avg(Reading.units).label('avg_units'),
            func.avg(Reading.total_bill).label('avg_bill')
        ).group_by(Reading.city).all()
        
        city_stats = [
            {
                "city": row[0],
                "avg_units": round(row[1], 2) if row[1] else 0,
                "avg_bill": round(row[2], 2) if row[2] else 0
            }
            for row in city_stats_query
        ]
        
        return {
            "total_users": total_users,
            "total_readings": total_readings,
            "high_usage_count": high_usage_count,
            "city_stats": city_stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

# -----------------------------
# POST /report
# -----------------------------
@app.post('/report')
def generate_report_post(current_user: dict = Depends(get_current_user)):
    """Legacy POST /report — delegates to generate_user_report"""
    try:
        # Default base_url for legacy POST if request is not available
        filename = generate_user_report(current_user["user_id"])
        if not filename:
            raise HTTPException(status_code=500, detail="Report generation failed")
        filepath = os.path.join(_REPORTS_DIR, filename)
        return FileResponse(
            path=filepath, 
            filename=filename, 
            media_type='application/pdf'
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -----------------------------
# GET /comparison
# -----------------------------
@app.get("/comparison")
def get_comparison(current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        user_id = current_user["user_id"]
        city = current_user.get("city", "")

        user_avg = db.query(func.avg(Reading.units)).filter(Reading.user_id == user_id).scalar() or 0
        city_avg = db.query(func.avg(Reading.units)).filter(Reading.city == city).scalar() or 0
        national_avg = db.query(func.avg(Reading.units)).scalar() or 0

        return {
            "user_avg": round(user_avg, 2),
            "city_avg": round(city_avg, 2),
            "national_avg": round(national_avg, 2)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

# -----------------------------
# POST /upload-bill (OCR Pipeline)
# -----------------------------
@app.post("/upload-bill")
async def upload_bill(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    try:
        contents = await file.read()

        # --- Step 1: Preprocess for better OCR ---
        image = Image.open(io.BytesIO(contents))
        image = image.convert("L")  # Grayscale

        # --- Step 2: OCR extraction ---
        raw_text = pytesseract.image_to_string(image)
        print("=" * 50)
        print("OCR RAW TEXT:\n", raw_text)
        print("=" * 50)

        extracted_units = None

        # --- Step 3: Priority regex patterns (Indian bill formats) ---
        patterns = [
            (r'(\d+(?:\.\d+)?)\s*[kK][wW][hH]',                    "kWh suffix"),
            (r'[Uu]nits?\s+[Cc]onsumed\s*[:\-]?\s*(\d+(?:\.\d+)?)', "Units Consumed"),
            (r'[Ee]nergy\s+[Cc]onsumed\s*[:\-]?\s*(\d+(?:\.\d+)?)', "Energy Consumed"),
            (r'[Cc]urrent\s+[Cc]onsumption\s*[:\-]?\s*(\d+(?:\.\d+)?)', "Current Consumption (MSEDCL)"),
            (r'[Cc]onsumed\s*[:\-]?\s*(\d+(?:\.\d+)?)',              "Consumed label"),
            (r'[Cc]onsumption\s*[:\-]?\s*(\d+(?:\.\d+)?)',           "Consumption label"),
            (r'[Tt]otal\s+[Uu]nits?\s*[:\-]?\s*(\d+(?:\.\d+)?)',    "Total Units"),
            (r'[Nn]et\s+[Uu]nits?\s*[:\-]?\s*(\d+(?:\.\d+)?)',      "Net Units"),
            (r'[Uu]nits?\s*[:\-]?\s*(\d+(?:\.\d+)?)',                "Units label"),
            (r'[Ee]nergy\s+[Uu]sed\s*[:\-]?\s*(\d+(?:\.\d+)?)',     "Energy Used"),
        ]

        for pattern, label in patterns:
            match = re.search(pattern, raw_text)
            if match:
                val = float(match.group(1))
                if 1 < val < 9999:
                    extracted_units = val
                    print(f"[REGEX MATCH] {label} → {val}")
                    break

        # --- Step 4: Gujarat meter-reading difference fallback ---
        # Gujarat bills (Torrent/PGVCL) show prev + current reading; units = difference
        if extracted_units is None:
            all_numbers = re.findall(r'\b(\d{2,5})\b', raw_text)
            numbers = [int(n) for n in all_numbers if 10 < int(n) < 99999]
            print(f"[NUMBERS FOUND]: {numbers}")

            for i in range(len(numbers) - 1):
                diff = abs(numbers[i] - numbers[i + 1])
                if 20 < diff < 800:
                    extracted_units = float(diff)
                    print(f"[METER DIFF] {numbers[i]} - {numbers[i+1]} = {diff}")
                    break

        # --- Step 5: Smart numeric fallback ---
        if extracted_units is None:
            all_numbers = re.findall(r'\b(\d+)\b', raw_text)
            probable = [int(n) for n in all_numbers if 20 < int(n) < 800]
            print(f"[FALLBACK PROBABLES]: {probable}")
            if probable:
                extracted_units = float(probable[0])
                print(f"[FALLBACK CHOSEN]: {extracted_units}")

        # --- Step 6: Structured response ---
        if extracted_units is not None:
            return {
                "extracted_units": extracted_units,
                "raw_text": raw_text,
                "message": f"Successfully extracted {extracted_units} units."
            }
        else:
            return {
                "extracted_units": None,
                "raw_text": raw_text,
                "message": "Units not detected. Please enter manually."
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")

# -----------------------------
# GET /alerts
# -----------------------------
@app.get("/alerts")
def get_alerts(current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        alerts = (
            db.query(Alert)
            .filter(Alert.user_id == current_user["user_id"])
            .order_by(Alert.created_at.desc())
            .limit(20)
            .all()
        )
        return [
            {
                "id": a.id,
                "message": a.message,
                "type": a.type,
                "created_at": a.created_at
            }
            for a in alerts
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

# -----------------------------
# GET /society-dashboard
# -----------------------------
@app.get("/society-dashboard")
def get_society_dashboard(current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        user_id = current_user["user_id"]
        # Fetch the full user object to get society_name
        user_obj = db.query(User).filter(User.id == user_id).first()
        if not user_obj or not user_obj.society_name:
            return []  # No society assigned

        society_name = user_obj.society_name

        # Fetch all users in same society
        society_users = db.query(User).filter(User.society_name == society_name).all()

        dashboard_data = []
        for u in society_users:
            avg_units = db.query(func.avg(Reading.units)).filter(Reading.user_id == u.id).scalar()
            # Only include users who have at least one reading
            if avg_units is not None:
                dashboard_data.append({
                    "username": u.username,
                    "avg_units": round(float(avg_units), 2),
                    "is_current_user": u.id == user_id,
                    "user_id": u.id
                })

        # If current user has no readings yet, still include them
        current_user_in_list = any(d["user_id"] == user_id for d in dashboard_data)
        if not current_user_in_list:
            dashboard_data.append({
                "username": user_obj.username,
                "avg_units": 0,
                "is_current_user": True,
                "user_id": user_id
            })

        # Sort by avg_units ascending (lowest usage = best rank = rank 1)
        dashboard_data.sort(key=lambda x: x["avg_units"])

        # Compute rank server-side
        user_rank = next((i + 1 for i, d in enumerate(dashboard_data) if d["is_current_user"]), 0)

        # Remove internal user_id field before returning
        for d in dashboard_data:
            d.pop("user_id", None)

        total_users = len(dashboard_data)
        avg_all = round(sum(d["avg_units"] for d in dashboard_data) / total_users, 2) if total_users else 0

        return {
            "society_name": society_name,
            "users": dashboard_data,
            "user_rank": user_rank,
            "total_users": total_users,
            "avg_units": avg_all
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

# Trigger reload
