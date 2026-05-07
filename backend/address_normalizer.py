METRO = ["mumbai", "delhi", "bangalore", "ahmedabad", "pune"]
TIER_2 = ["surat", "vadodara", "nagpur", "indore", "jaipur"]

REGION_MAP = {
    "gujarat": "west",
    "maharashtra": "west",
    "delhi": "north"
}

def get_climate(state):
    if state.lower() in ["gujarat", "rajasthan"]:
        return "hot"
    elif state.lower() in ["himachal", "uttarakhand"]:
        return "cold"
    return "moderate"

def normalize_address(city, state):
    city_lower = city.lower()
    state_lower = state.lower()

    if city_lower in METRO:
        tier = "metro"
    elif city_lower in TIER_2:
        tier = "tier2"
    else:
        tier = "tier3"

    region = REGION_MAP.get(state_lower, "unknown")
    climate = get_climate(state)

    return {
        "city_tier": tier,
        "region": region,
        "climate": climate
    }
