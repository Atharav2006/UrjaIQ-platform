import os
import time
import logging
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize global cache for rate limiting / repeated requests
_cache = {}
CACHE_TTL = 30  # seconds

# Lazy client initialization
_client = None

def get_groq_client():
    global _client
    if _client is not None:
        return _client
    
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        logger.warning("GROQ_API_KEY is missing from environment variables.")
        return None
    
    try:
        from groq import Groq
        _client = Groq(api_key=api_key)
        logger.info("Groq client initialized successfully.")
        return _client
    except Exception as e:
        logger.error(f"Failed to initialize Groq client: {e}")
        return None

def generate_dynamic_advice(query, context):
    cache_key = f"{query}_{context.get('units')}_{context.get('city')}"
    
    # Check cache
    if cache_key in _cache:
        cached_time, cached_response = _cache[cache_key]
        if time.time() - cached_time < CACHE_TTL:
            logger.info("Returning cached response.")
            return cached_response
            
    client = get_groq_client()
    if not client:
        return "AI advisor temporarily unavailable. Based on your usage, reducing AC runtime and shifting heavy appliance usage outside peak hours may help lower your bill."

    prompt = f"""You are an expert Indian electricity bill advisor and energy efficiency analyst.
Give highly personalized answers based on user energy consumption patterns.
Suggest realistic savings, appliance optimization, slab reduction strategies, seasonal recommendations, and bill reduction methods.

User Query: {query}
Context:
- Units: {context.get('units', 'N/A')} kWh
- Bill: ₹{context.get('bill', 'N/A')}
- Percentile: {context.get('percentile', 'N/A')}
- City: {context.get('city', 'N/A')}
- State: {context.get('state', 'N/A')}
- Carbon Footprint: {context.get('carbon_kg', 'N/A')} kg CO2
- Green Score: {context.get('green_score', 'N/A')}/100
- Eco Badge: {context.get('eco_badge', 'N/A')}
- Solar Potential: {context.get('solar_recommendation', {}).get('recommended_kw', 'N/A')} kW
- Appliances: {context.get('appliances', 'N/A')}

Provide a concise, intelligent, and dynamic response. No generic replies. Mention estimated savings, appliance impact, and carbon reduction tips. Help the user improve their Green Score."""

    retries = 2
    backoff = 2
    
    for attempt in range(retries + 1):
        try:
            start_time = time.time()
            logger.info(f"Generating advice (Attempt {attempt + 1}). Model: llama-3.3-70b-versatile")
            
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": "You are an expert Indian electricity bill advisor and energy efficiency analyst. Keep answers concise, highly personalized, and intelligent."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=800
            )
            
            latency = time.time() - start_time
            logger.info(f"Response received in {latency:.2f} seconds.")
            
            reply = response.choices[0].message.content
            
            # Update cache
            _cache[cache_key] = (time.time(), reply)
            return reply
            
        except Exception as e:
            logger.error(f"API Error on attempt {attempt + 1}: {e}")
            if attempt < retries:
                time.sleep(backoff)
                backoff *= 2
            else:
                logger.error("All retries failed.")
                return "AI advisor temporarily unavailable. Based on your usage, reducing AC runtime and shifting heavy appliance usage outside peak hours may help lower your bill."
