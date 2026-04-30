"""Earth Online - FastAPI Backend Entry Point."""

import os
import logging
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware

from .config import settings
from .database import init_db, Base, engine, get_db
from .rate_limiter import limiter
from .routers import auth_router, server_router, character_router, game_router, leaderboard_router, reincarnation_router, admin_router, family_router
from .routers import admin_panel_router, user_router, export_router, content_management_router, system_monitor_router
from .exception_handlers import global_exception_handler, http_exception_handler, database_exception_handler, validation_exception_handler
from fastapi.exceptions import RequestValidationError

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("earthonline")

app = FastAPI(
    title="Earth Online API",
    description="人生模拟游戏后端 API",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Register exception handlers
# Order matters: more specific handlers must be registered BEFORE the generic Exception handler
from starlette.exceptions import HTTPException as StarletteHTTPException
# Register both FastAPI and Starlette HTTPException handlers
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(SQLAlchemyError, database_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, global_exception_handler)

# Rate limit exceeded handler
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    logger.warning(f"Rate limit exceeded: {request.method} {request.url.path} from {request.client.host}")
    return JSONResponse(
        status_code=429,
        content={"detail": "请求过于频繁，请稍后再试"},
        headers={"Retry-After": "60"},
    )

# Add CORS middleware
cors_origins_env = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:5174,http://localhost:5175,http://127.0.0.1:5173")
if cors_origins_env == "*":
    allow_origins = ["*"]
    allow_credentials = False
else:
    allow_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]
    allow_credentials = True

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add GZip compression middleware for response compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Security headers middleware
@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*; font-src 'self'; connect-src 'self' ws: wss:; frame-ancestors 'none'; object-src 'none'; base-uri 'self'"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=(), payment=()"
    return response

# Routers
app.include_router(auth_router.router)
app.include_router(server_router.router)
app.include_router(character_router.router)
app.include_router(game_router.router)
app.include_router(leaderboard_router.router)
app.include_router(reincarnation_router.router)
app.include_router(admin_router.router)
app.include_router(family_router.router)
app.include_router(admin_panel_router.router)
app.include_router(user_router.router)
app.include_router(export_router.router)
app.include_router(content_management_router.router)
app.include_router(system_monitor_router.router)


@app.on_event("startup")
def on_startup():
    init_db()
    # Ensure family relationship tables exist
    from .models import FamilyRelationship, SocialRelation  # noqa - force SQLAlchemy registration
    Base.metadata.create_all(bind=engine)
    # Seed family event templates on first run
    from .database import SessionLocal
    db = SessionLocal()
    try:
        from .engine.family_events import seed_family_events
        seed_family_events(db)
    except ImportError:
        pass
    finally:
        db.close()

    # Seed default servers if none exist
    from .database import SessionLocal
    from .models import Server
    db = SessionLocal()
    try:
        existing = db.query(Server).count()
        if existing == 0:
            from .seed import SERVERS
            for s in SERVERS:
                db.add(Server(**s))
            db.commit()
            logger.info(f"Seeded {len(SERVERS)} default servers.")
    except Exception as e:
        db.rollback()
        logger.warning(f"Server seeding failed: {e}")
    finally:
        db.close()

    # Pre-warm event template cache
    from .engine.event_template_cache import get_cached_templates, invalidate_template_cache
    db_warm = SessionLocal()
    try:
        get_cached_templates(db_warm)
        logger.info("Event template cache pre-warmed from database.")
    except Exception as e:
        logger.warning(f"Event template cache pre-warm failed: {e}")
    finally:
        db_warm.close()

    # Seed RBAC roles and permissions
    from .seed_rbac import seed_rbac
    from .database import SessionLocal
    from .models import User, AdminRole
    from .auth import hash_password
    db = SessionLocal()
    try:
        seed_rbac(db)
        
        # Seed default admin user (admin/admin123)
        existing_admin = db.query(User).filter(User.username == "admin").first()
        if not existing_admin:
            # Get super admin role
            super_admin_role = db.query(AdminRole).filter(AdminRole.name == "super_admin").first()
            
            admin_user = User(
                username="admin",
                hashed_password=hash_password("admin123"),
                email="admin@earthonline.com",
                is_superuser=True,
                is_active=True,
                role_id=super_admin_role.id if super_admin_role else None
            )
            db.add(admin_user)
            logger.info("Seeded default admin user (admin/admin123)")
        
        db.commit()
    except Exception as e:
        db.rollback()
        logger.warning(f"RBAC or admin user seeding failed: {e}")
    finally:
        db.close()

    # Start metrics collector
    import asyncio
    from .utils.metrics import metrics_collector
    try:
        loop = asyncio.get_running_loop()
        loop.call_soon(lambda: asyncio.create_task(metrics_collector.start()))
        logger.info("Metrics collector scheduled to start")
    except RuntimeError:
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                loop.call_soon(lambda: asyncio.create_task(metrics_collector.start()))
            else:
                loop.run_until_complete(metrics_collector.start())
            logger.info("Metrics collector started")
        except Exception as e:
            logger.warning(f"Metrics collector start failed: {e}")
    except Exception as e:
        logger.warning(f"Metrics collector start failed: {e}")


@app.on_event("shutdown")
def on_shutdown():
    """Clean up Redis connection pool on shutdown."""
    from .cache import cache_manager
    from .utils.metrics import metrics_collector
    import asyncio
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.create_task(cache_manager.close())
            asyncio.create_task(metrics_collector.stop())
        else:
            loop.run_until_complete(cache_manager.close())
            loop.run_until_complete(metrics_collector.stop())
    except Exception:
        pass
    logger.info("Redis connection pool closed")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=False)


# Serve built frontend in production
FRONTEND_DIST = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "app", "dist")
if os.path.isdir(FRONTEND_DIST):
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")
    print(f"[startup] Serving frontend from {FRONTEND_DIST}")
else:
    @app.get("/")
    def root():
        return {"message": "Earth Online API is running", "docs": "/docs"}


@app.get("/health")
def health_check():
    """Health check endpoint for load balancers and orchestration."""
    return {"status": "ok", "version": "2.0.0"}


@app.get("/ready")
def readiness_check():
    """Readiness check - verifies database connectivity."""
    try:
        db = next(get_db())
        db.execute(text("SELECT 1"))
        return {"status": "ready", "database": "connected"}
    except Exception:
        raise HTTPException(status_code=503, detail="Database not available")
