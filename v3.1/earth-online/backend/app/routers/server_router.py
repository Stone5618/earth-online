"""Server (country) routes."""

import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from ..database import get_db
from ..models import Server, User
from ..schemas import ServerOut
from ..auth import get_optional_user

router = APIRouter(prefix="/api/v1/servers", tags=["servers"])

logger = logging.getLogger("earthonline")


@router.get("", response_model=list[ServerOut])
def list_servers(
    include_global: bool = Query(False, alias="include_global"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    try:
        servers = db.query(Server).filter(Server.is_active == True).all()
        return [ServerOut(**s.to_dict(include_global_vars=include_global)) for s in servers]
    except Exception:
        logger.exception("Failed to list servers")
        raise


@router.get("/{server_id}", response_model=ServerOut)
def get_server(
    server_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    try:
        server = db.query(Server).filter(Server.id == server_id).first()
        if not server:
            raise HTTPException(status_code=404, detail="Server not found")
        return ServerOut(**server.to_dict(include_global_vars=True))
    except HTTPException:
        raise
    except Exception:
        logger.exception(f"Failed to get server {server_id}")
        raise
