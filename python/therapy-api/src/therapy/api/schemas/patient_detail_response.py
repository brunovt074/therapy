from therapy.api.schemas.patient_response import PatientResponse


class PatientDetailResponse(PatientResponse):
    appointment_count: int
