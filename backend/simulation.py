from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from tariff import calculate_bill
from database import SessionLocal
import math

router = APIRouter(prefix="/simulation", tags=["Energy Digital Twin"])

class SimulationRequest(BaseModel):
    monthly_units: float
    city: str
    state: str
    provider: str
    ac_reduction_percent: float = 0
    solar_installed: bool = False
    led_upgrade: bool = False
    five_star_appliances: bool = False
    extra_unit_reduction: float = 0  # Direct manual reduction from slider

@router.post("/simulate")
async def simulate_energy(req: SimulationRequest):
    db = SessionLocal()
    try:
        print(f"SIMULATION START: units={req.monthly_units}, state={req.state}, provider={req.provider}")
        # 1. Calculate Current Bill (Baseline)
        current_res = calculate_bill(req.monthly_units, req.state, req.provider, db=db)
        current_bill = current_res["total_bill"]
        
        # FAIL-SAFE: If bill is 0 but units > 0, use a standard rate of ₹7/unit
        if current_bill == 0 and req.monthly_units > 0:
            current_bill = round(req.monthly_units * 7.5, 2)
            print(f"FAIL-SAFE TRIGGERED: baseline_bill set to {current_bill}")
        
        print(f"BASELINE BILL: {current_bill}")
        
        # 2. Simulation Logic (Unit Reductions applied to OPTIMIZED path only)
        reduced_units = req.monthly_units
        
        # Manual usage reduction slider
        if req.extra_unit_reduction > 0:
            reduced_units -= req.extra_unit_reduction
        
        # AC Reduction (AC is typically 40% of usage in residential)
        ac_impact = (req.monthly_units * 0.40) * (req.ac_reduction_percent / 100)
        reduced_units -= ac_impact
        
        # LED Upgrade (Lighting is ~10% of usage, LEDs save 80% of that)
        if req.led_upgrade:
            led_impact = req.monthly_units * 0.08
            reduced_units -= led_impact
            
        # 5-Star Appliances (Saves ~15% on non-AC appliances)
        if req.five_star_appliances:
            appliance_impact = (req.monthly_units * 0.40) * 0.15 # 40% is other appliances
            reduced_units -= appliance_impact
            
        # Solar Simulation
        solar_offset_percent = 0
        payback_years = 0
        if req.solar_installed:
            # Solar offset usually ranges from 30% to 50% for standard rooftop
            solar_offset_percent = 35 if req.monthly_units > 300 else 25
            solar_impact = reduced_units * (solar_offset_percent / 100)
            reduced_units -= solar_impact
            payback_years = 4.5 # Standard estimate for residential solar in India
            
        # Ensure units don't go negative
        reduced_units = max(reduced_units, 0)
        
        # 3. Calculate Optimized Bill
        optimized_res = calculate_bill(reduced_units, req.state, req.provider, db=db)
        optimized_bill = optimized_res["total_bill"]
        
        # FAIL-SAFE: If optimized bill is 0 but units > 0, use standard rate
        if optimized_bill == 0 and reduced_units > 0:
            optimized_bill = round(reduced_units * 7.5, 2)
            print(f"FAIL-SAFE TRIGGERED: optimized_bill set to {optimized_bill}")
            
        print(f"OPTIMIZED BILL: {optimized_bill}, units={reduced_units}")
        
        # 4. Impact Metrics
        units_saved = round(req.monthly_units - reduced_units, 1)
        monthly_savings = round(current_bill - optimized_bill, 2)
        yearly_savings = round(monthly_savings * 12, 2)
        
        # Carbon Impact (0.82 factor)
        carbon_before = req.monthly_units * 0.82
        carbon_after = reduced_units * 0.82
        carbon_reduction = round(carbon_before - carbon_after, 1)
        trees_saved = round(carbon_reduction / 21)
        
        # Green Score Logic (Consistent with carbon.py)
        def get_green_score(co2):
            if co2 < 250: return 95
            if co2 < 400: return 82
            if co2 < 600: return 65
            if co2 < 800: return 42
            return 28
            
        score_before = get_green_score(carbon_before)
        score_after = get_green_score(carbon_after)
        
        # 5. AI Summary Generation
        summary = f"By implementing these changes, you can reduce your grid dependency by {units_saved} units. "
        if req.solar_installed:
            summary += f"Solar alone contributes {solar_offset_percent}% offset. "
        summary += f"This saves you ₹{yearly_savings:,} annually and offsets {carbon_reduction}kg of CO₂."

        return {
            "current_bill": current_bill,
            "optimized_bill": optimized_bill,
            "monthly_savings": monthly_savings,
            "yearly_savings": yearly_savings,
            "units_saved": units_saved,
            "carbon_reduction": carbon_reduction,
            "trees_saved": trees_saved,
            "green_score_before": score_before,
            "green_score_after": score_after,
            "solar_offset_percent": solar_offset_percent,
            "payback_years": payback_years if req.solar_installed else 0,
            "ai_summary": summary,
            "optimized_units": round(reduced_units, 1)
        }

    except Exception as e:
        print(f"SIMULATION ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()
