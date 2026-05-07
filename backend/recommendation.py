import random
from tariff_config import TARIFFS

# Tip pools (keys)
HIGH_USAGE_TIPS = ["tip_high_usage_1", "tip_high_usage_2", "tip_high_usage_3"]
MODERATE_USAGE_TIPS = ["tip_moderate_1", "tip_moderate_2", "tip_moderate_3"]
HIGH_PERCENTILE_TIPS = ["tip_high_percentile_1", "tip_high_percentile_2", "tip_high_percentile_3"]
AVG_PERCENTILE_TIPS = ["tip_avg_percentile_1", "tip_avg_percentile_2", "tip_avg_percentile_3"]
SLAB_ALERT_TIPS = ["tip_slab_alert_1", "tip_slab_alert_2", "tip_slab_alert_3"]
HIGH_BILL_TIPS = ["tip_high_bill_1", "tip_high_bill_2", "tip_high_bill_3"]
EFFICIENT_TIPS = ["tip_efficient_1", "tip_efficient_2", "tip_efficient_3"]

def generate_recommendations(units: float, state: str, percentile: int, total_bill: float, provider: str = "default") -> dict:
    selected_tips = []

    # Resolve correct slab data for state + provider
    state_data = TARIFFS.get(state.title(), {})
    slabs = state_data.get(provider) or state_data.get("default") or []

    # A. Fine-grained usage
    if units > 250:
        selected_tips.append({"key": random.choice(HIGH_USAGE_TIPS)})
    elif 150 <= units <= 200:
        selected_tips.append({"key": random.choice(MODERATE_USAGE_TIPS)})

    # B. Percentile-based variation
    if percentile > 80:
        selected_tips.append({"key": random.choice(HIGH_PERCENTILE_TIPS)})
    elif 40 <= percentile <= 60:
        selected_tips.append({"key": random.choice(AVG_PERCENTILE_TIPS)})

    # C. Slab boundary proximity tip (provider-aware)
    if units % 100 > 90:
        selected_tips.append({"key": random.choice(SLAB_ALERT_TIPS)})
    elif slabs:
        thresholds = [slab["max"] for slab in slabs if slab["max"] != float('inf')]
        for threshold in thresholds:
            if 0 < threshold - units <= 10:
                selected_tips.append({"key": random.choice(SLAB_ALERT_TIPS)})
                break

    # D. Bill-based tip (scales with max rate of provider's tariff)
    if slabs:
        max_rate = max(slab["rate"] for slab in slabs)
        # High bill threshold: 300 units * max_rate (roughly a high bill)
        high_bill_threshold = max(800, 300 * max_rate * 0.8)
    else:
        high_bill_threshold = 1000

    if total_bill > high_bill_threshold:
        selected_tips.append({"key": random.choice(HIGH_BILL_TIPS)})

    # Filter out duplicates by key
    seen = set()
    unique_tips = []
    for tip in selected_tips:
        if tip["key"] not in seen:
            unique_tips.append(tip)
            seen.add(tip["key"])
    selected_tips = unique_tips

    # Ensure at least 1 tip
    if len(selected_tips) == 0:
        for t_key in random.sample(EFFICIENT_TIPS, min(2, len(EFFICIENT_TIPS))):
            selected_tips.append({"key": t_key})

    # E. Add cost saving estimate (10% of bill)
    if total_bill > 0:
        saving = round(total_bill * 0.1)
        selected_tips.append({"key": "tip_saving_estimate", "params": {"value": saving}})

    random.shuffle(selected_tips)

    return {
        "tips": selected_tips
    }
