"""System monitoring utilities."""

from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional
from sqlalchemy import func


class SystemMonitor:
    """System monitoring and statistics collector."""
    
    @classmethod
    def get_system_stats(cls, db) -> Dict[str, Any]:
        """Get comprehensive system statistics."""
        # Import models here to avoid circular imports
        from ..models import User, AdminAuditLog, ErrorLog
        
        # Get user stats
        total_users = db.query(func.count(User.id)).scalar() or 0
        active_users = db.query(func.count(User.id)).filter(User.is_active == True).scalar() or 0
        superusers = db.query(func.count(User.id)).filter(User.is_superuser == True).scalar() or 0
        
        # Get time ranges
        now = datetime.now(timezone.utc)
        yesterday = now - timedelta(days=1)
        last_week = now - timedelta(days=7)
        last_month = now - timedelta(days=30)
        
        # Get recent audit logs
        recent_audits_24h = db.query(func.count(AdminAuditLog.id)).filter(
            AdminAuditLog.timestamp >= yesterday
        ).scalar() or 0
        
        recent_audits_7d = db.query(func.count(AdminAuditLog.id)).filter(
            AdminAuditLog.timestamp >= last_week
        ).scalar() or 0
        
        # Get error stats
        total_errors = db.query(func.count(ErrorLog.id)).scalar() or 0
        recent_errors_24h = db.query(func.count(ErrorLog.id)).filter(
            ErrorLog.timestamp >= yesterday
        ).scalar() or 0
        recent_errors_7d = db.query(func.count(ErrorLog.id)).filter(
            ErrorLog.timestamp >= last_week
        ).scalar() or 0
        open_errors = db.query(func.count(ErrorLog.id)).filter(
            ErrorLog.status == "open"
        ).scalar() or 0
        
        # Get error severity stats
        error_levels = db.query(
            ErrorLog.level, func.count(ErrorLog.id)
        ).group_by(ErrorLog.level).all()
        
        error_level_stats = {
            level: count for level, count in error_levels
        }
        
        # Get top actions from audit logs
        top_actions = db.query(
            AdminAuditLog.action, func.count(AdminAuditLog.id)
        ).filter(
            AdminAuditLog.timestamp >= last_week
        ).group_by(AdminAuditLog.action).order_by(
            func.count(AdminAuditLog.id).desc()
        ).limit(10).all()
        
        # Assemble the stats
        stats = {
            "users": {
                "total": total_users,
                "active": active_users,
                "superusers": superusers,
            },
            "audit_logs": {
                "last_24h": recent_audits_24h,
                "last_7d": recent_audits_7d,
                "top_actions": [
                    {"action": action, "count": count}
                    for action, count in top_actions
                ],
            },
            "errors": {
                "total": total_errors,
                "last_24h": recent_errors_24h,
                "last_7d": recent_errors_7d,
                "open": open_errors,
                "levels": error_level_stats,
            },
            "time_ranges": {
                "current_time": now.isoformat(),
                "start_yesterday": yesterday.isoformat(),
                "start_week": last_week.isoformat(),
                "start_month": last_month.isoformat(),
            },
        }
        
        # Check for potential issues
        stats["alerts"] = cls._check_alerts(stats)
        
        return stats
    
    @classmethod
    def _check_alerts(cls, stats: Dict[str, Any]) -> list:
        """Check for potential issues and generate alerts."""
        alerts = []
        
        # High error rate alert
        if stats["errors"]["last_24h"] > 100:
            alerts.append({
                "level": "warning",
                "message": f"过去24小时有 {stats['errors']['last_24h']} 个错误，请检查错误日志",
                "type": "high_error_rate",
            })
        
        # High critical errors alert
        critical_count = stats["errors"]["levels"].get("CRITICAL", 0)
        if critical_count > 10:
            alerts.append({
                "level": "critical",
                "message": f"有 {critical_count} 个严重错误需要处理",
                "type": "critical_errors",
            })
        
        # Open errors alert
        if stats["errors"]["open"] > 50:
            alerts.append({
                "level": "warning",
                "message": f"有 {stats['errors']['open']} 个未处理的错误",
                "type": "open_errors",
            })
        
        return alerts
    
    @classmethod
    def get_user_activity_stats(cls, db, days: int = 30) -> Dict[str, Any]:
        """Get user activity statistics."""
        # Import models here to avoid circular imports
        from ..models import AdminAuditLog
        
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        
        # Get login activity
        logins = db.query(
            func.date(AdminAuditLog.timestamp), func.count(AdminAuditLog.id)
        ).filter(
            AdminAuditLog.action == "LOGIN",
            AdminAuditLog.timestamp >= cutoff
        ).group_by(
            func.date(AdminAuditLog.timestamp)
        ).order_by(
            func.date(AdminAuditLog.timestamp)
        ).all()
        
        return {
            "days": days,
            "daily_logins": [
                {"date": date.isoformat(), "count": count}
                for date, count in logins
            ],
        }
