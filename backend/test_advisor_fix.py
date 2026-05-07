import requests
import json
from jose import jwt
from datetime import datetime, timedelta

# Auth configuration from auth.py
SECRET_KEY = "gridscore_secure_secret_key"
ALGORITHM = "HS256"

def create_test_token():
    expire = datetime.utcnow() + timedelta(minutes=60)
    to_encode = {
        "sub": "testuser",
        "user_id": 1,
        "role": "user",
        "city": "Ahmedabad",
        "exp": expire
    }
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

url = "http://127.0.0.1:8000/advisor"
token = create_test_token()
headers = {"Authorization": f"Bearer {token}"}

data = {
    "query": "Why is my bill high without AC?",
    "units": 500,
    "bill": 2700,
    "percentile": 75,
    "city": "Ahmedabad",
    "state": "Gujarat",
    "appliances": {"Fridge": {"count": 1, "hours": 24}}
}

try:
    response = requests.post(url, json=data, headers=headers)
    print("Status Code:", response.status_code)
    print("Response Body:", response.text)
except Exception as e:
    print("Error connecting to server:", str(e))
