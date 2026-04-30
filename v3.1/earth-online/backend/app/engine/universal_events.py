# -*- coding: utf-8 -*-
"""Universal fallback events that can happen at any age.
These ensure the game never runs out of events."""

UNIVERSAL_EVENTS = [
    {
        'title': '平静的一天',
        'category': 'life',
        'min_age': 0,
        'max_age': 100,
        'base_weight': 0.5,
        'difficulty_level': 0.1,
        'description': '今天没有什么特别的事情发生，生活平静而安稳。',
        'choices': [
            {'text': '享受宁静', 'stat_changes': {'mood': 2, 'energy': 1}, 'follow_up': '你感到内心平静，精神焕发。'},
            {'text': '思考人生', 'stat_changes': {'intelligence': 1, 'mood': -1}, 'follow_up': '你陷入了沉思，对这个世界有了新的认识。'},
        ]
    },
    {
        'title': '偶遇路人',
        'category': 'social',
        'min_age': 0,
        'max_age': 100,
        'base_weight': 0.8,
        'difficulty_level': 0.2,
        'description': '你在路上遇到了一个陌生人，他看起来有些故事。',
        'choices': [
            {'text': '主动搭话', 'stat_changes': {'social_capital': 2, 'charm': 1, 'energy': -1}, 'follow_up': '你们聊得很投机，交换了联系方式。'},
            {'text': '点头致意', 'stat_changes': {'mood': 1}, 'follow_up': '你们礼貌地点头致意，各自离去。'},
            {'text': '视而不见', 'stat_changes': {'mood': -1}, 'follow_up': '你匆匆走过，没有注意到对方的表情。'},
        ]
    },
    {
        'title': '天气变化',
        'category': 'life',
        'min_age': 0,
        'max_age': 100,
        'base_weight': 0.6,
        'difficulty_level': 0.1,
        'description': '今天的天气有些特别，让你感受到了大自然的魅力。',
        'choices': [
            {'text': '欣赏天气', 'stat_changes': {'mood': 3, 'creativity': 1}, 'follow_up': '你驻足欣赏，被大自然的美景所打动。'},
            {'text': '继续赶路', 'stat_changes': {'energy': -1}, 'follow_up': '你匆匆赶路，没有注意到窗外的风景。'},
        ]
    },
    {
        'title': '家庭聚餐',
        'category': 'family',
        'min_age': 0,
        'max_age': 100,
        'base_weight': 0.7,
        'difficulty_level': 0.2,
        'description': '家人准备了一顿丰盛的晚餐，邀请你一起享用。',
        'choices': [
            {'text': '欣然赴宴', 'stat_changes': {'health': 2, 'mood': 3, 'family_harmony': 2}, 'follow_up': '你们围坐在一起，享受着温馨的时光。'},
            {'text': '有事推脱', 'stat_changes': {'family_harmony': -1, 'mood': -1}, 'follow_up': '你找了个借口推脱，家人有些失望。'},
        ]
    },
    {
        'title': '发现新事物',
        'category': 'life',
        'min_age': 0,
        'max_age': 100,
        'base_weight': 0.6,
        'difficulty_level': 0.3,
        'description': '你在日常生活中发现了一件有趣的新事物。',
        'choices': [
            {'text': '深入研究', 'stat_changes': {'intelligence': 2, 'creativity': 1, 'energy': -2}, 'follow_up': '你投入了大量时间研究，收获颇丰。'},
            {'text': '简单了解', 'stat_changes': {'intelligence': 1, 'mood': 1}, 'follow_up': '你粗略了解了一下，觉得挺有意思。'},
            {'text': '不予理会', 'stat_changes': {'mood': -1}, 'follow_up': '你觉得没什么特别的，继续做自己的事。'},
        ]
    },
    {
        'title': '意外之财',
        'category': 'wealth',
        'min_age': 0,
        'max_age': 100,
        'base_weight': 0.4,
        'difficulty_level': 0.2,
        'description': '你意外获得了一笔小钱，虽然不多，但让人开心。',
        'choices': [
            {'text': '存起来', 'stat_changes': {'money': 500, 'mood': 2}, 'follow_up': '你把钱存进了储蓄罐，为未来做准备。'},
            {'text': '犒劳自己', 'stat_changes': {'money': 500, 'mood': 3, 'health': -1}, 'follow_up': '你买了些好吃的，享受了一番。'},
            {'text': '分享给家人', 'stat_changes': {'money': 500, 'family_harmony': 3, 'karma': 2}, 'follow_up': '你把钱分给了家人，大家都很开心。'},
        ]
    },
    {
        'title': '小病小痛',
        'category': 'health',
        'min_age': 0,
        'max_age': 100,
        'base_weight': 0.5,
        'difficulty_level': 0.3,
        'description': '你感觉身体有些不适，可能是最近太累了。',
        'choices': [
            {'text': '及时休息', 'stat_changes': {'health': 2, 'energy': 3, 'mood': 1}, 'follow_up': '你好好休息了一晚，第二天精神焕发。'},
            {'text': '硬撑过去', 'stat_changes': {'health': -2, 'energy': -1, 'mood': -2}, 'follow_up': '你强撑着继续工作，结果病情加重了。'},
            {'text': '去看医生', 'stat_changes': {'health': 3, 'money': -200, 'mood': 1}, 'follow_up': '医生开了些药，你按时服用后很快康复。'},
        ]
    },
    {
        'title': '邻里互动',
        'category': 'social',
        'min_age': 0,
        'max_age': 100,
        'base_weight': 0.6,
        'difficulty_level': 0.2,
        'description': '邻居来找你，似乎有些事情需要帮忙。',
        'choices': [
            {'text': '热心帮助', 'stat_changes': {'social_capital': 3, 'karma': 2, 'energy': -2}, 'follow_up': '你热心地帮助了邻居，赢得了好评。'},
            {'text': '委婉拒绝', 'stat_changes': {'social_capital': -1, 'mood': 1}, 'follow_up': '你找了个理由推脱，邻居有些失望。'},
            {'text': '置之不理', 'stat_changes': {'social_capital': -2, 'karma': -1}, 'follow_up': '你装作不在家，邻居只好离开。'},
        ]
    },
    {
        'title': '学习新技能',
        'category': 'education',
        'min_age': 0,
        'max_age': 100,
        'base_weight': 0.6,
        'difficulty_level': 0.4,
        'description': '你有机会学习一项新的技能或知识。',
        'choices': [
            {'text': '认真学习', 'stat_changes': {'intelligence': 2, 'creativity': 1, 'energy': -2}, 'follow_up': '你认真学习，掌握了不少新知识。'},
            {'text': '浅尝辄止', 'stat_changes': {'intelligence': 1, 'mood': 1}, 'follow_up': '你简单了解了一下，觉得还挺有意思。'},
            {'text': '放弃学习', 'stat_changes': {'mood': -1}, 'follow_up': '你觉得太难了，选择了放弃。'},
        ]
    },
    {
        'title': '意外惊喜',
        'category': 'life',
        'min_age': 0,
        'max_age': 100,
        'base_weight': 0.5,
        'difficulty_level': 0.2,
        'description': '生活中出现了一个小小的惊喜，让你心情愉悦。',
        'choices': [
            {'text': '尽情享受', 'stat_changes': {'mood': 5, 'luck': 1}, 'follow_up': '你沉浸在喜悦中，感觉整个世界都明亮了。'},
            {'text': '保持冷静', 'stat_changes': {'mood': 2, 'intelligence': 1}, 'follow_up': '你虽然开心，但保持了理智。'},
        ]
    },
]
