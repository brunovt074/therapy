from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from therapy.api.router import api_router
from therapy.api.error_handlers import register_error_handlers

app = FastAPI(
    title="Therapy API",
    description="Backend API para administracion de turnos de clinica de fisioterapia",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_error_handlers(app)
app.include_router(api_router)

@app.get("/health")
async def health_check():
    return {"status": "ok"}
