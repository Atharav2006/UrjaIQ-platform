from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Input Schema
class AnalyzeRequest(BaseModel):
    units: float
    city: str
    household_type: str
    state: str

# Output Schema for single Reading (used in history)
class ReadingResponse(BaseModel):
    id: int
    units: int
    city: str
    state: str
    household_type: str
    total_bill: float
    created_at: datetime

    class Config:
        from_attributes = True
