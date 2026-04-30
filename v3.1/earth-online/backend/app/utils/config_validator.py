"""System configuration validation utilities."""

import json
from typing import Any, Dict, Tuple, Optional, Type, Union
from enum import Enum


class ConfigType(Enum):
    """Supported configuration value types."""
    STRING = "string"
    INTEGER = "integer"
    FLOAT = "float"
    BOOLEAN = "boolean"
    JSON = "json"
    LIST = "list"


class ConfigSchema:
    """Schema definition for a single configuration key."""
    
    def __init__(
        self,
        key: str,
        config_type: ConfigType,
        description: str,
        default: Any,
        min_value: Optional[Union[int, float]] = None,
        max_value: Optional[Union[int, float]] = None,
        allowed_values: Optional[list] = None,
        category: str = "general",
    ):
        self.key = key
        self.config_type = config_type
        self.description = description
        self.default = default
        self.min_value = min_value
        self.max_value = max_value
        self.allowed_values = allowed_values
        self.category = category


# Predefined configuration schemas
CONFIG_SCHEMAS: Dict[str, ConfigSchema] = {
    "game.max_life_expectancy": ConfigSchema(
        key="game.max_life_expectancy",
        config_type=ConfigType.INTEGER,
        description="最大预期寿命",
        default=120,
        min_value=60,
        max_value=200,
        category="game",
    ),
    "game.starting_year": ConfigSchema(
        key="game.starting_year",
        config_type=ConfigType.INTEGER,
        description="游戏起始年份",
        default=2024,
        min_value=1900,
        max_value=2100,
        category="game",
    ),
    "game.difficulty": ConfigSchema(
        key="game.difficulty",
        config_type=ConfigType.STRING,
        description="游戏难度",
        default="normal",
        allowed_values=["easy", "normal", "hard", "extreme"],
        category="game",
    ),
    "server.max_players": ConfigSchema(
        key="server.max_players",
        config_type=ConfigType.INTEGER,
        description="服务器最大玩家数",
        default=1000,
        min_value=10,
        max_value=10000,
        category="server",
    ),
    "server.maintenance_mode": ConfigSchema(
        key="server.maintenance_mode",
        config_type=ConfigType.BOOLEAN,
        description="维护模式",
        default=False,
        category="server",
    ),
    "ui.enable_sound": ConfigSchema(
        key="ui.enable_sound",
        config_type=ConfigType.BOOLEAN,
        description="启用音效",
        default=True,
        category="ui",
    ),
    "ui.theme": ConfigSchema(
        key="ui.theme",
        config_type=ConfigType.STRING,
        description="UI主题",
        default="dark",
        allowed_values=["dark", "light", "blue"],
        category="ui",
    ),
}


class ConfigValidator:
    """Validator for system configuration values."""
    
    @classmethod
    def validate(cls, key: str, value: Any) -> Tuple[bool, Optional[str], Any]:
        """
        Validate and parse a configuration value.
        
        Args:
            key: Configuration key
            value: Raw value (usually a JSON string)
            
        Returns:
            Tuple of (success, error_message, parsed_value)
        """
        schema = CONFIG_SCHEMAS.get(key)
        if not schema:
            # No schema defined - accept as string
            return True, None, str(value)
        
        try:
            # Parse the value first
            parsed_value = cls._parse_value(value, schema.config_type)
            
            # Validate based on type
            is_valid, error = cls._validate_by_type(
                parsed_value,
                schema.config_type,
                schema.min_value,
                schema.max_value,
                schema.allowed_values,
            )
            
            if not is_valid:
                return False, error, None
            
            return True, None, parsed_value
            
        except Exception as e:
            return False, f"值解析失败: {str(e)}", None
    
    @classmethod
    def _parse_value(cls, value: Any, config_type: ConfigType) -> Any:
        """Parse value based on type."""
        if isinstance(value, str) and config_type != ConfigType.STRING:
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                pass
        
        if config_type == ConfigType.BOOLEAN:
            if isinstance(value, str):
                lower_val = value.lower()
                if lower_val in ["true", "1", "yes"]:
                    return True
                if lower_val in ["false", "0", "no"]:
                    return False
            return bool(value)
            
        elif config_type == ConfigType.INTEGER:
            return int(value)
            
        elif config_type == ConfigType.FLOAT:
            return float(value)
            
        elif config_type == ConfigType.LIST:
            if isinstance(value, str):
                return json.loads(value)
            return list(value)
            
        elif config_type == ConfigType.JSON:
            if isinstance(value, str):
                return json.loads(value)
            return value
            
        return str(value)
    
    @classmethod
    def _validate_by_type(
        cls,
        value: Any,
        config_type: ConfigType,
        min_value: Optional[Union[int, float]],
        max_value: Optional[Union[int, float]],
        allowed_values: Optional[list],
    ) -> Tuple[bool, Optional[str]]:
        """Validate value by its type."""
        # Check allowed values first
        if allowed_values is not None:
            if value not in allowed_values:
                return False, f"值必须在以下范围内: {', '.join(str(v) for v in allowed_values)}"
        
        # Numeric range checks
        if config_type in [ConfigType.INTEGER, ConfigType.FLOAT]:
            if min_value is not None and value < min_value:
                return False, f"值不能小于 {min_value}"
            if max_value is not None and value > max_value:
                return False, f"值不能大于 {max_value}"
        
        return True, None
    
    @classmethod
    def get_schema(cls, key: str) -> Optional[ConfigSchema]:
        """Get schema for a configuration key."""
        return CONFIG_SCHEMAS.get(key)
    
    @classmethod
    def get_all_schemas(cls) -> Dict[str, ConfigSchema]:
        """Get all configuration schemas."""
        return CONFIG_SCHEMAS
