def get_temperature_factor(city):
    # Simple assumption for now
    hot_cities = ["Ahmedabad", "Surat", "Mumbai", "Rajkot", "Vadodara"]
    mild_cities = ["Pune", "Bangalore", "Dehradun"]

    if city in hot_cities:
        return 1.15   # 15% increase due to heat (AC usage)
    elif city in mild_cities:
        return 1.03   # 3% increase
    else:
        return 1.08   # Default 8% increase

def get_weather_message_key(city):
    hot_cities = ["Ahmedabad", "Surat", "Mumbai", "Rajkot", "Vadodara"]
    if city in hot_cities:
        return "weather_hot_warning"
    return "weather_normal_info"
