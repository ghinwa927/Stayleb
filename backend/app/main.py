from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database.database import engine
from app.routes.auth import router as auth_router
from app.routes.property import router as property_router
from app.routes.users import router as users_router
from app.database.database import Base, engine
import app.models

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="StayLeb API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(property_router)

@app.get("/")
def root():
    return {
        "message": "StayLeb API is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok"
    }


@app.get("/db-test")
def database_test():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        value = result.scalar()

    return {
        "database": "connected",
        "result": value
    }