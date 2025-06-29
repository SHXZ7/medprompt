from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import openrouter, ml
from routes import tips


app = FastAPI(title="MedPrompt+ AI Health Assistant")

# ✅ Fix CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],  # ✅ This allows OPTIONS
    allow_headers=["*"],
)

# Routes
app.include_router(openrouter.router, prefix="/openrouter")
app.include_router(ml.router, prefix="/ml")
app.include_router(tips.router)

@app.get("/")
def root():
    return {"message": "Welcome to MedPrompt+ backend!"}
