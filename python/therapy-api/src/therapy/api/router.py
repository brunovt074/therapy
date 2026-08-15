from fastapi import APIRouter, Depends

from therapy.api.admin import (
    admin_appointment_routes,
    admin_blocked_slot_routes,
    admin_patient_routes,
    admin_settings_routes,
    admin_specialty_routes,
)
from therapy.api.dependencies.auth import require_admin
from therapy.api.public import (
    appointment_routes,
    auth_routes,
    availability_routes,
    specialty_routes,
)

api_router = APIRouter(prefix="/api")

api_router.include_router(auth_routes.router)
api_router.include_router(specialty_routes.router, prefix="/specialties")
api_router.include_router(appointment_routes.router, prefix="/appointments")
api_router.include_router(availability_routes.router, prefix="/availability")

admin_auth = [Depends(require_admin)]
api_router.include_router(admin_specialty_routes.router, prefix="/admin/specialties", dependencies=admin_auth)
api_router.include_router(admin_appointment_routes.router, prefix="/admin/appointments", dependencies=admin_auth)
api_router.include_router(admin_patient_routes.router, prefix="/admin/patients", dependencies=admin_auth)
api_router.include_router(admin_blocked_slot_routes.router, prefix="/admin/blocked-slots", dependencies=admin_auth)
api_router.include_router(admin_settings_routes.router, prefix="/admin/settings", dependencies=admin_auth)
