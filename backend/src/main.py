from fastapi import FastAPI
from api.identity.v1.auth import router as auth_router
from api.identity.v1.users import router as user_router

app = FastAPI(title="Vimmit Academic API", version="1.0.0")

# Mounting Identity API
app.include_router(auth_router, prefix="/api/v1/identity")
app.include_router(user_router, prefix="/api/v1/identity")

@app.get("/")
def read_root():
    return {"message": "Welcome to Vimmit Academic API"}
