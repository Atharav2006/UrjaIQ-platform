from models import Tariff
from tariff_config import TARIFFS, PROVIDERS_BY_STATE

def calculate_bill(units, state, provider, year=2026, db=None):
    if not db:
        return calculate_bill_static(units, state, provider)

    # Fetch tariffs from DB
    tariffs = db.query(Tariff).filter(
        Tariff.state == state,
        Tariff.provider == provider,
        Tariff.year == year
    ).all()

    provider_used = provider
    if not tariffs:
        # Try fallback provider "default"
        tariffs = db.query(Tariff).filter(
            Tariff.state == state,
            Tariff.provider == "default",
            Tariff.year == year
        ).all()
        provider_used = "default"

    if not tariffs:
        return calculate_bill_static(units, state, provider)

    # Sort tariffs: slab_limit 'rest' should be last
    def slab_sort_key(t):
        try:
            return int(t.slab_limit)
        except ValueError:
            return float('inf')

    sorted_tariffs = sorted(tariffs, key=slab_sort_key)

    remaining_units = units
    slab_total = 0.0
    breakdown = []
    previous_max = 0

    for t in sorted_tariffs:
        if remaining_units <= 0:
            break
        
        try:
            slab_max = float(t.slab_limit)
        except ValueError:
            slab_max = float('inf')
            
        slab_size = slab_max - previous_max
        units_in_slab = min(remaining_units, slab_size)
        cost = units_in_slab * t.rate
        
        slab_total += cost
        remaining_units -= units_in_slab
        
        if slab_max == float('inf'):
            slab_label = f"{previous_max + 1}-Above"
        else:
            label_start = int(previous_max) if previous_max == 0 else int(previous_max + 1)
            slab_label = f"{label_start}-{int(slab_max)}"
            
        breakdown.append({
            "slab": slab_label,
            "units": round(units_in_slab, 2),
            "rate": t.rate,
            "cost": round(cost, 2)
        })
        previous_max = slab_max if slab_max != float('inf') else previous_max

    # Fixed charges and tax
    first_tariff = sorted_tariffs[0]
    fixed = first_tariff.fixed_charge
    tax_percent = first_tariff.tax_percent
    
    subtotal = slab_total + fixed
    tax = subtotal * (tax_percent / 100)
    total_bill = subtotal + tax
    
    return {
        "total_bill": round(total_bill, 2),
        "fixed_charge": round(fixed, 2),
        "tax": round(tax, 2),
        "subtotal": round(subtotal, 2),
        "breakdown": breakdown,
        "provider_used": provider_used
    }

def calculate_bill_static(units: float, state: str, provider: str = "default") -> dict:
    state_lookup = state.title()
    state_data = TARIFFS.get(state_lookup)
    print(f"STATIC LOOKUP: state={state_lookup}, found={state_data is not None}")

    if not state_data:
        print(f"ERROR: State '{state_lookup}' not found in TARIFFS keys: {list(TARIFFS.keys())}")
        raise ValueError(f"State '{state}' is not supported yet.")

    slabs = state_data.get(provider) or state_data.get("default")
    print(f"SLABS FOUND: provider={provider}, count={len(slabs) if slabs else 0}")

    if not slabs:
        raise ValueError(f"No tariff data found for state='{state}', provider='{provider}'")

    remaining_units = units
    total_bill = 0.0
    breakdown = []
    previous_max = 0

    for slab in slabs:
        if remaining_units <= 0:
            break

        slab_max = slab["max"]
        slab_size = slab_max - previous_max

        units_in_slab = min(remaining_units, slab_size)
        cost = units_in_slab * slab["rate"]

        total_bill += cost
        remaining_units -= units_in_slab

        if slab_max == float('inf'):
            slab_label = f"{previous_max + 1}-Above"
        else:
            if previous_max == 0:
                slab_label = f"0-{slab_max}"
            else:
                slab_label = f"{previous_max + 1}-{slab_max}"

        breakdown.append({
            "slab": slab_label,
            "units": round(units_in_slab, 2),
            "rate": slab["rate"],
            "cost": round(cost, 2)
        })

        previous_max = slab_max if slab_max != float('inf') else previous_max

    return {
        "total_bill": round(total_bill, 2),
        "fixed_charge": 0,
        "tax": 0,
        "subtotal": round(total_bill, 2),
        "breakdown": breakdown,
        "provider_used": provider if state_data.get(provider) else "default"
    }

def check_slab_alert(units, state, provider, year=2026, db=None):
    if not db:
        return check_slab_alert_static(units, state, provider)

    tariffs = db.query(Tariff).filter(
        Tariff.state == state,
        Tariff.provider == provider,
        Tariff.year == year
    ).all()

    if not tariffs:
        tariffs = db.query(Tariff).filter(
            Tariff.state == state,
            Tariff.provider == "default",
            Tariff.year == year
        ).all()

    if not tariffs:
        return check_slab_alert_static(units, state, provider)

    def slab_sort_key(t):
        try:
            return int(t.slab_limit)
        except ValueError:
            return float('inf')

    sorted_tariffs = sorted(tariffs, key=slab_sort_key)

    for t in sorted_tariffs:
        try:
            slab_max = float(t.slab_limit)
        except ValueError:
            slab_max = float('inf')

        if slab_max > units:
            if slab_max == float('inf'):
                break
            diff = round(slab_max - units, 1)
            if diff <= 10:
                return {
                    "slab_alert": True,
                    "msg_key": "slab_alert_near",
                    "params": {"limit": int(slab_max), "diff": diff}
                }
            break

    return {
        "slab_alert": False,
        "msg_key": "slab_safe"
    }

def check_slab_alert_static(units: float, state: str, provider: str = "default") -> dict:
    state_lookup = state.title()
    state_data = TARIFFS.get(state_lookup)

    if not state_data:
        return {"slab_alert": False, "msg_key": "state_not_supported"}

    slabs = state_data.get(provider) or state_data.get("default")

    for slab in slabs:
        slab_max = slab["max"]
        if slab_max > units:
            if slab_max == float('inf'):
                break
            diff = round(slab_max - units, 1)
            if diff <= 10:
                return {
                    "slab_alert": True,
                    "msg_key": "slab_alert_near",
                    "params": {"limit": slab_max, "diff": diff}
                }
            break

    return {
        "slab_alert": False,
        "msg_key": "slab_safe"
    }

def get_providers_for_state(state: str) -> list:
    return PROVIDERS_BY_STATE.get(state.title(), ["default"])
