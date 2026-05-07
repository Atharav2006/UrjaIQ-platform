import requests

url = "http://127.0.0.1:8000/advisor"
data = {
    "query": "Why is my bill so high?",
    "units": 500,
    "bill": 4500,
    "percentile": 85,
    "city": "Ahmedabad",
    "state": "Gujarat",
    "household_type": "3BHK",
    "appliances": {
        "AC": {"count": 2, "hours": 8}
    }
}

try:
    response = requests.post(url, json=data)
    print("Status Code:", response.status_code)
    print("Response Body:", response.json())
except Exception as e:
    print("Error:", e)
