def calculate_score(percentile: int) -> dict:
    """
    Converts a percentile ranking into an energy efficiency score and grade.
    An inverse relationship is used: score = 100 - percentile.
    """
    score = 100 - percentile
    
    if score >= 80:
        grade = "A"
    elif score >= 60:
        grade = "B"
    elif score >= 40:
        grade = "C"
    elif score >= 20:
        grade = "D"
    else:
        grade = "F"
        
    return {
        "score": score,
        "grade": grade
    }

def get_badge_and_rank(score: int, percentile: int) -> dict:
    # Score based badges
    if score >= 70:
        badge_key = "badge_energy_saver"
    elif score >= 40:
        badge_key = "badge_average"
    else:
        badge_key = "badge_high_user"

    # Percentile based ranks
    if percentile <= 20:
        rank_key = "rank_top_20"
    elif percentile <= 50:
        rank_key = "rank_top_50"
    else:
        rank_key = "rank_bottom"

    return {
        "badge_key": badge_key,
        "rank_key": rank_key
    }
