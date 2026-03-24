from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.identity.dependencies.auth_dependencies import init_db
from api.identity.v1.auth import router as auth_router
from api.identity.v1.users import router as user_router
from api.administration.v1.registration_intent import router as registration_intent_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on startup
    init_db()
    yield

app = FastAPI(
    title="Vimmit Academic API", 
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, this should be restricted
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mounting Identity API
app.include_router(auth_router, prefix="/api/v1/identity")
app.include_router(user_router, prefix="/api/v1/identity")

# Mounting Administration API
app.include_router(registration_intent_router, prefix="/api/v1/administration")

@app.get("/")
def read_root():
    return {"message": "Welcome to Vimmit Academic API"}
