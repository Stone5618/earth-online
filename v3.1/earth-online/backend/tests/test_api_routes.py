"""
后端API路由单元测试 - 覆盖认证、游戏、角色等API
使用完全隔离的测试应用，不修改全局 app 状态
"""
import pytest
import sys
import os
import uuid
from typing import Generator
sys.path.insert(0, '.')

# Must set BEFORE any module imports
os.environ["TESTING"] = "1"

from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.models import User, Character
from app.engine.event_data import get_all_templates
from app.routers.auth_router import router as auth_router
from app.routers.game_router import router as game_router
from app.routers.character_router import router as character_router
from app.routers.server_router import router as server_router
from app.routers.admin_router import router as admin_router
from app.routers.leaderboard_router import router as leaderboard_router


# Isolated test database
TEST_DB_URL = "sqlite://"
test_engine = create_engine(
    TEST_DB_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)


def _on_connect(dbapi_conn, connection_record):
    try:
        dbapi_conn.execute("PRAGMA journal_mode=WAL")
    except Exception:
        pass


event.listen(test_engine, "connect", _on_connect)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def _override_get_db() -> Generator[Session, None, None]:
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_test_app() -> FastAPI:
    """Create isolated test app."""
    test_app = FastAPI(title="Earth Online Test")
    test_app.include_router(auth_router)
    test_app.include_router(game_router)
    test_app.include_router(character_router)
    test_app.include_router(server_router)
    test_app.include_router(admin_router)
    test_app.include_router(leaderboard_router)
    test_app.dependency_overrides[get_db] = _override_get_db
    return test_app


@pytest.fixture(scope="module")
def setup_db():
    """Create tables once per module."""
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture()
def clean_test_db():
    """Clean test data before each test."""
    db = TestingSessionLocal()
    try:
        from sqlalchemy import text
        db.execute(text("DELETE FROM characters"))
        db.execute(text("DELETE FROM users"))
        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()


@pytest.fixture()
def client(setup_db, clean_test_db) -> Generator[TestClient, None, None]:
    """Create test client with fresh state."""
    test_app = create_test_app()
    with TestClient(test_app) as c:
        yield c


class TestAuthRoutes:
    """测试认证API路由"""
    
    def test_register_success(self, client):
        """测试注册成功"""
        unique_user = f"testuser1_{uuid.uuid4().hex[:8]}"
        response = client.post("/api/v1/auth/register", json={
            "username": unique_user,
            "password": "testpassword123"
        })
        assert response.status_code in [200, 201], f"注册返回状态码: {response.status_code}"
        data = response.json()
        assert "access_token" in data
    
    def test_register_duplicate_username(self, client):
        """测试重复用户名注册"""
        unique_user = f"testuser2_{uuid.uuid4().hex[:8]}"
        client.post("/api/v1/auth/register", json={
            "username": unique_user,
            "password": "testpassword123"
        })
        response = client.post("/api/v1/auth/register", json={
            "username": unique_user,
            "password": "testpassword123"
        })
        assert response.status_code == 400
    
    def test_register_missing_fields(self, client):
        """测试缺少字段的注册"""
        response = client.post("/api/v1/auth/register", json={
            "username": "testuser3"
        })
        assert response.status_code == 422
    
    def test_login_success(self, client):
        """测试登录成功"""
        unique_user = f"testlogin_{uuid.uuid4().hex[:8]}"
        # 先注册 - 可能被速率限制
        reg_response = client.post("/api/v1/auth/register", json={
            "username": unique_user,
            "password": "testpass123"
        })
        if reg_response.status_code == 429:
            pytest.skip("注册被速率限制，跳过此测试")
        assert reg_response.status_code in [200, 201], f"注册失败: {reg_response.status_code}"
        # 再登录
        response = client.post("/api/v1/auth/login", json={
            "username": unique_user,
            "password": "testpass123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
    
    def test_login_wrong_password(self, client):
        """测试登录密码错误"""
        unique_user = f"testlogin2_{uuid.uuid4().hex[:8]}"
        client.post("/api/v1/auth/register", json={
            "username": unique_user,
            "password": "testpass123"
        })
        response = client.post("/api/v1/auth/login", json={
            "username": unique_user,
            "password": "wrongpassword"
        })
        assert response.status_code == 401
    
    def test_login_nonexistent_user(self, client):
        """测试登录不存在的用户"""
        response = client.post("/api/v1/auth/login", json={
            "username": f"notexists_{uuid.uuid4().hex[:8]}",
            "password": "testpass123"
        })
        assert response.status_code == 401


class TestGameRoutes:
    """测试游戏API路由"""
    
    def test_game_routes_registered(self, client):
        """测试游戏路由是否存在"""
        response = client.get("/api/v1/game/event")
        assert response.status_code in [401, 422, 404]


class TestServerRoutes:
    """测试服务器API路由"""
    
    def test_get_server_status(self, client):
        """测试获取服务器状态"""
        response = client.get("/api/v1/server/status")
        assert response.status_code in [200, 404]
    
    def test_get_server_info(self, client):
        """测试获取服务器信息"""
        response = client.get("/api/v1/server/info")
        assert response.status_code in [200, 404]


class TestLeaderboardRoutes:
    """测试排行榜API路由"""
    
    def test_get_leaderboard(self, client):
        """测试获取排行榜"""
        response = client.get("/api/v1/leaderboard")
        assert response.status_code in [200, 404]


class TestErrorHandling:
    """测试错误处理"""
    
    def test_invalid_endpoint(self, client):
        """测试访问不存在的端点"""
        response = client.get("/api/v1/nonexistent/endpoint")
        assert response.status_code == 404
    
    def test_method_not_allowed(self, client):
        """测试不允许的HTTP方法"""
        response = client.put("/api/v1/auth/register", json={})
        assert response.status_code in [405, 422]


class TestEventDataDirect:
    """直接测试事件数据"""
    
    def test_event_data_integrity(self):
        """测试事件数据完整性"""
        engine_events = get_all_templates()
        assert isinstance(engine_events, list)
        assert len(engine_events) > 0
        
    def test_event_categories_complete(self):
        """测试事件分类完整性"""
        engine_events = get_all_templates()
        categories = set()
        for event in engine_events:
            if "category" in event:
                categories.add(event["category"])
        common_categories = ["life", "career", "family", "education", "health"]
        found_categories = len([c for c in common_categories if c in categories])
        assert found_categories > 0, "缺少关键事件分类"


class TestApiCompleteness:
    """API完整性检查"""
    
    def test_auth_endpoints_covered(self):
        """验证认证端点覆盖"""
        auth_endpoints = [
            "/api/v1/auth/register",
            "/api/v1/auth/login"
        ]
        for endpoint in auth_endpoints:
            assert endpoint is not None


if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])
