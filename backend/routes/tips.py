from fastapi import APIRouter
import random
import datetime

router = APIRouter()

# Example static tip list (replace with DB/ML later)
daily_tips = [
    {"tip": "Drink 8 glasses of water a day.", "source": "WHO"},
    {"tip": "Regular walking lowers blood pressure.", "source": "Healthline"},
    {"tip": "Add greens to every meal.", "source": "Nutrition.org"},
    {"tip": "Practice deep breathing daily.", "source": "Mayo Clinic"},
]

@router.get("/api/tips/daily")
def get_daily_tip():
    return random.choice(daily_tips)

