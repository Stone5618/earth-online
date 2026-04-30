"""Global exception handlers for structured error responses."""

import logging
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.exc import SQLAlchemyError

logger = logging.getLogger("earthonline.api")


def _add_cors_headers(request: Request, response: JSONResponse) -> JSONResponse:
    """Add CORS headers to error responses so browsers can read them."""
    origin = request.headers.get("origin", "")
    # Allow common development origins
    allowed_origins = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]
    if origin in allowed_origins:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
    return response


async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch-all handler for all unhandled exceptions."""
    import traceback as tb_module
    tb_text = "".join(tb_module.format_exception(type(exc), exc, exc.__traceback__))
    log_msg = f"""
{'='*80}
URL: {request.url}
Method: {request.method}
Exception: {type(exc).__name__}: {exc}
Traceback:
{tb_text}
"""
    logger.error(log_msg)
    response = JSONResponse(
        status_code=500,
        content={"detail": "服务器发生了一个内部错误，请稍后重试"},
    )
    return _add_cors_headers(request, response)


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """Handle FastAPI HTTPException with consistent response format."""
    if exc.status_code >= 500:
        logger.error(f"HTTP {exc.status_code} at {request.method} {request.url.path}: {exc.detail}")
    response = JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )
    return _add_cors_headers(request, response)


async def database_exception_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
    """Handle database errors safely WITHOUT exposing internal details."""
    logger.error(f"Database error at {request.method} {request.url.path}", exc_info=True)
    response = JSONResponse(
        status_code=500,
        content={"detail": "数据库操作失败，请稍后重试"},
    )
    return _add_cors_headers(request, response)


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handle Pydantic validation errors with friendly messages instead of raw errors."""
    errors = exc.errors()
    # Extract field names and build a friendly message
    field_names = [str(e.get("loc", [""])[-1]) for e in errors if e.get("loc")]
    if field_names:
        msg = f"请求参数无效: {', '.join(set(field_names))}"
    else:
        msg = "请求参数无效，请检查输入数据"
    response = JSONResponse(
        status_code=422,
        content={"detail": msg},
    )
    return _add_cors_headers(request, response)
