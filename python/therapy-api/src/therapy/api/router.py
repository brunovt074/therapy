from fastapi import APIRouter

from therapy.api.admin import (
    admin_appointment_routes,
    admin_blocked_slot_routes,
    admin_patient_routes,
    admin_settings_routes,
    admin_specialty_routes,
)
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

api_router.include_router(admin_specialty_routes.router, prefix="/admin/specialties")
api_router.include_router(admin_appointment_routes.router, prefix="/admin/appointments")
api_router.include_router(admin_patient_routes.router, prefix="/admin/patients")
api_router.include_router(admin_blocked_slot_routes.router, prefix="/admin/blocked-slots")
api_router.include_router(admin_settings_routes.router, prefix="/admin/settings")
