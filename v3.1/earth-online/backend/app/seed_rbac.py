"""Seed data for RBAC roles and permissions."""

from sqlalchemy.orm import Session

from .models.rbac import AdminRole, AdminPermission, RolePermission


# All available permissions
ALL_PERMISSIONS = [
    # Dashboard
    ("dashboard:view", "dashboard", "查看仪表盘", "查看监控面板数据"),
    
    # Events
    ("event:view", "event", "查看事件", "查看事件列表和详情"),
    ("event:create", "event", "创建事件", "创建新事件模板"),
    ("event:update", "event", "编辑事件", "编辑现有事件模板"),
    ("event:delete", "event", "删除事件", "删除事件模板"),
    ("event:import", "event", "导入事件", "批量导入事件"),
    ("event:export", "event", "导出事件", "导出事件数据"),
    ("event:toggle", "event", "启用/禁用事件", "切换事件启用状态"),
    
    # Characters/Players
    ("character:view", "character", "查看角色", "查看角色列表"),
    ("character:detail", "character", "角色详情", "查看角色完整信息"),
    ("character:ban", "character", "封禁角色", "封禁/解封角色"),
    ("character:reset", "character", "重置角色", "重置角色状态"),
    
    # Achievements
    ("achievement:view", "achievement", "查看成就", "查看成就列表"),
    ("achievement:create", "achievement", "创建成就", "创建新成就"),
    ("achievement:update", "achievement", "编辑成就", "编辑现有成就"),
    ("achievement:delete", "achievement", "删除成就", "删除成就"),
    
    # Leaderboards
    ("leaderboard:view", "leaderboard", "查看排行榜", "查看排行榜数据"),
    ("leaderboard:reset", "leaderboard", "重置排行榜", "重置排行榜数据"),
    ("leaderboard:config", "leaderboard", "排行榜配置", "修改排行榜配置"),
    
    # Announcements
    ("announcement:view", "announcement", "查看公告", "查看公告列表"),
    ("announcement:create", "announcement", "创建公告", "创建新公告"),
    ("announcement:update", "announcement", "编辑公告", "编辑现有公告"),
    ("announcement:delete", "announcement", "删除公告", "删除公告"),
    ("announcement:publish", "announcement", "发布公告", "发布/撤回公告"),
    
    # Activities
    ("activity:view", "activity", "查看活动", "查看活动列表"),
    ("activity:create", "activity", "创建活动", "创建新活动"),
    ("activity:update", "activity", "编辑活动", "编辑现有活动"),
    ("activity:manage", "activity", "管理活动", "启动/暂停/结束活动"),
    
    # Export
    ("export:data", "export", "导出数据", "导出各类数据文件"),
    
    # Audit Logs
    ("audit:view", "audit", "查看审计日志", "查看操作审计日志"),
    
    # System
    ("system:config", "system", "系统配置", "修改系统配置"),
    ("system:user", "system", "用户管理", "管理管理员用户和角色"),
    ("system:monitor", "system", "系统监控", "查看系统健康状态"),
]

# Role definitions: (name, display_name, description, level, [permission_codes])
ROLE_DEFINITIONS = [
    (
        "super_admin",
        "超级管理员",
        "全部权限，包括系统配置、用户管理、权限分配",
        100,
        [code for code, _, _, _ in ALL_PERMISSIONS],
    ),
    (
        "admin",
        "管理员",
        "数据管理、运营工具、监控面板，但不能修改系统配置",
        80,
        [
            "dashboard:view",
            "event:view", "event:create", "event:update", "event:delete",
            "event:import", "event:export", "event:toggle",
            "character:view", "character:detail", "character:ban", "character:reset",
            "achievement:view", "achievement:create", "achievement:update", "achievement:delete",
            "leaderboard:view", "leaderboard:reset", "leaderboard:config",
            "announcement:view", "announcement:create", "announcement:update",
            "announcement:delete", "announcement:publish",
            "activity:view", "activity:create", "activity:update", "activity:manage",
            "export:data",
            "audit:view",
            "system:monitor",
        ],
    ),
    (
        "operator",
        "运营",
        "公告推送、活动配置、数据查看/导出，不能修改游戏逻辑",
        60,
        [
            "dashboard:view",
            "event:view", "event:import", "event:export",
            "character:view", "character:detail",
            "achievement:view",
            "leaderboard:view",
            "announcement:view", "announcement:create", "announcement:update",
            "announcement:publish",
            "activity:view", "activity:create", "activity:update", "activity:manage",
            "export:data",
        ],
    ),
    (
        "support",
        "客服",
        "查看玩家数据、处理玩家反馈、查看日志，无修改权限",
        40,
        [
            "dashboard:view",
            "character:view", "character:detail",
            "achievement:view",
            "leaderboard:view",
            "announcement:view",
            "activity:view",
            "audit:view",
        ],
    ),
    (
        "viewer",
        "只读观察员",
        "仅查看监控面板和公开数据",
        20,
        [
            "dashboard:view",
            "character:view",
            "achievement:view",
            "leaderboard:view",
        ],
    ),
]


def seed_rbac(db: Session) -> dict[str, AdminRole]:
    """Create default roles and permissions if they don't exist.
    
    Returns a dict mapping role name to AdminRole instance.
    """
    existing_perms = {p.code: p for p in db.query(AdminPermission).all()}
    
    for code, module, display, description in ALL_PERMISSIONS:
        if code not in existing_perms:
            perm = AdminPermission(
                code=code,
                module=module,
                action=code.split(":")[1],
                description=description,
            )
            db.add(perm)
            existing_perms[code] = perm
    
    db.flush()
    
    existing_roles = {r.name: r for r in db.query(AdminRole).all()}
    
    for name, display_name, description, level, perm_codes in ROLE_DEFINITIONS:
        if name not in existing_roles:
            role = AdminRole(
                name=name,
                display_name=display_name,
                description=description,
                level=level,
            )
            db.add(role)
            db.flush()
            existing_roles[name] = role
        
        role = existing_roles[name]
        for code in perm_codes:
            if code in existing_perms:
                existing = db.query(RolePermission).filter_by(
                    role_id=role.id,
                    permission_id=existing_perms[code].id,
                ).first()
                if not existing:
                    db.add(RolePermission(
                        role_id=role.id,
                        permission_id=existing_perms[code].id,
                    ))
    
    db.flush()
    return existing_roles
