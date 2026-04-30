import re
import json
from typing import Any, Dict, Optional

class LogSanitizer:
    SENSITIVE_FIELDS = {'password', 'token', 'secret', 'api_key', 'credit_card', 'ssn', 'authorization', 'cookie'}
    SENSITIVE_PATTERNS = [
        (r'(?i)bearer\s+[a-zA-Z0-9\-._~+/]+=*', 'Bearer [REDACTED]'),
        (r'(?i)token["\s:]+[a-zA-Z0-9\-._~+/]+', 'token: [REDACTED]'),
        (r'(?i)password["\s:]+[^\s,}]+', 'password: [REDACTED]'),
    ]
    
    IPV4_PATTERN = re.compile(
        r'\b(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\b'
    )
    
    @classmethod
    def sanitize_dict(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        if not isinstance(data, dict):
            return data
        
        result = {}
        for key, value in data.items():
            if key.lower() in cls.SENSITIVE_FIELDS:
                result[key] = '[REDACTED]'
            elif isinstance(value, dict):
                result[key] = cls.sanitize_dict(value)
            elif isinstance(value, str):
                result[key] = cls.sanitize_string(value)
            else:
                result[key] = value
        return result
    
    @classmethod
    def sanitize_string(cls, text: str) -> str:
        if not text:
            return text
        
        result = text
        for pattern, replacement in cls.SENSITIVE_PATTERNS:
            result = re.sub(pattern, replacement, result)
        return result
    
    @classmethod
    def sanitize_ip(cls, ip: Optional[str]) -> Optional[str]:
        if not ip:
            return None
        
        if ip.count('.') == 3:
            return cls.IPV4_PATTERN.sub(lambda m: f'{m.group(1)}.{m.group(2)}.xxx.xxx', ip)
        
        if ':' in ip:
            parts = ip.split(':', 2)
            if len(parts) >= 2:
                return f'{parts[0]}:{parts[1]}:xxxx:xxxx:xxxx:xxxx:xxxx:xxxx'
            return 'xxxx:xxxx:xxxx:xxxx:xxxx:xxxx:xxxx:xxxx'
        
        return 'xxx.xxx.xxx.xxx'
    
    @classmethod
    def sanitize_stack_trace(cls, stack_trace: Optional[str]) -> Optional[str]:
        if not stack_trace:
            return None
        return cls.sanitize_string(stack_trace)
    
    @classmethod
    def sanitize_context(cls, context: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        if not context:
            return None
        return cls.sanitize_dict(context)
