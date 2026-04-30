# -*- coding: utf-8 -*-
"""事件库平衡性修复脚本

修复原则：
1. 单次money变化范围控制在 -100000 到 +100000 之间
2. 避免极端的暴富/暴贫事件
3. 保持游戏的趣味性和挑战性
"""

import re

def balance_money_value(value: int) -> int:
    """平衡money数值，防止极端变化"""
    if value > 1000000:
        return int(value * 0.05)  # 大幅减少
    elif value > 500000:
        return int(value * 0.08)
    elif value > 100000:
        return int(value * 0.15)
    elif value < -1000000:
        return int(value * 0.05)
    elif value < -500000:
        return int(value * 0.08)
    elif value < -100000:
        return int(value * 0.15)
    return value

def fix_event_file(filepath: str) -> tuple[int, list[str]]:
    """修复事件文件中的极端money值
    
    Returns:
        (修改次数, 修改记录列表)
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    changes = []
    change_count = 0
    
    # 匹配 'money': 数字 的模式
    pattern = r"'money':\s*(-?\d+)"
    
    def replace_money(match):
        nonlocal change_count
        original_value = int(match.group(1))
        new_value = balance_money_value(original_value)
        if new_value != original_value:
            change_count += 1
            changes.append(f"  money: {original_value} -> {new_value}")
            return f"'money': {new_value}"
        return match.group(0)
    
    new_content = re.sub(pattern, replace_money, content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    return change_count, changes

if __name__ == '__main__':
    import os
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    event_files = [
        'childhood_events.py',
        'adolescence_events.py', 
        'adulthood_events.py',
        'laterlife_events.py',
        'moral_dilemmas.py'
    ]
    
    total_changes = 0
    for filename in event_files:
        filepath = os.path.join(base_dir, filename)
        if os.path.exists(filepath):
            count, changes = fix_event_file(filepath)
            total_changes += count
            print(f"\n{filename}: 修改了 {count} 处")
            for change in changes[:10]:  # 只显示前10条
                print(change)
            if len(changes) > 10:
                print(f"  ... 还有 {len(changes) - 10} 处修改")
    
    print(f"\n总计修改了 {total_changes} 处极端money值")
