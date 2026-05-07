from appliance_data import APPLIANCE_POWER

def calculate_appliance_usage(appliances):
    total_units = 0
    breakdown = {}

    for name, data in appliances.items():
        # Handle both formats for backward compatibility if needed, 
        # but user request specifies count and hours
        if isinstance(data, dict):
            count = data.get("count", 0)
            hours = data.get("hours", 0)
        else:
            # Fallback for old count-only format
            count = data
            hours = 1 # default 1 hour if not specified

        power = APPLIANCE_POWER.get(name, 0)

        # Formula: (Watts * count * hours * 30 days) / 1000
        units = (power * count * hours * 30) / 1000

        breakdown[name] = round(units, 2)
        total_units += units

    return {
        "total_units": round(total_units, 2),
        "breakdown": breakdown
    }
