import re
from typing import Tuple, Optional

class PasswordValidator:
    MIN_LENGTH = 8
    MAX_LENGTH = 128
    
    @classmethod
    def validate(cls, password: str) -> Tuple[bool, Optional[str]]:
        if len(password) < cls.MIN_LENGTH:
            return False, f"密码长度至少 {cls.MIN_LENGTH} 位"
        if len(password) > cls.MAX_LENGTH:
            return False, f"密码长度不超过 {cls.MAX_LENGTH} 位"
        if not re.search(r'[A-Z]', password):
            return False, "密码必须包含大写字母"
        if not re.search(r'[a-z]', password):
            return False, "密码必须包含小写字母"
        if not re.search(r'\d', password):
            return False, "密码必须包含数字"
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            return False, "密码必须包含特殊字符"
        return True, None
    
    @classmethod
    def get_requirements(cls) -> str:
        return f"密码要求：{cls.MIN_LENGTH}-{cls.MAX_LENGTH}位，包含大小写字母、数字和特殊字符"
