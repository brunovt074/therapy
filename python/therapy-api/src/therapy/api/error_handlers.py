from fastapi import Request
from fastapi.responses import JSONResponse
from therapy.shared.domain.errors.exceptions import (
    DomainError,
    NotFoundError,
    AlreadyExistsError,
    InvalidInputError,
    InvalidStatusTransitionError,
    SlotNotAvailableError,
    UnauthorizedError,
)


def register_error_handlers(app):
    @app.exception_handler(NotFoundError)
    async def not_found_handler(request: Request, exc: NotFoundError):
        return JSONResponse(status_code=404, content={"detail": str(exc)})

    @app.exception_handler(AlreadyExistsError)
    async def already_exists_handler(request: Request, exc: AlreadyExistsError):
        return JSONResponse(status_code=409, content={"detail": str(exc)})

    @app.exception_handler(InvalidInputError)
    async def invalid_input_handler(request: Request, exc: InvalidInputError):
        return JSONResponse(status_code=422, content={"detail": str(exc)})

    @app.exception_handler(InvalidStatusTransitionError)
    async def invalid_status_handler(request: Request, exc: InvalidStatusTransitionError):
        return JSONResponse(status_code=422, content={"detail": str(exc)})

    @app.exception_handler(SlotNotAvailableError)
    async def slot_not_available_handler(request: Request, exc: SlotNotAvailableError):
        return JSONResponse(status_code=409, content={"detail": str(exc)})

    @app.exception_handler(UnauthorizedError)
    async def unauthorized_handler(request: Request, exc: UnauthorizedError):
        return JSONResponse(status_code=401, content={"detail": str(exc)})

    @app.exception_handler(DomainError)
    async def domain_error_handler(request: Request, exc: DomainError):
        return JSONResponse(status_code=400, content={"detail": str(exc)})
