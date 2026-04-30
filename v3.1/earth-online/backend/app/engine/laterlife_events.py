
# -*- coding: utf-8 -*-
"""50岁以上老年期事件库"""

LATERLIFE_EVENTS = [
    # ==================== 职业/退休类事件 ====================
    {
        'title': '临近退休',
        'category': 'career',
        'min_age': 55,
        'max_age': 65,
        'base_weight': 1.0,
        'difficulty_level': 0.4,
        'description': '你快要退休了，开始规划退休生活。',
        'choices': [
            {'text': '开始规划退休生活', 'stat_changes': {'mood': 10, 'intelligence': 5, 'creativity': 3}, 'difficulty_mod': 0.5},
            {'text': '有些不舍', 'stat_changes': {'mood': 3, 'emotional_stability': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '正式退休',
        'category': 'milestone',
        'min_age': 55,
        'max_age': 70,
        'base_weight': 1.0,
        'difficulty_level': 0.4,
        'description': '你正式退休了！告别了几十年的工作生涯。',
        'choices': [
            {'text': '享受退休生活', 'stat_changes': {'mood': 25, 'energy': 10, 'health': 3}, 'difficulty_mod': 0.5},
            {'text': '有些不适应', 'stat_changes': {'mood': 5, 'emotional_stability': -2}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '退休后返聘',
        'category': 'career',
        'min_age': 55,
        'max_age': 75,
        'base_weight': 0.7,
        'difficulty_level': 0.4,
        'description': '你退休后被公司返聘，继续发挥余热！',
        'choices': [
            {'text': '接受返聘', 'stat_changes': {'money': 30000, 'reputation': 5, 'mood': 8, 'energy': -10}, 'difficulty_mod': 0.5},
            {'text': '安享退休生活', 'stat_changes': {'mood': 10, 'health': 3}, 'difficulty_mod': 0.5}
        ]
    },
    
    # ==================== 家庭类事件 ====================
    {
        'title': '孩子结婚',
        'category': 'family',
        'min_age': 45,
        'max_age': 70,
        'base_weight': 1.0,
        'difficulty_level': 0.4,
        'description': '你的孩子结婚了！',
        'choices': [
            {'text': '开心地给孩子办婚礼', 'stat_changes': {'mood': 20, 'karma': 10, 'charm': 5, 'money': -50000}, 'difficulty_mod': 0.5},
            {'text': '简单办就好', 'stat_changes': {'mood': 12, 'karma': 5, 'money': -10000}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '抱孙子/孙女',
        'category': 'milestone',
        'min_age': 50,
        'max_age': 80,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '你抱孙子/孙女了！升级为爷爷奶奶/外公外婆！',
        'choices': [
            {'text': '特别开心', 'stat_changes': {'mood': 30, 'karma': 10, 'health': 5}, 'difficulty_mod': 0.5},
            {'text': '开始带娃', 'stat_changes': {'mood': 15, 'energy': -15, 'health': -3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '带孙子/孙女',
        'category': 'family',
        'min_age': 50,
        'max_age': 80,
        'base_weight': 1.0,
        'difficulty_level': 0.4,
        'description': '你帮忙带孙子/孙女，虽然累但是很开心！',
        'choices': [
            {'text': '享受天伦之乐', 'stat_changes': {'mood': 20, 'karma': 10, 'energy': -15, 'health': -3}, 'difficulty_mod': 0.5},
            {'text': '有点累', 'stat_changes': {'mood': 8, 'energy': -10}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '父母去世',
        'category': 'family',
        'min_age': 40,
        'max_age': 80,
        'base_weight': 0.8,
        'difficulty_level': 0.7,
        'description': '你的父母去世了，你非常伤心。',
        'choices': [
            {'text': '处理后事', 'stat_changes': {'mood': -25, 'health': -8, 'emotional_stability': -5, 'money': -20000}, 'difficulty_mod': 0.5},
            {'text': '悲伤难以自拔', 'stat_changes': {'mood': -30, 'health': -15, 'emotional_stability': -10}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '金婚纪念',
        'category': 'family',
        'min_age': 70,
        'max_age': 100,
        'base_weight': 0.7,
        'difficulty_level': 0.3,
        'description': '你和伴侣结婚50年了！金婚快乐！',
        'choices': [
            {'text': '好好庆祝', 'stat_changes': {'mood': 25, 'charm': 10, 'health': 5, 'money': -10000}, 'difficulty_mod': 0.5},
            {'text': '简单过', 'stat_changes': {'mood': 15, 'health': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '伴侣去世',
        'category': 'family',
        'min_age': 50,
        'max_age': 120,
        'base_weight': 0.8,
        'difficulty_level': 0.8,
        'description': '相伴几十年的老伴先你一步而去了。',
        'choices': [
            {'text': '坚强地继续生活', 'stat_changes': {'mood': -20, 'emotional_stability': 10, 'health': -8}, 'difficulty_mod': 0.5},
            {'text': '悲痛难以自抑', 'stat_changes': {'mood': -35, 'health': -15, 'emotional_stability': -8}, 'difficulty_mod': 0.5}
        ]
    },
    
    # ==================== 生活类事件 ====================
    {
        'title': '退休生活',
        'category': 'life',
        'min_age': 55,
        'max_age': 100,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '你开始享受退休生活，终于有时间做自己想做的事情了！',
        'choices': [
            {'text': '跳广场舞', 'stat_changes': {'physical_fitness': 3, 'social_capital': 8, 'mood': 15}, 'difficulty_mod': 0.5},
            {'text': '下棋钓鱼', 'stat_changes': {'mood': 10, 'health': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '老年大学',
        'category': 'life',
        'min_age': 50,
        'max_age': 90,
        'base_weight': 0.7,
        'difficulty_level': 0.3,
        'description': '你去上老年大学，活到老学到老！',
        'choices': [
            {'text': '认真学习', 'stat_changes': {'intelligence': 8, 'creativity': 5, 'mood': 12}, 'difficulty_mod': 0.5},
            {'text': '混日子', 'stat_changes': {'mood': 8, 'social_capital': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '学摄影',
        'category': 'life',
        'min_age': 50,
        'max_age': 90,
        'base_weight': 0.6,
        'difficulty_level': 0.3,
        'description': '你开始学摄影，记录美好瞬间！',
        'choices': [
            {'text': '认真学习', 'stat_changes': {'creativity': 10, 'mood': 15, 'money': -10000}, 'difficulty_mod': 0.5},
            {'text': '随便拍拍', 'stat_changes': {'creativity': 3, 'mood': 8}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '学画画',
        'category': 'life',
        'min_age': 50,
        'max_age': 90,
        'base_weight': 0.6,
        'difficulty_level': 0.3,
        'description': '你开始学画画，陶冶情操！',
        'choices': [
            {'text': '认真学画', 'stat_changes': {'creativity': 10, 'mood': 12, 'money': -5000}, 'difficulty_mod': 0.5},
            {'text': '学着玩', 'stat_changes': {'creativity': 3, 'mood': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '学写字',
        'category': 'life',
        'min_age': 50,
        'max_age': 90,
        'base_weight': 0.5,
        'difficulty_level': 0.3,
        'description': '你开始学书法，修身养性！',
        'choices': [
            {'text': '认真练习', 'stat_changes': {'creativity': 8, 'emotional_stability': 8, 'mood': 10}, 'difficulty_mod': 0.5},
            {'text': '随便写写', 'stat_changes': {'creativity': 2, 'mood': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '学跳舞',
        'category': 'life',
        'min_age': 50,
        'max_age': 85,
        'base_weight': 0.7,
        'difficulty_level': 0.3,
        'description': '你开始学跳舞，广场舞、交谊舞...',
        'choices': [
            {'text': '积极参与', 'stat_changes': {'physical_fitness': 8, 'social_capital': 8, 'mood': 15}, 'difficulty_mod': 0.5},
            {'text': '随便玩玩', 'stat_changes': {'physical_fitness': 3, 'mood': 8}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '学太极',
        'category': 'life',
        'min_age': 50,
        'max_age': 90,
        'base_weight': 0.8,
        'difficulty_level': 0.3,
        'description': '你开始学太极，强身健体！',
        'choices': [
            {'text': '认真练习', 'stat_changes': {'physical_fitness': 8, 'health': 10, 'emotional_stability': 8, 'mood': 12}, 'difficulty_mod': 0.5},
            {'text': '随便学学', 'stat_changes': {'physical_fitness': 3, 'health': 3, 'mood': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '环游世界',
        'category': 'life',
        'min_age': 50,
        'max_age': 80,
        'base_weight': 0.5,
        'difficulty_level': 0.4,
        'description': '你终于有时间去环游世界了！',
        'choices': [
            {'text': '环游世界', 'stat_changes': {'creativity': 10, 'mood': 30, 'money': -45000, 'energy': -20}, 'difficulty_mod': 0.5},
            {'text': '国内游', 'stat_changes': {'creativity': 5, 'mood': 20, 'money': -50000, 'energy': -10}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '回老家养老',
        'category': 'life',
        'min_age': 55,
        'max_age': 90,
        'base_weight': 0.8,
        'difficulty_level': 0.4,
        'description': '你决定回到老家，落叶归根，安享晚年。',
        'choices': [
            {'text': '回老家养老', 'stat_changes': {'mood': 15, 'health': 5, 'karma': 5, 'money': -50000}, 'difficulty_mod': 0.5},
            {'text': '继续在大城市', 'stat_changes': {'mood': 8, 'social_capital': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '住进养老院',
        'category': 'life',
        'min_age': 70,
        'max_age': 110,
        'base_weight': 0.7,
        'difficulty_level': 0.5,
        'description': '你年纪大了，需要人照顾，于是住进了养老院。',
        'choices': [
            {'text': '积极适应', 'stat_changes': {'social_capital': 8, 'mood': 8, 'health': 3, 'money': -30000}, 'difficulty_mod': 0.5},
            {'text': '有些抗拒', 'stat_changes': {'mood': -5, 'emotional_stability': -3}, 'difficulty_mod': 0.5}
        ]
    },
    
    # ==================== 健康类事件 ====================
    {
        'title': '老年体检',
        'category': 'health',
        'min_age': 50,
        'max_age': 120,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '每年一次的体检，年纪大了要多注意身体。',
        'choices': [
            {'text': '认真对待', 'stat_changes': {'health': 5, 'mood': 3, 'money': -3000}, 'difficulty_mod': 0.5},
            {'text': '觉得麻烦', 'stat_changes': {'health': -2, 'mood': -1}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '身体出问题',
        'category': 'health',
        'min_age': 50,
        'max_age': 120,
        'base_weight': 1.0,
        'difficulty_level': 0.6,
        'description': '你的身体开始出问题了，三高、心脏病、糖尿病...',
        'choices': [
            {'text': '积极治疗', 'stat_changes': {'health': 5, 'mood': -5, 'money': -50000}, 'difficulty_mod': 0.5},
            {'text': '不太在意', 'stat_changes': {'health': -15, 'mood': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '住院',
        'category': 'health',
        'min_age': 50,
        'max_age': 120,
        'base_weight': 0.9,
        'difficulty_level': 0.7,
        'description': '你生病了需要住院治疗。',
        'choices': [
            {'text': '配合治疗', 'stat_changes': {'health': 10, 'mood': -10, 'money': -80000}, 'difficulty_mod': 0.5},
            {'text': '不太想治', 'stat_changes': {'health': -10, 'mood': -15}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '手术',
        'category': 'health',
        'min_age': 50,
        'max_age': 120,
        'base_weight': 0.8,
        'difficulty_level': 0.7,
        'description': '你需要做手术了。',
        'choices': [
            {'text': '积极手术', 'stat_changes': {'health': 20, 'mood': -15, 'money': -30000}, 'difficulty_mod': 0.5},
            {'text': '保守治疗', 'stat_changes': {'health': 5, 'mood': -5, 'money': -50000}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '慢性病',
        'category': 'health',
        'min_age': 50,
        'max_age': 120,
        'base_weight': 1.0,
        'difficulty_level': 0.5,
        'description': '你得了慢性病，需要长期治疗和保养。',
        'choices': [
            {'text': '积极治疗', 'stat_changes': {'health': 3, 'money': -10000}, 'difficulty_mod': 0.5},
            {'text': '不太在意', 'stat_changes': {'health': -10}, 'difficulty_mod': 0.5}
        ]
    },
    
    # ==================== 财富类事件 ====================
    {
        'title': '继承遗产',
        'category': 'wealth',
        'min_age': 40,
        'max_age': 80,
        'base_weight': 0.7,
        'difficulty_level': 0.4,
        'description': '父母去世，留下了一些遗产。',
        'choices': [
            {'text': '妥善处理', 'stat_changes': {'money': 75000, 'karma': 5, 'mood': -10}, 'difficulty_mod': 0.5},
            {'text': '和兄弟姐妹争产', 'stat_changes': {'money': 64000, 'karma': -15, 'mood': -15}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '规划遗嘱',
        'category': 'wealth',
        'min_age': 50,
        'max_age': 100,
        'base_weight': 0.8,
        'difficulty_level': 0.4,
        'description': '你开始规划自己的遗嘱，分配财产。',
        'choices': [
            {'text': '认真规划', 'stat_changes': {'karma': 10, 'mood': 5, 'money': -5000}, 'difficulty_mod': 0.5},
            {'text': '觉得还早', 'stat_changes': {'mood': 3}, 'difficulty_mod': 0.5}
        ]
    },
    
    # ==================== 人生感悟事件 ====================
    {
        'title': '回顾人生',
        'category': 'milestone',
        'min_age': 60,
        'max_age': 120,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '你开始回顾自己的一生，酸甜苦辣。',
        'choices': [
            {'text': '觉得此生无憾', 'stat_changes': {'mood': 20, 'emotional_stability': 10, 'karma': 10}, 'difficulty_mod': 0.5},
            {'text': '觉得有些遗憾', 'stat_changes': {'mood': -5, 'intelligence': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '人生感悟',
        'category': 'milestone',
        'min_age': 50,
        'max_age': 120,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '年纪大了，对人生有了很多感悟。',
        'choices': [
            {'text': '把经验传给年轻人', 'stat_changes': {'karma': 10, 'social_capital': 8, 'mood': 10}, 'difficulty_mod': 0.5},
            {'text': '自己默默回味', 'stat_changes': {'intelligence': 8, 'emotional_stability': 8}, 'difficulty_mod': 0.5}
        ]
    },
    
    # ==================== 新增更多老年期事件 ====================
    {
        'title': '跳广场舞',
        'category': 'life',
        'min_age': 55,
        'max_age': 90,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '你开始每天去跳广场舞！',
        'choices': [
            {'text': '积极参与', 'stat_changes': {'physical_fitness': 8, 'social_capital': 10, 'mood': 15, 'energy': -8}, 'difficulty_mod': 0.5},
            {'text': '偶尔去', 'stat_changes': {'physical_fitness': 3, 'social_capital': 3, 'mood': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '学钓鱼',
        'category': 'life',
        'min_age': 50,
        'max_age': 90,
        'base_weight': 0.8,
        'difficulty_level': 0.2,
        'description': '你开始学钓鱼！',
        'choices': [
            {'text': '认真学习', 'stat_changes': {'physical_fitness': 3, 'emotional_stability': 8, 'mood': 10, 'money': -2000}, 'difficulty_mod': 0.5},
            {'text': '随便玩玩', 'stat_changes': {'mood': 8, 'emotional_stability': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '学下棋',
        'category': 'life',
        'min_age': 50,
        'max_age': 90,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '你开始学下棋！',
        'choices': [
            {'text': '认真学习', 'stat_changes': {'intelligence': 8, 'social_capital': 8, 'mood': 10, 'creativity': 5}, 'difficulty_mod': 0.5},
            {'text': '随便玩玩', 'stat_changes': {'social_capital': 5, 'mood': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '学书法',
        'category': 'life',
        'min_age': 50,
        'max_age': 90,
        'base_weight': 0.7,
        'difficulty_level': 0.3,
        'description': '你开始学书法！',
        'choices': [
            {'text': '认真练习', 'stat_changes': {'creativity': 10, 'emotional_stability': 8, 'mood': 10, 'money': -2000}, 'difficulty_mod': 0.5},
            {'text': '随便写写', 'stat_changes': {'creativity': 3, 'mood': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '学画画',
        'category': 'life',
        'min_age': 50,
        'max_age': 90,
        'base_weight': 0.7,
        'difficulty_level': 0.3,
        'description': '你开始学画画！',
        'choices': [
            {'text': '认真学习', 'stat_changes': {'creativity': 10, 'mood': 15, 'money': -2000}, 'difficulty_mod': 0.5},
            {'text': '随便画画', 'stat_changes': {'creativity': 3, 'mood': 8}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '学摄影',
        'category': 'life',
        'min_age': 50,
        'max_age': 85,
        'base_weight': 0.6,
        'difficulty_level': 0.3,
        'description': '你开始学摄影！',
        'choices': [
            {'text': '认真学习', 'stat_changes': {'creativity': 10, 'mood': 15, 'money': -20000}, 'difficulty_mod': 0.5},
            {'text': '随便拍拍', 'stat_changes': {'creativity': 3, 'mood': 8}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '参加老年大学',
        'category': 'life',
        'min_age': 50,
        'max_age': 90,
        'base_weight': 0.8,
        'difficulty_level': 0.3,
        'description': '你去参加老年大学！',
        'choices': [
            {'text': '认真学习', 'stat_changes': {'intelligence': 8, 'creativity': 5, 'social_capital': 8, 'mood': 10}, 'difficulty_mod': 0.5},
            {'text': '随便玩玩', 'stat_changes': {'social_capital': 5, 'mood': 8}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '和老友聚会',
        'category': 'social',
        'min_age': 55,
        'max_age': 100,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '你和老朋友们一起聚会！',
        'choices': [
            {'text': '开心聚会', 'stat_changes': {'social_capital': 10, 'mood': 15, 'charm': 3, 'money': -500}, 'difficulty_mod': 0.5},
            {'text': '简单聊聊', 'stat_changes': {'social_capital': 5, 'mood': 8}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '写回忆录',
        'category': 'life',
        'min_age': 60,
        'max_age': 100,
        'base_weight': 0.6,
        'difficulty_level': 0.3,
        'description': '你开始写自己的回忆录！',
        'choices': [
            {'text': '认真写作', 'stat_changes': {'creativity': 10, 'intelligence': 5, 'mood': 10, 'karma': 5}, 'difficulty_mod': 0.5},
            {'text': '随便写写', 'stat_changes': {'creativity': 3, 'mood': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '学习智能手机',
        'category': 'life',
        'min_age': 55,
        'max_age': 85,
        'base_weight': 0.8,
        'difficulty_level': 0.3,
        'description': '你开始学习使用智能手机！',
        'choices': [
            {'text': '认真学习', 'stat_changes': {'intelligence': 8, 'social_capital': 5, 'mood': 10, 'money': -2000}, 'difficulty_mod': 0.5},
            {'text': '简单使用', 'stat_changes': {'intelligence': 3, 'mood': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '用手机视频通话',
        'category': 'social',
        'min_age': 55,
        'max_age': 100,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '你学会了用手机和外地的子女视频通话！',
        'choices': [
            {'text': '开心视频', 'stat_changes': {'social_capital': 10, 'mood': 20, 'emotional_stability': 5}, 'difficulty_mod': 0.5},
            {'text': '偶尔通话', 'stat_changes': {'social_capital': 5, 'mood': 10}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '带孙子孙女',
        'category': 'family',
        'min_age': 50,
        'max_age': 90,
        'base_weight': 1.0,
        'difficulty_level': 0.4,
        'description': '你帮忙带孙子孙女！',
        'choices': [
            {'text': '开心带娃', 'stat_changes': {'mood': 20, 'karma': 10, 'energy': -20, 'health': -3}, 'difficulty_mod': 0.5},
            {'text': '偶尔帮忙', 'stat_changes': {'mood': 10, 'karma': 5, 'energy': -10}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '和子女一起旅行',
        'category': 'family',
        'min_age': 50,
        'max_age': 90,
        'base_weight': 0.8,
        'difficulty_level': 0.3,
        'description': '你和子女一起出去旅行！',
        'choices': [
            {'text': '开心旅行', 'stat_changes': {'mood': 20, 'social_capital': 8, 'money': -30000, 'energy': -15}, 'difficulty_mod': 0.5},
            {'text': '简单旅行', 'stat_changes': {'mood': 10, 'social_capital': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '定期体检',
        'category': 'health',
        'min_age': 50,
        'max_age': 120,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '你坚持定期去体检！',
        'choices': [
            {'text': '认真对待', 'stat_changes': {'health': 10, 'mood': 5, 'money': -5000}, 'difficulty_mod': 0.5},
            {'text': '不太在意', 'stat_changes': {'health': -2, 'mood': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '坚持健康饮食',
        'category': 'health',
        'min_age': 50,
        'max_age': 120,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '你开始坚持健康饮食！',
        'choices': [
            {'text': '坚持健康饮食', 'stat_changes': {'health': 10, 'physical_fitness': 5, 'emotional_stability': 5, 'mood': 10}, 'difficulty_mod': 0.5},
            {'text': '偶尔注意', 'stat_changes': {'health': 3, 'mood': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '社区活动',
        'category': 'social',
        'min_age': 50,
        'max_age': 100,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '你参加社区活动！',
        'choices': [
            {'text': '积极参与', 'stat_changes': {'social_capital': 10, 'karma': 5, 'mood': 10, 'energy': -8}, 'difficulty_mod': 0.5},
            {'text': '偶尔参加', 'stat_changes': {'social_capital': 3, 'mood': 5}, 'difficulty_mod': 0.5}
        ]
    }
]
