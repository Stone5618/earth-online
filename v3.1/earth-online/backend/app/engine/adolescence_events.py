
# -*- coding: utf-8 -*-
"""13-18岁青春期事件库"""

ADOLESCENCE_EVENTS = [
    # ==================== 教育类事件 ====================
    {
        'title': '初中第一次期中考试',
        'category': 'education',
        'min_age': 13,
        'max_age': 14,
        'base_weight': 1.0,
        'difficulty_level': 0.4,
        'description': '初中第一次期中考试，感觉压力有点大。',
        'choices': [
            {'text': '认真复习备考', 'stat_changes': {'intelligence': 8, 'energy': -15, 'mood': -3}, 'difficulty_mod': 0.5},
            {'text': '随便考考', 'stat_changes': {'intelligence': 2, 'mood': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '中考冲刺',
        'category': 'education',
        'min_age': 15,
        'max_age': 16,
        'base_weight': 1.0,
        'difficulty_level': 0.6,
        'description': '中考越来越近了，每天都在紧张地复习。',
        'choices': [
            {'text': '全力冲刺', 'stat_changes': {'intelligence': 10, 'energy': -25, 'health': -3, 'mood': -8}, 'difficulty_mod': 0.5},
            {'text': '保持节奏', 'stat_changes': {'intelligence': 5, 'energy': -10, 'mood': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '中考结束',
        'category': 'education',
        'min_age': 15,
        'max_age': 16,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '终于考完了！现在可以好好放松一下了！',
        'choices': [
            {'text': '尽情地玩', 'stat_changes': {'mood': 20, 'energy': 10, 'creativity': 3}, 'difficulty_mod': 0.5},
            {'text': '在家休息', 'stat_changes': {'mood': 10, 'health': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '中考成绩公布',
        'category': 'education',
        'min_age': 15,
        'max_age': 16,
        'base_weight': 1.0,
        'difficulty_level': 0.5,
        'description': '中考成绩出来了！',
        'choices': [
            {'text': '考上理想高中', 'stat_changes': {'intelligence': 8, 'mood': 20, 'karma': 5}, 'difficulty_mod': 0.5},
            {'text': '成绩不太理想', 'stat_changes': {'mood': -15, 'intelligence': 2}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '上高中了',
        'category': 'education',
        'min_age': 16,
        'max_age': 17,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '开始了高中生活，课程比初中难多了！',
        'choices': [
            {'text': '认真适应高中生活', 'stat_changes': {'intelligence': 5, 'social_capital': 5, 'mood': 8}, 'difficulty_mod': 0.5},
            {'text': '觉得压力很大', 'stat_changes': {'mood': -5, 'intelligence': 2}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '第一次月考',
        'category': 'education',
        'min_age': 16,
        'max_age': 18,
        'base_weight': 1.0,
        'difficulty_level': 0.4,
        'description': '高中第一次月考，题目比想象中难多了。',
        'choices': [
            {'text': '认真准备', 'stat_changes': {'intelligence': 6, 'energy': -12, 'mood': -3}, 'difficulty_mod': 0.5},
            {'text': '有点不想学', 'stat_changes': {'intelligence': -2, 'mood': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '文理分科',
        'category': 'education',
        'min_age': 16,
        'max_age': 17,
        'base_weight': 1.0,
        'difficulty_level': 0.5,
        'description': '要文理分科了，到底选文科还是理科呢？',
        'choices': [
            {'text': '选择理科', 'stat_changes': {'intelligence': 5, 'creativity': -1}, 'difficulty_mod': 0.5},
            {'text': '选择文科', 'stat_changes': {'creativity': 5, 'intelligence': 1}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '高考倒计时',
        'category': 'education',
        'min_age': 17,
        'max_age': 18,
        'base_weight': 1.0,
        'difficulty_level': 0.7,
        'description': '距离高考还有100天，人生的关键时刻！',
        'choices': [
            {'text': '每天学到凌晨', 'stat_changes': {'intelligence': 10, 'energy': -30, 'health': -5, 'mood': -10}, 'difficulty_mod': 0.5},
            {'text': '按部就班复习', 'stat_changes': {'intelligence': 5, 'energy': -15, 'mood': 2}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '高考',
        'category': 'education',
        'min_age': 17,
        'max_age': 19,
        'base_weight': 1.0,
        'difficulty_level': 0.8,
        'description': '终于，高考来了！十二年寒窗，就看今朝！',
        'choices': [
            {'text': '超常发挥', 'stat_changes': {'intelligence': 10, 'mood': 20, 'karma': 5}, 'difficulty_mod': 0.5},
            {'text': '正常发挥', 'stat_changes': {'intelligence': 3, 'mood': 5}, 'difficulty_mod': 0.5},
            {'text': '发挥失常', 'stat_changes': {'intelligence': -5, 'mood': -15}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '高考志愿填报',
        'category': 'education',
        'min_age': 17,
        'max_age': 19,
        'base_weight': 1.0,
        'difficulty_level': 0.6,
        'description': '成绩出来了，现在要填报高考志愿，选择大学和专业。',
        'choices': [
            {'text': '去理想的大学', 'stat_changes': {'intelligence': 5, 'mood': 15, 'karma': 3}, 'difficulty_mod': 0.5},
            {'text': '选择好就业的专业', 'stat_changes': {'intelligence': 3, 'mood': 8}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '收到大学录取通知书',
        'category': 'education',
        'min_age': 18,
        'max_age': 19,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '收到了大学录取通知书！终于可以松一口气了！',
        'choices': [
            {'text': '激动地和家人分享', 'stat_changes': {'mood': 25, 'charm': 8, 'karma': 5}, 'difficulty_mod': 0.5},
            {'text': '平静地接受', 'stat_changes': {'mood': 10, 'intelligence': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '选择复读',
        'category': 'education',
        'min_age': 18,
        'max_age': 19,
        'base_weight': 0.7,
        'difficulty_level': 0.6,
        'description': '高考成绩不理想，选择复读一年再战！',
        'choices': [
            {'text': '认真复读', 'stat_changes': {'intelligence': 8, 'energy': -20, 'emotional_stability': 5}, 'difficulty_mod': 0.5},
            {'text': '压力很大', 'stat_changes': {'intelligence': 3, 'mood': -10}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '参加学科竞赛',
        'category': 'education',
        'min_age': 14,
        'max_age': 18,
        'base_weight': 0.7,
        'difficulty_level': 0.5,
        'description': '参加数学、物理、化学、生物、信息学等学科竞赛。',
        'choices': [
            {'text': '努力备赛', 'stat_changes': {'intelligence': 10, 'energy': -20, 'creativity': 5}, 'difficulty_mod': 0.5},
            {'text': '试试水', 'stat_changes': {'intelligence': 3, 'mood': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '学编程',
        'category': 'education',
        'min_age': 14,
        'max_age': 18,
        'base_weight': 0.8,
        'difficulty_level': 0.4,
        'description': '开始学习编程，Python、C++、Java...',
        'choices': [
            {'text': '认真学编程', 'stat_changes': {'intelligence': 8, 'creativity': 5, 'mood': 8}, 'difficulty_mod': 0.5},
            {'text': '学着玩', 'stat_changes': {'intelligence': 2, 'creativity': 2, 'mood': 5}, 'difficulty_mod': 0.5}
        ]
    },
    
    # ==================== 社交类事件 ====================
    {
        'title': '初入高中认识新同学',
        'category': 'social',
        'min_age': 16,
        'max_age': 17,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '刚上高中，一切都是新的，要认识新的同学了。',
        'choices': [
            {'text': '主动认识同学', 'stat_changes': {'charm': 8, 'social_capital': 8, 'mood': 10}, 'difficulty_mod': 0.5},
            {'text': '有点害羞', 'stat_changes': {'mood': -2, 'charm': -1}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '和同学闹矛盾',
        'category': 'social',
        'min_age': 13,
        'max_age': 18,
        'base_weight': 1.0,
        'difficulty_level': 0.5,
        'description': '和好朋友闹别扭了，几天没说话。',
        'choices': [
            {'text': '主动道歉', 'stat_changes': {'karma': 8, 'charm': 5, 'mood': 5}, 'difficulty_mod': 0.5},
            {'text': '等着对方先来', 'stat_changes': {'mood': -8, 'karma': -2}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '加入社团',
        'category': 'social',
        'min_age': 13,
        'max_age': 18,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '学校社团招新了，有文学社、动漫社、摄影社、音乐社、街舞社等。',
        'choices': [
            {'text': '加入感兴趣的社团', 'stat_changes': {'creativity': 5, 'social_capital': 8, 'mood': 10}, 'difficulty_mod': 0.5},
            {'text': '不加入社团', 'stat_changes': {'mood': 3, 'intelligence': 1}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '参加社团活动',
        'category': 'social',
        'min_age': 13,
        'max_age': 18,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '参加社团的活动，和社团的朋友们一起玩。',
        'choices': [
            {'text': '积极参与', 'stat_changes': {'social_capital': 8, 'creativity': 5, 'mood': 12, 'energy': -5}, 'difficulty_mod': 0.5},
            {'text': '偶尔参加', 'stat_changes': {'social_capital': 2, 'mood': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '班级聚会',
        'category': 'social',
        'min_age': 13,
        'max_age': 18,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '班级聚会，大家一起去KTV、烧烤或者公园玩。',
        'choices': [
            {'text': '开心地玩', 'stat_changes': {'social_capital': 8, 'charm': 5, 'mood': 15}, 'difficulty_mod': 0.5},
            {'text': '有点不好意思', 'stat_changes': {'mood': 5, 'social_capital': 2}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '毕业聚会',
        'category': 'social',
        'min_age': 15,
        'max_age': 19,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '毕业了，全班同学最后一次聚会，很多人都哭了。',
        'choices': [
            {'text': '珍惜最后的时光', 'stat_changes': {'social_capital': 15, 'mood': 15, 'emotional_stability': 5}, 'difficulty_mod': 0.5},
            {'text': '不太感兴趣', 'stat_changes': {'mood': 3, 'social_capital': 2}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '和同学一起旅行',
        'category': 'social',
        'min_age': 15,
        'max_age': 18,
        'base_weight': 0.7,
        'difficulty_level': 0.4,
        'description': '和好朋友们一起出去旅行，毕业旅行或者假期旅行。',
        'choices': [
            {'text': '开心地玩', 'stat_changes': {'social_capital': 10, 'creativity': 8, 'mood': 20, 'money': -2000}, 'difficulty_mod': 0.5},
            {'text': '有点累', 'stat_changes': {'mood': 8, 'physical_fitness': 3, 'energy': -10}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '遭遇校园霸凌',
        'category': 'social',
        'min_age': 13,
        'max_age': 18,
        'base_weight': 0.5,
        'difficulty_level': 0.6,
        'description': '你被校园里的一些同学欺负了。',
        'choices': [
            {'text': '告诉老师和家长', 'stat_changes': {'karma': 5, 'mood': -5, 'emotional_stability': 3}, 'difficulty_mod': 0.5},
            {'text': '忍气吞声', 'stat_changes': {'mood': -15, 'emotional_stability': -5, 'karma': -2}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '认识到真正的朋友',
        'category': 'social',
        'min_age': 14,
        'max_age': 18,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '你意识到谁是真正的朋友，谁只是表面朋友。',
        'choices': [
            {'text': '珍惜真正的朋友', 'stat_changes': {'social_capital': 10, 'emotional_stability': 5, 'karma': 5}, 'difficulty_mod': 0.5},
            {'text': '不太在意', 'stat_changes': {'social_capital': 2, 'mood': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '和朋友一起过生日',
        'category': 'social',
        'min_age': 13,
        'max_age': 18,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '和朋友们一起过生日，开心！',
        'choices': [
            {'text': '开心地庆祝', 'stat_changes': {'social_capital': 8, 'charm': 5, 'mood': 15, 'money': -500}, 'difficulty_mod': 0.5},
            {'text': '简单地过', 'stat_changes': {'mood': 10, 'social_capital': 3}, 'difficulty_mod': 0.5}
        ]
    },
    
    # ==================== 情感类事件 ====================
    {
        'title': '喜欢上一个人',
        'category': 'relationship',
        'min_age': 13,
        'max_age': 18,
        'base_weight': 1.0,
        'difficulty_level': 0.5,
        'cooldown_category': 'love',
        'description': '你发现自己对班上某个同学有了不一样的感觉，每天都想见到他/她。',
        'choices': [
            {'text': '偷偷写情书', 'stat_changes': {'creativity': 3, 'charm': 2, 'mood': 8}, 'difficulty_mod': 0.5},
            {'text': '藏在心里', 'stat_changes': {'creativity': 2, 'mood': 3, 'intelligence': 2}, 'difficulty_mod': 0.5},
            {'text': '勇敢表白', 'stat_changes': {'charm': 5, 'mood': 10, 'karma': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '初恋',
        'category': 'relationship',
        'min_age': 14,
        'max_age': 18,
        'base_weight': 0.8,
        'difficulty_level': 0.5,
        'cooldown_category': 'love',
        'description': '你开始了第一段恋情！',
        'choices': [
            {'text': '甜蜜地恋爱', 'stat_changes': {'mood': 20, 'charm': 8, 'emotional_stability': 3}, 'difficulty_mod': 0.5},
            {'text': '有点紧张', 'stat_changes': {'mood': 10, 'charm': 3, 'emotional_stability': -2}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '约会',
        'category': 'relationship',
        'min_age': 14,
        'max_age': 18,
        'base_weight': 0.7,
        'difficulty_level': 0.4,
        'description': '和喜欢的人一起约会，看电影、吃饭、逛街。',
        'choices': [
            {'text': '开心地约会', 'stat_changes': {'mood': 18, 'charm': 10, 'money': -300}, 'difficulty_mod': 0.5},
            {'text': '有点紧张', 'stat_changes': {'mood': 8, 'charm': 2}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '失恋',
        'category': 'relationship',
        'min_age': 14,
        'max_age': 18,
        'base_weight': 0.7,
        'difficulty_level': 0.6,
        'description': '分手了，心里很难受。',
        'choices': [
            {'text': '好聚好散', 'stat_changes': {'mood': -10, 'emotional_stability': 5, 'karma': 3}, 'difficulty_mod': 0.5},
            {'text': '痛苦不堪', 'stat_changes': {'mood': -20, 'emotional_stability': -5, 'health': -3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '被暗恋',
        'category': 'relationship',
        'min_age': 13,
        'max_age': 18,
        'base_weight': 0.6,
        'difficulty_level': 0.3,
        'description': '你发现有人在偷偷喜欢你。',
        'choices': [
            {'text': '如果你也喜欢他/她', 'stat_changes': {'mood': 15, 'charm': 5, 'karma': 3}, 'difficulty_mod': 0.5},
            {'text': '如果你不喜欢他/她', 'stat_changes': {'mood': 3, 'karma': 2}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '收到情书',
        'category': 'relationship',
        'min_age': 13,
        'max_age': 18,
        'base_weight': 0.6,
        'difficulty_level': 0.3,
        'description': '你收到了一封情书！',
        'choices': [
            {'text': '如果也喜欢对方', 'stat_changes': {'mood': 15, 'charm': 5, 'karma': 3}, 'difficulty_mod': 0.5},
            {'text': '如果不喜欢对方', 'stat_changes': {'mood': 3, 'karma': 2}, 'difficulty_mod': 0.5}
        ]
    },
    
    # ==================== 家庭类事件 ====================
    {
        'title': '和父母吵架',
        'category': 'family',
        'min_age': 14,
        'max_age': 18,
        'base_weight': 1.0,
        'difficulty_level': 0.5,
        'description': '因为一件小事你和父母吵了起来，觉得他们不理解你。',
        'choices': [
            {'text': '冷静沟通', 'stat_changes': {'charm': 5, 'emotional_stability': 5, 'karma': 5}, 'difficulty_mod': 0.5},
            {'text': '摔门而出', 'stat_changes': {'mood': -10, 'karma': -5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '叛逆期',
        'category': 'family',
        'min_age': 14,
        'max_age': 17,
        'base_weight': 1.0,
        'difficulty_level': 0.4,
        'description': '你进入了叛逆期，不想听父母的话，觉得他们太啰嗦。',
        'choices': [
            {'text': '试着理解父母', 'stat_changes': {'emotional_stability': 5, 'karma': 5, 'mood': 3}, 'difficulty_mod': 0.5},
            {'text': '继续叛逆', 'stat_changes': {'mood': 5, 'karma': -5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '帮父母分担家务',
        'category': 'family',
        'min_age': 14,
        'max_age': 18,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '看到父母工作很辛苦，你主动帮着分担家务。',
        'choices': [
            {'text': '认真做家务', 'stat_changes': {'karma': 10, 'physical_fitness': 3, 'mood': 8}, 'difficulty_mod': 0.5},
            {'text': '随便做做', 'stat_changes': {'karma': 3, 'mood': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '和父母谈心',
        'category': 'family',
        'min_age': 15,
        'max_age': 18,
        'base_weight': 1.0,
        'difficulty_level': 0.4,
        'description': '和父母坐下来好好谈心，说说你的想法。',
        'choices': [
            {'text': '坦诚交流', 'stat_changes': {'emotional_stability': 8, 'charm': 5, 'karma': 5, 'mood': 10}, 'difficulty_mod': 0.5},
            {'text': '有些话不好意思说', 'stat_changes': {'emotional_stability': 3, 'mood': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '家庭经济困难',
        'category': 'family',
        'min_age': 13,
        'max_age': 18,
        'base_weight': 0.5,
        'difficulty_level': 0.5,
        'description': '家里经济有点困难，父母为了你的学费很辛苦。',
        'choices': [
            {'text': '节俭并帮父母分担', 'stat_changes': {'karma': 10, 'emotional_stability': 5, 'mood': -3, 'money': 500}, 'difficulty_mod': 0.5},
            {'text': '不太在意', 'stat_changes': {'karma': -3, 'mood': 3}, 'difficulty_mod': 0.5}
        ]
    },
    
    # ==================== 生活类事件 ====================
    {
        'title': '第一次打工',
        'category': 'life',
        'min_age': 15,
        'max_age': 18,
        'base_weight': 1.0,
        'difficulty_level': 0.5,
        'description': '你想利用假期打工赚钱，体验一下挣钱的不易。',
        'choices': [
            {'text': '去快餐店打工', 'stat_changes': {'money': 3000, 'charm': 3, 'energy': -15, 'mood': 5}, 'difficulty_mod': 0.5},
            {'text': '做家教', 'stat_changes': {'money': 2000, 'intelligence': 3, 'charm': 2}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '学开车',
        'category': 'life',
        'min_age': 18,
        'max_age': 18,
        'base_weight': 0.8,
        'difficulty_level': 0.4,
        'description': '满18岁了，可以学车考驾照了！',
        'choices': [
            {'text': '认真学车', 'stat_changes': {'physical_fitness': 3, 'intelligence': 5, 'money': -5000, 'energy': -10}, 'difficulty_mod': 0.5},
            {'text': '觉得学车麻烦', 'stat_changes': {'mood': -3, 'intelligence': 1}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '网瘾',
        'category': 'life',
        'min_age': 13,
        'max_age': 18,
        'base_weight': 0.7,
        'difficulty_level': 0.6,
        'description': '你开始沉迷于手机/电脑游戏，无法自拔，学习成绩也下降了。',
        'choices': [
            {'text': '控制自己', 'stat_changes': {'mood': -3, 'intelligence': 3, 'karma': 3}, 'difficulty_mod': 0.5},
            {'text': '继续沉迷', 'stat_changes': {'mood': 10, 'intelligence': -5, 'health': -5, 'energy': -15}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '追星',
        'category': 'life',
        'min_age': 13,
        'max_age': 17,
        'base_weight': 0.8,
        'difficulty_level': 0.4,
        'description': '你开始疯狂迷恋一个明星或者偶像，买周边、看演唱会。',
        'choices': [
            {'text': '理性追星', 'stat_changes': {'mood': 8, 'creativity': 3}, 'difficulty_mod': 0.5},
            {'text': '疯狂追星', 'stat_changes': {'mood': 15, 'money': -2000, 'intelligence': -3, 'energy': -10}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '学一门乐器',
        'category': 'life',
        'min_age': 13,
        'max_age': 18,
        'base_weight': 0.8,
        'difficulty_level': 0.4,
        'description': '你开始学一门乐器，吉他、钢琴、小提琴、架子鼓...',
        'choices': [
            {'text': '认真练习', 'stat_changes': {'creativity': 10, 'physical_fitness': 3, 'energy': -10, 'money': -2000}, 'difficulty_mod': 0.5},
            {'text': '学着玩', 'stat_changes': {'creativity': 3, 'mood': 8}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '学画画',
        'category': 'life',
        'min_age': 13,
        'max_age': 18,
        'base_weight': 0.8,
        'difficulty_level': 0.3,
        'description': '你开始学画画，素描、水彩、油画...',
        'choices': [
            {'text': '认真学画', 'stat_changes': {'creativity': 10, 'mood': 10, 'money': -1000}, 'difficulty_mod': 0.5},
            {'text': '学着玩', 'stat_changes': {'creativity': 3, 'mood': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '健身',
        'category': 'life',
        'min_age': 15,
        'max_age': 18,
        'base_weight': 0.8,
        'difficulty_level': 0.4,
        'description': '你开始健身，想练出好身材，变得更强壮。',
        'choices': [
            {'text': '坚持健身', 'stat_changes': {'physical_fitness': 10, 'health': 8, 'charm': 5, 'energy': -15}, 'difficulty_mod': 0.5},
            {'text': '三分钟热度', 'stat_changes': {'physical_fitness': 3, 'mood': -3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '开始在意自己的外表',
        'category': 'life',
        'min_age': 14,
        'max_age': 18,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '你开始在意自己的外表，买衣服、护肤、打扮。',
        'choices': [
            {'text': '适当打扮', 'stat_changes': {'charm': 8, 'mood': 8, 'money': -500}, 'difficulty_mod': 0.5},
            {'text': '过度打扮', 'stat_changes': {'charm': 5, 'mood': 10, 'money': -2000, 'karma': -2}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '探索自己的性取向',
        'category': 'life',
        'min_age': 14,
        'max_age': 18,
        'base_weight': 0.6,
        'difficulty_level': 0.5,
        'description': '你开始探索和思考自己的性取向。',
        'choices': [
            {'text': '接纳自己', 'stat_changes': {'emotional_stability': 10, 'mood': 5, 'karma': 5}, 'difficulty_mod': 0.5},
            {'text': '感到困惑', 'stat_changes': {'emotional_stability': -3, 'mood': -5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '青春期的烦恼',
        'category': 'life',
        'min_age': 13,
        'max_age': 16,
        'base_weight': 1.0,
        'difficulty_level': 0.4,
        'description': '你发现自己的身体和情绪都在发生变化，有些不知所措。',
        'choices': [
            {'text': '坦然接受', 'stat_changes': {'emotional_stability': 5, 'mood': 3}, 'difficulty_mod': 0.5},
            {'text': '害羞不安', 'stat_changes': {'mood': -3}, 'difficulty_mod': 0.5}
        ]
    },
    
    # ==================== 个人成长事件 ====================
    {
        'title': '发现自己的天赋',
        'category': 'milestone',
        'min_age': 13,
        'max_age': 18,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '你发现自己在某方面特别有天赋！',
        'choices': [
            {'text': '朝这个方向发展', 'stat_changes': {'creativity': 8, 'intelligence': 5, 'mood': 15}, 'difficulty_mod': 0.5},
            {'text': '当作爱好', 'stat_changes': {'creativity': 5, 'mood': 8}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '对未来感到迷茫',
        'category': 'milestone',
        'min_age': 16,
        'max_age': 18,
        'base_weight': 1.0,
        'difficulty_level': 0.4,
        'description': '你对未来感到迷茫，不知道自己以后想做什么。',
        'choices': [
            {'text': '思考人生方向', 'stat_changes': {'intelligence': 8, 'emotional_stability': 5, 'mood': 3}, 'difficulty_mod': 0.5},
            {'text': '不想想太多', 'stat_changes': {'mood': 5, 'intelligence': -1}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '形成自己的价值观',
        'category': 'milestone',
        'min_age': 15,
        'max_age': 18,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '你开始形成自己的价值观和人生观，对很多事情有了自己的看法。',
        'choices': [
            {'text': '形成独立的思考', 'stat_changes': {'intelligence': 8, 'emotional_stability': 5, 'karma': 5}, 'difficulty_mod': 0.5},
            {'text': '还在探索中', 'stat_changes': {'intelligence': 3, 'mood': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '学会独立',
        'category': 'milestone',
        'min_age': 16,
        'max_age': 18,
        'base_weight': 1.0,
        'difficulty_level': 0.4,
        'description': '你开始学会独立，自己的事情自己做，不再什么都依赖父母。',
        'choices': [
            {'text': '努力独立', 'stat_changes': {'emotional_stability': 10, 'intelligence': 5, 'physical_fitness': 3, 'karma': 5}, 'difficulty_mod': 0.5},
            {'text': '还想依赖父母', 'stat_changes': {'mood': 3, 'emotional_stability': -1}, 'difficulty_mod': 0.5}
        ]
    },
    
    # ==================== 新增更多青春期事件 ====================
    {
        'title': '参加数学竞赛',
        'category': 'education',
        'min_age': 14,
        'max_age': 18,
        'base_weight': 0.7,
        'difficulty_level': 0.4,
        'description': '你参加了数学竞赛！',
        'choices': [
            {'text': '认真准备', 'stat_changes': {'intelligence': 10, 'creativity': 5, 'energy': -15, 'mood': 8}, 'difficulty_mod': 0.5},
            {'text': '随便看看', 'stat_changes': {'intelligence': 3, 'mood': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '参加艺术比赛',
        'category': 'education',
        'min_age': 13,
        'max_age': 18,
        'base_weight': 0.6,
        'difficulty_level': 0.3,
        'description': '你参加了艺术比赛！',
        'choices': [
            {'text': '努力准备', 'stat_changes': {'creativity': 10, 'charm': 8, 'mood': 10, 'energy': -10}, 'difficulty_mod': 0.5},
            {'text': '重在参与', 'stat_changes': {'creativity': 3, 'mood': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '参加体育比赛',
        'category': 'education',
        'min_age': 13,
        'max_age': 18,
        'base_weight': 0.8,
        'difficulty_level': 0.3,
        'description': '你参加了学校的体育比赛！',
        'choices': [
            {'text': '努力训练', 'stat_changes': {'physical_fitness': 10, 'charm': 5, 'mood': 10, 'energy': -15}, 'difficulty_mod': 0.5},
            {'text': '重在参与', 'stat_changes': {'physical_fitness': 5, 'mood': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '参加社团活动',
        'category': 'social',
        'min_age': 13,
        'max_age': 18,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '你积极参加社团活动！',
        'choices': [
            {'text': '积极参与', 'stat_changes': {'social_capital': 10, 'creativity': 5, 'mood': 10, 'energy': -10}, 'difficulty_mod': 0.5},
            {'text': '偶尔参加', 'stat_changes': {'social_capital': 3, 'mood': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '成为学生会干部',
        'category': 'education',
        'min_age': 14,
        'max_age': 18,
        'base_weight': 0.5,
        'difficulty_level': 0.4,
        'description': '你成为了学生会干部！',
        'choices': [
            {'text': '认真工作', 'stat_changes': {'reputation': 8, 'social_capital': 8, 'energy': -15, 'mood': 5}, 'difficulty_mod': 0.5},
            {'text': '随便玩玩', 'stat_changes': {'mood': 3, 'social_capital': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '和同学去KTV',
        'category': 'social',
        'min_age': 14,
        'max_age': 18,
        'base_weight': 0.8,
        'difficulty_level': 0.2,
        'description': '你和同学一起去KTV唱歌！',
        'choices': [
            {'text': '开心唱歌', 'stat_changes': {'mood': 15, 'charm': 8, 'social_capital': 8, 'money': -500}, 'difficulty_mod': 0.5},
            {'text': '简单听听', 'stat_changes': {'mood': 8, 'social_capital': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '和同学去看电影',
        'category': 'social',
        'min_age': 14,
        'max_age': 18,
        'base_weight': 0.8,
        'difficulty_level': 0.2,
        'description': '你和同学一起去看电影！',
        'choices': [
            {'text': '开心看电影', 'stat_changes': {'mood': 15, 'creativity': 3, 'social_capital': 8, 'money': -300}, 'difficulty_mod': 0.5},
            {'text': '随便看看', 'stat_changes': {'mood': 8, 'social_capital': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '第一次喝奶茶',
        'category': 'life',
        'min_age': 13,
        'max_age': 18,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '你第一次喝到了网红奶茶！',
        'choices': [
            {'text': '开心品尝', 'stat_changes': {'mood': 15, 'creativity': 3, 'money': -50}, 'difficulty_mod': 0.5},
            {'text': '觉得一般', 'stat_changes': {'mood': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '第一次用智能手机',
        'category': 'life',
        'min_age': 13,
        'max_age': 16,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '你第一次有了自己的智能手机！',
        'choices': [
            {'text': '开心使用', 'stat_changes': {'mood': 20, 'intelligence': 3, 'social_capital': 5, 'money': -5000}, 'difficulty_mod': 0.5},
            {'text': '合理使用', 'stat_changes': {'intelligence': 5, 'mood': 10, 'karma': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '开始看网络小说',
        'category': 'life',
        'min_age': 14,
        'max_age': 18,
        'base_weight': 0.7,
        'difficulty_level': 0.2,
        'description': '你开始看网络小说了！',
        'choices': [
            {'text': '适当阅读', 'stat_changes': {'creativity': 5, 'mood': 10, 'intelligence': 3}, 'difficulty_mod': 0.5},
            {'text': '沉迷小说', 'stat_changes': {'mood': 8, 'intelligence': -5, 'energy': -10}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '开始追星',
        'category': 'life',
        'min_age': 13,
        'max_age': 18,
        'base_weight': 0.8,
        'difficulty_level': 0.3,
        'description': '你开始追星了！',
        'choices': [
            {'text': '理性追星', 'stat_changes': {'mood': 15, 'charm': 3, 'creativity': 3}, 'difficulty_mod': 0.5},
            {'text': '疯狂追星', 'stat_changes': {'mood': 20, 'money': -5000, 'karma': -2, 'intelligence': -3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '第一次参加夏令营',
        'category': 'life',
        'min_age': 14,
        'max_age': 18,
        'base_weight': 0.6,
        'difficulty_level': 0.3,
        'description': '你第一次参加夏令营！',
        'choices': [
            {'text': '积极参与', 'stat_changes': {'mood': 20, 'social_capital': 10, 'physical_fitness': 3, 'energy': -15, 'money': -3000}, 'difficulty_mod': 0.5},
            {'text': '简单参加', 'stat_changes': {'mood': 10, 'social_capital': 5}, 'difficulty_mod': 0.5}
        ]
    }
]
