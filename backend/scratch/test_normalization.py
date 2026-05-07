import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_analyze():
    # 1. Signup
    signup_data = {
        "username": "testuser_norm",
        "password": "password123",
        "city": "mumbai",
        "state": "maharashtra"
    }
    requests.post(f"{BASE_URL}/signup", json=signup_data)
    
    # 2. Login
    login_data = {
        "username": "testuser_norm",
        "password": "password123"
    }
    login_resp = requests.post(f"{BASE_URL}/login", json=login_data)
    token = login_resp.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Test Analyze with Mumbai (Metro, West, Hot)
    test_cases = [
        {"units": 150, "city": "mumbai", "state": "maharashtra", "household_type": "Apartment"},
        {"units": 200, "city": "surat", "state": "gujarat", "household_type": "House"},
        {"units": 100, "city": "shimla", "state": "himachal", "household_type": "House"},
        {"units": 120, "city": "delhi", "state": "delhi", "household_type": "Apartment"},
    ]

    for case in test_cases:
        print(f"\nTesting: {case['city']}, {case['state']}")
        resp = requests.post(f"{BASE_URL}/analyze", json=case, headers=headers)
        if resp.status_code == 200:
            data = resp.json()
            print(f"  Tier: {data.get('city_tier')}")
            print(f"  Region: {data.get('region')}")
            print(f"  Climate: {data.get('climate')}")
        else:
            print(f"  Error: {resp.status_code} - {resp.text}")

if __name__ == "__main__":
    test_analyze()
