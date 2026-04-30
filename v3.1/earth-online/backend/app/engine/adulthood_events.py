
# -*- coding: utf-8 -*-
"""19-50岁成年期事件库"""

ADULTHOOD_EVENTS = [
    # ==================== 大学/教育类事件 ====================
    {
        'title': '进入大学',
        'category': 'education',
        'min_age': 18,
        'max_age': 20,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '你进入了大学校园，开始了新的生活！',
        'choices': [
            {'text': '积极参加活动', 'stat_changes': {'social_capital': 10, 'creativity': 5, 'mood': 15}, 'difficulty_mod': 0.5},
            {'text': '专注学业', 'stat_changes': {'intelligence': 8, 'mood': 8}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '加入大学社团',
        'category': 'education',
        'min_age': 18,
        'max_age': 22,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '大学社团招新了，有各种有趣的社团可以参加！',
        'choices': [
            {'text': '加入感兴趣的社团', 'stat_changes': {'creativity': 5, 'social_capital': 8, 'mood': 10}, 'difficulty_mod': 0.5},
            {'text': '专注学习不参加', 'stat_changes': {'intelligence': 3, 'mood': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '大学考试',
        'category': 'education',
        'min_age': 18,
        'max_age': 22,
        'base_weight': 1.0,
        'difficulty_level': 0.4,
        'description': '要考试了，得赶紧复习！',
        'choices': [
            {'text': '认真复习', 'stat_changes': {'intelligence': 8, 'energy': -15, 'mood': -2}, 'difficulty_mod': 0.5},
            {'text': '临时抱佛脚', 'stat_changes': {'intelligence': 2, 'mood': -5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '大学挂科',
        'category': 'education',
        'min_age': 18,
        'max_age': 22,
        'base_weight': 0.7,
        'difficulty_level': 0.4,
        'description': '期末考试成绩出来了，你挂科了！',
        'choices': [
            {'text': '准备补考', 'stat_changes': {'intelligence': 5, 'energy': -10, 'mood': -5}, 'difficulty_mod': 0.5},
            {'text': '重修', 'stat_changes': {'intelligence': 3, 'mood': -8, 'money': -3000}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '准备考研',
        'category': 'education',
        'min_age': 21,
        'max_age': 23,
        'base_weight': 0.8,
        'difficulty_level': 0.6,
        'description': '你准备考研，继续深造！',
        'choices': [
            {'text': '认真备考', 'stat_changes': {'intelligence': 10, 'energy': -25, 'health': -3}, 'difficulty_mod': 0.5},
            {'text': '试试看', 'stat_changes': {'intelligence': 3, 'mood': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '大学毕业',
        'category': 'milestone',
        'min_age': 21,
        'max_age': 23,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '大学毕业了！你的学生生涯即将结束！',
        'choices': [
            {'text': '对未来充满期待', 'stat_changes': {'mood': 15, 'intelligence': 5, 'social_capital': 5}, 'difficulty_mod': 0.5},
            {'text': '有些迷茫', 'stat_changes': {'mood': 3, 'intelligence': 2}, 'difficulty_mod': 0.5}
        ]
    },
    
    # ==================== 工作/职业类事件 ====================
    {
        'title': '找工作',
        'category': 'career',
        'min_age': 21,
        'max_age': 25,
        'base_weight': 1.0,
        'difficulty_level': 0.6,
        'description': '毕业了，你要开始找工作了！',
        'choices': [
            {'text': '海投简历', 'stat_changes': {'social_capital': 8, 'charm': 3, 'energy': -15}, 'difficulty_mod': 0.5},
            {'text': '考研深造', 'stat_changes': {'intelligence': 8, 'money': -5000, 'energy': -20}, 'difficulty_mod': 0.5},
            {'text': '创业', 'stat_changes': {'creativity': 10, 'money': -20000, 'luck': 5, 'energy': -25}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '第一份工作',
        'category': 'career',
        'min_age': 21,
        'max_age': 25,
        'base_weight': 1.0,
        'difficulty_level': 0.5,
        'description': '你找到了第一份工作！',
        'choices': [
            {'text': '认真工作', 'stat_changes': {'intelligence': 8, 'social_capital': 5, 'energy': -15, 'money': 3000}, 'difficulty_mod': 0.5},
            {'text': '混日子', 'stat_changes': {'money': 3000, 'karma': -3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '职场新人',
        'category': 'career',
        'min_age': 21,
        'max_age': 25,
        'base_weight': 1.0,
        'difficulty_level': 0.4,
        'description': '作为职场新人，你有些不适应。',
        'choices': [
            {'text': '努力适应', 'stat_changes': {'intelligence': 5, 'charm': 3, 'social_capital': 5, 'energy': -10}, 'difficulty_mod': 0.5},
            {'text': '觉得工作不适合', 'stat_changes': {'mood': -5, 'intelligence': 2}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '工作遇到困难',
        'category': 'career',
        'min_age': 22,
        'max_age': 35,
        'base_weight': 1.0,
        'difficulty_level': 0.5,
        'description': '工作中遇到了困难，不知道该怎么解决。',
        'choices': [
            {'text': '请教同事', 'stat_changes': {'social_capital': 5, 'intelligence': 3, 'karma': 3}, 'difficulty_mod': 0.5},
            {'text': '自己硬扛', 'stat_changes': {'intelligence': 5, 'energy': -15, 'mood': -5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '被老板骂',
        'category': 'career',
        'min_age': 22,
        'max_age': 35,
        'base_weight': 1.0,
        'difficulty_level': 0.5,
        'description': '你在工作上犯了错误，被老板训了一顿。',
        'choices': [
            {'text': '虚心接受', 'stat_changes': {'intelligence': 3, 'charm': 3, 'karma': 3, 'mood': -5}, 'difficulty_mod': 0.5},
            {'text': '不服气', 'stat_changes': {'mood': -8}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '升职加薪',
        'category': 'career',
        'min_age': 25,
        'max_age': 40,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '你的努力得到了回报，老板给你升职加薪了！',
        'choices': [
            {'text': '接受并更加努力', 'stat_changes': {'money': 50000, 'reputation': 8, 'energy': -15, 'mood': 15}, 'difficulty_mod': 0.5},
            {'text': '接受但保持节奏', 'stat_changes': {'money': 30000, 'mood': 10, 'karma': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '第一次拿年终奖',
        'category': 'career',
        'min_age': 22,
        'max_age': 35,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '年底了，公司发了年终奖！',
        'choices': [
            {'text': '存起来投资', 'stat_changes': {'money': 30000, 'intelligence': 3, 'karma': 3}, 'difficulty_mod': 0.5},
            {'text': '犒劳自己', 'stat_changes': {'money': 15000, 'mood': 15, 'charm': 3}, 'difficulty_mod': 0.5},
            {'text': '给家人买礼物', 'stat_changes': {'money': 10000, 'karma': 8, 'mood': 10}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '同事聚会',
        'category': 'career',
        'min_age': 22,
        'max_age': 35,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '同事们约你晚上去吃饭唱歌。',
        'choices': [
            {'text': '积极参加', 'stat_changes': {'social_capital': 8, 'charm': 5, 'mood': 10, 'money': -300}, 'difficulty_mod': 0.5},
            {'text': '不去', 'stat_changes': {'social_capital': -3, 'mood': 3, 'energy': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '跳槽',
        'category': 'career',
        'min_age': 22,
        'max_age': 45,
        'base_weight': 1.0,
        'difficulty_level': 0.5,
        'description': '你收到了另一家公司的offer，要不要跳槽？',
        'choices': [
            {'text': '跳槽接受挑战', 'stat_changes': {'money': 40000, 'reputation': 5, 'energy': -15, 'intelligence': 3}, 'difficulty_mod': 0.5},
            {'text': '留在原公司', 'stat_changes': {'money': 10000, 'karma': 5, 'mood': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '创业成功',
        'category': 'career',
        'min_age': 25,
        'max_age': 50,
        'base_weight': 0.7,
        'difficulty_level': 0.7,
        'description': '你的创业项目获得了突破性进展！',
        'choices': [
            {'text': '扩大规模', 'stat_changes': {'money': 50000, 'reputation': 15, 'energy': -30, 'mood': 20}, 'difficulty_mod': 0.5},
            {'text': '稳健经营', 'stat_changes': {'money': 20000, 'mood': 15, 'karma': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '创业失败',
        'category': 'career',
        'min_age': 25,
        'max_age': 50,
        'base_weight': 0.8,
        'difficulty_level': 0.8,
        'description': '创业失败了，血本无归。',
        'choices': [
            {'text': '总结经验重新开始', 'stat_changes': {'money': -50000, 'intelligence': 10, 'mood': -15}, 'difficulty_mod': 0.5},
            {'text': '回去打工', 'stat_changes': {'money': -30000, 'mood': -20}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '互联网裁员潮',
        'category': 'career',
        'min_age': 22,
        'max_age': 45,
        'base_weight': 0.8,
        'difficulty_level': 0.6,
        'era_trigger': 'era_recession',
        'description': '公司开始裁员了，人心惶惶。',
        'choices': [
            {'text': '努力表现保住工作', 'stat_changes': {'intelligence': 5, 'energy': -20, 'mood': -8}, 'difficulty_mod': 0.5},
            {'text': '提前找下家', 'stat_changes': {'charm': 5, 'mood': 3, 'energy': -15}, 'difficulty_mod': 0.5},
            {'text': '拿了赔偿走人', 'stat_changes': {'money': 50000, 'mood': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '公司内斗',
        'category': 'career',
        'min_age': 28,
        'max_age': 45,
        'base_weight': 0.7,
        'difficulty_level': 0.5,
        'description': '公司内部派系斗争，你被卷入了。',
        'choices': [
            {'text': '战队选边', 'stat_changes': {'reputation': 5, 'mood': -5, 'charm': 3}, 'difficulty_mod': 0.5},
            {'text': '保持中立', 'stat_changes': {'karma': 5, 'mood': 3}, 'difficulty_mod': 0.5},
            {'text': '趁机跳槽', 'stat_changes': {'money': 20000, 'mood': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '到了事业瓶颈期',
        'category': 'career',
        'min_age': 35,
        'max_age': 50,
        'base_weight': 0.8,
        'difficulty_level': 0.5,
        'description': '你感觉自己到了事业瓶颈期，很难再有提升了。',
        'choices': [
            {'text': '考虑转行', 'stat_changes': {'intelligence': 8, 'creativity': 5, 'mood': 3}, 'difficulty_mod': 0.5},
            {'text': '继续坚持', 'stat_changes': {'karma': 3, 'mood': 3}, 'difficulty_mod': 0.5}
        ]
    },
    
    # ==================== 婚姻/家庭类事件 ====================
    {
        'title': '和大学同学恋爱',
        'category': 'relationship',
        'min_age': 18,
        'max_age': 25,
        'base_weight': 0.8,
        'difficulty_level': 0.4,
        'cooldown_category': 'love',
        'description': '你在大学遇到了一个很有感觉的人。',
        'choices': [
            {'text': '主动追求', 'stat_changes': {'charm': 8, 'mood': 15, 'karma': 5}, 'difficulty_mod': 0.5},
            {'text': '顺其自然', 'stat_changes': {'mood': 8, 'intelligence': 2}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '相亲',
        'category': 'relationship',
        'min_age': 24,
        'max_age': 35,
        'base_weight': 1.0,
        'difficulty_level': 0.5,
        'cooldown_category': 'love',
        'description': '朋友给你介绍了一个对象，约你见面。',
        'choices': [
            {'text': '去见面', 'stat_changes': {'charm': 3, 'mood': 8, 'money': -500}, 'difficulty_mod': 0.5},
            {'text': '不去', 'stat_changes': {'mood': -3, 'karma': -2}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '结婚',
        'category': 'milestone',
        'min_age': 22,
        'max_age': 45,
        'base_weight': 1.0,
        'difficulty_level': 0.5,
        'cooldown_category': 'family',
        'description': '你决定和心爱的人步入婚姻殿堂。',
        'choices': [
            {'text': '举办盛大婚礼', 'stat_changes': {'money': -30000, 'mood': 20, 'charm': 10, 'karma': 5}, 'difficulty_mod': 0.5},
            {'text': '简单领证', 'stat_changes': {'money': -5000, 'mood': 15, 'karma': 8}, 'difficulty_mod': 0.5},
            {'text': '旅行结婚', 'stat_changes': {'money': -50000, 'mood': 20, 'creativity': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '孩子出生',
        'category': 'milestone',
        'min_age': 22,
        'max_age': 45,
        'base_weight': 1.0,
        'difficulty_level': 0.6,
        'cooldown_category': 'family',
        'description': '你的孩子出生了！初为人父/母，百感交集。',
        'choices': [
            {'text': '悉心照顾', 'stat_changes': {'mood': 20, 'karma': 10, 'money': -50000, 'energy': -25, 'health': -5}, 'difficulty_mod': 0.5},
            {'text': '请月嫂帮忙', 'stat_changes': {'money': -30000, 'mood': 15, 'energy': -10}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '养孩子',
        'category': 'family',
        'min_age': 25,
        'max_age': 45,
        'base_weight': 1.0,
        'difficulty_level': 0.5,
        'description': '养孩子真不容易啊！',
        'choices': [
            {'text': '用心照顾', 'stat_changes': {'karma': 10, 'health': -5, 'mood': 10, 'money': -20000}, 'difficulty_mod': 0.5},
            {'text': '交给父母带', 'stat_changes': {'karma': 3, 'mood': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '孩子上学',
        'category': 'family',
        'min_age': 28,
        'max_age': 45,
        'base_weight': 1.0,
        'difficulty_level': 0.4,
        'description': '你的孩子到了上学的年龄。',
        'choices': [
            {'text': '送优质学校', 'stat_changes': {'money': -80000, 'karma': 5, 'mood': 5}, 'difficulty_mod': 0.5},
            {'text': '普通学校就行', 'stat_changes': {'money': -10000, 'mood': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '孩子青春期',
        'category': 'family',
        'min_age': 35,
        'max_age': 50,
        'base_weight': 0.8,
        'difficulty_level': 0.5,
        'description': '孩子进入了青春期，变得叛逆起来。',
        'choices': [
            {'text': '理解和引导', 'stat_changes': {'emotional_stability': 5, 'charm': 3, 'karma': 5}, 'difficulty_mod': 0.5},
            {'text': '严厉管教', 'stat_changes': {'mood': -5, 'karma': -3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '和伴侣吵架',
        'category': 'family',
        'min_age': 24,
        'max_age': 50,
        'base_weight': 1.0,
        'difficulty_level': 0.5,
        'description': '因为一件小事和伴侣吵架了。',
        'choices': [
            {'text': '冷静沟通', 'stat_changes': {'charm': 5, 'emotional_stability': 5, 'karma': 5}, 'difficulty_mod': 0.5},
            {'text': '冷战', 'stat_changes': {'mood': -8, 'karma': -2}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '离婚',
        'category': 'family',
        'min_age': 25,
        'max_age': 50,
        'base_weight': 0.7,
        'difficulty_level': 0.8,
        'description': '婚姻走到了尽头，你们决定离婚。',
        'choices': [
            {'text': '和平分手', 'stat_changes': {'money': -50000, 'mood': -10, 'karma': 5}, 'difficulty_mod': 0.5},
            {'text': '撕破脸', 'stat_changes': {'money': -80000, 'mood': -20, 'karma': -8}, 'difficulty_mod': 0.5}
        ]
    },
    
    # ==================== 财富/生活类事件 ====================
    {
        'title': '第一次领工资',
        'category': 'wealth',
        'min_age': 21,
        'max_age': 25,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '你领到了人生第一份工资！',
        'choices': [
            {'text': '给家人买礼物', 'stat_changes': {'money': -3000, 'karma': 10, 'mood': 15}, 'difficulty_mod': 0.5},
            {'text': '自己存起来', 'stat_changes': {'money': 5000, 'intelligence': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '攒到第一桶金',
        'category': 'wealth',
        'min_age': 25,
        'max_age': 35,
        'base_weight': 1.0,
        'difficulty_level': 0.4,
        'description': '你终于攒到了人生第一桶金！',
        'choices': [
            {'text': '投资理财', 'stat_changes': {'money': 50000, 'intelligence': 8, 'luck': 3}, 'difficulty_mod': 0.5},
            {'text': '存银行', 'stat_changes': {'money': 30000, 'karma': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '租房',
        'category': 'wealth',
        'min_age': 20,
        'max_age': 35,
        'base_weight': 1.0,
        'difficulty_level': 0.4,
        'description': '你开始在外面租房住了。',
        'choices': [
            {'text': '租个好点的', 'stat_changes': {'money': -24000, 'mood': 8, 'charm': 2}, 'difficulty_mod': 0.5},
            {'text': '找便宜的', 'stat_changes': {'money': -12000, 'mood': -2, 'health': -2}, 'difficulty_mod': 0.5},
            {'text': '合租', 'stat_changes': {'money': -8000, 'charm': 3, 'mood': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '买房',
        'category': 'wealth',
        'min_age': 25,
        'max_age': 50,
        'base_weight': 1.0,
        'difficulty_level': 0.6,
        'description': '你决定买一套属于自己的房子。',
        'choices': [
            {'text': '贷款买房', 'stat_changes': {'money': -75000, 'mood': 15, 'charm': 5}, 'difficulty_mod': 0.5},
            {'text': '父母帮忙付首付', 'stat_changes': {'money': -45000, 'mood': 12, 'karma': -2}, 'difficulty_mod': 0.5},
            {'text': '继续租房', 'stat_changes': {'mood': -3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '房贷压力',
        'category': 'wealth',
        'min_age': 25,
        'max_age': 55,
        'base_weight': 1.0,
        'difficulty_level': 0.6,
        'description': '每个月的房贷让你喘不过气来。',
        'choices': [
            {'text': '拼命赚钱还贷', 'stat_changes': {'money': -18000, 'energy': -25, 'health': -3, 'mood': -8}, 'difficulty_mod': 0.5},
            {'text': '找家人帮忙', 'stat_changes': {'money': -60000, 'karma': -3, 'mood': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '买车',
        'category': 'wealth',
        'min_age': 22,
        'max_age': 50,
        'base_weight': 1.0,
        'difficulty_level': 0.4,
        'description': '你决定买一辆车。',
        'choices': [
            {'text': '买新车贷款', 'stat_changes': {'money': -22500, 'mood': 15, 'charm': 3, 'energy': 5}, 'difficulty_mod': 0.5},
            {'text': '买二手车', 'stat_changes': {'money': -50000, 'mood': 8, 'energy': 5}, 'difficulty_mod': 0.5},
            {'text': '不买', 'stat_changes': {'mood': -3, 'energy': -5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '投资理财',
        'category': 'wealth',
        'min_age': 25,
        'max_age': 60,
        'base_weight': 1.0,
        'difficulty_level': 0.4,
        'description': '你手头有些闲钱，想试试投资。',
        'choices': [
            {'text': '买基金', 'stat_changes': {'money': 20000, 'intelligence': 5, 'luck': 3}, 'difficulty_mod': 0.5},
            {'text': '买股票', 'stat_changes': {'money': 30000, 'luck': 5, 'intelligence': 3}, 'difficulty_mod': 0.5},
            {'text': '定期存款', 'stat_changes': {'money': 10000, 'karma': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '投资失败',
        'category': 'wealth',
        'min_age': 28,
        'max_age': 60,
        'base_weight': 0.8,
        'difficulty_level': 0.6,
        'description': '你的投资亏了一大笔钱。',
        'choices': [
            {'text': '总结经验再战', 'stat_changes': {'money': -100000, 'intelligence': 8, 'mood': -10}, 'difficulty_mod': 0.5},
            {'text': '再也不碰投资了', 'stat_changes': {'money': -100000, 'mood': -15}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '一夜暴富',
        'category': 'wealth',
        'min_age': 22,
        'max_age': 60,
        'base_weight': 0.3,
        'difficulty_level': 0.2,
        'description': '你突然暴富了！可能是中彩票、炒股赚大钱、继承遗产等。',
        'choices': [
            {'text': '好好打理财富', 'stat_changes': {'money': 250000, 'mood': 30, 'charm': 10}, 'difficulty_mod': 0.5},
            {'text': '挥霍无度', 'stat_changes': {'money': 150000, 'mood': 25, 'karma': -5, 'health': -5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '搬家',
        'category': 'life',
        'min_age': 20,
        'max_age': 50,
        'base_weight': 1.0,
        'difficulty_level': 0.4,
        'description': '你要搬到另一个城市生活。',
        'choices': [
            {'text': '搬去一线城市', 'stat_changes': {'money': -30000, 'luck': 5, 'charm': 3, 'energy': -15}, 'difficulty_mod': 0.5},
            {'text': '搬回老家', 'stat_changes': {'mood': 8, 'money': -5000, 'karma': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '第一次出国旅游',
        'category': 'life',
        'min_age': 22,
        'max_age': 50,
        'base_weight': 0.8,
        'difficulty_level': 0.3,
        'description': '你决定出国旅游一趟，看看外面的世界。',
        'choices': [
            {'text': '跟团游', 'stat_changes': {'money': -15000, 'mood': 15, 'creativity': 3}, 'difficulty_mod': 0.5},
            {'text': '自由行', 'stat_changes': {'money': -20000, 'mood': 20, 'creativity': 8, 'intelligence': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '健身',
        'category': 'life',
        'min_age': 20,
        'max_age': 50,
        'base_weight': 1.0,
        'difficulty_level': 0.4,
        'description': '你决定开始健身，保持健康的身体。',
        'choices': [
            {'text': '办卡去健身房', 'stat_changes': {'physical_fitness': 10, 'charm': 5, 'health': 8, 'money': -5000, 'energy': -15}, 'difficulty_mod': 0.5},
            {'text': '在家锻炼', 'stat_changes': {'physical_fitness': 5, 'health': 3, 'energy': -8}, 'difficulty_mod': 0.5},
            {'text': '三分钟热度', 'stat_changes': {'money': -2000, 'mood': -3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '办健身卡',
        'category': 'life',
        'min_age': 20,
        'max_age': 50,
        'base_weight': 1.0,
        'difficulty_level': 0.4,
        'description': '你决定开始健身，塑造更好的自己。',
        'choices': [
            {'text': '坚持健身', 'stat_changes': {'physical_fitness': 10, 'health': 8, 'charm': 5, 'energy': -15, 'money': -5000}, 'difficulty_mod': 0.5},
            {'text': '在家锻炼', 'stat_changes': {'physical_fitness': 5, 'health': 3, 'energy': -8}, 'difficulty_mod': 0.5},
            {'text': '三分钟热度', 'stat_changes': {'money': -5000, 'mood': -3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '身体健康出问题',
        'category': 'health',
        'min_age': 25,
        'max_age': 50,
        'base_weight': 0.8,
        'difficulty_level': 0.5,
        'required_attrs': {'health__lt': 70},
        'description': '你的身体健康开始出问题了，需要去检查。',
        'choices': [
            {'text': '去体检', 'stat_changes': {'health': 3, 'money': -2000, 'mood': -3}, 'difficulty_mod': 0.5},
            {'text': '忍忍就过去了', 'stat_changes': {'health': -8, 'mood': -5}, 'difficulty_mod': 0.5}
        ]
    },
    
    # ==================== 个人成长事件 ====================
    {
        'title': '找到人生方向',
        'category': 'milestone',
        'min_age': 25,
        'max_age': 40,
        'base_weight': 1.0,
        'difficulty_level': 0.4,
        'description': '你终于找到了人生的方向，知道自己想做什么了！',
        'choices': [
            {'text': '朝着目标努力', 'stat_changes': {'intelligence': 10, 'emotional_stability': 10, 'mood': 20}, 'difficulty_mod': 0.5},
            {'text': '继续探索', 'stat_changes': {'intelligence': 5, 'mood': 10}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '人到中年',
        'category': 'milestone',
        'min_age': 35,
        'max_age': 50,
        'base_weight': 1.0,
        'difficulty_level': 0.5,
        'description': '你进入了中年，上有老下有小，压力很大。',
        'choices': [
            {'text': '承担责任', 'stat_changes': {'emotional_stability': 8, 'karma': 8, 'mood': 5, 'energy': -15}, 'difficulty_mod': 0.5},
            {'text': '觉得很累', 'stat_changes': {'mood': -8, 'emotional_stability': -2}, 'difficulty_mod': 0.5}
        ]
    },

    # ==================== 新增：更多教育/职业事件 ====================
    {
        'title': '留学深造',
        'category': 'education',
        'min_age': 20,
        'max_age': 30,
        'base_weight': 0.7,
        'difficulty_level': 0.6,
        'description': '你有机会去海外留学深造！',
        'choices': [
            {'text': '抓住机会', 'stat_changes': {'intelligence': 15, 'charm': 10, 'creativity': 8, 'money': -30000, 'energy': -20}, 'difficulty_mod': 0.5},
            {'text': '国内发展', 'stat_changes': {'intelligence': 5, 'karma': 3, 'mood': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '远程办公',
        'category': 'career',
        'min_age': 22,
        'max_age': 50,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '公司开始实行远程办公政策了。',
        'choices': [
            {'text': '在家办公', 'stat_changes': {'mood': 8, 'energy': 10, 'charm': -2}, 'difficulty_mod': 0.5},
            {'text': '去公司上班', 'stat_changes': {'social_capital': 5, 'charm': 3, 'energy': -8}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '成为部门主管',
        'category': 'career',
        'min_age': 28,
        'max_age': 45,
        'base_weight': 0.8,
        'difficulty_level': 0.5,
        'description': '你被提拔为部门主管了！',
        'choices': [
            {'text': '努力带领团队', 'stat_changes': {'reputation': 10, 'money': 80000, 'energy': -20, 'social_capital': 8}, 'difficulty_mod': 0.5},
            {'text': '保持原状态', 'stat_changes': {'money': 50000, 'mood': 8}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '公司上市',
        'category': 'career',
        'min_age': 25,
        'max_age': 50,
        'base_weight': 0.4,
        'difficulty_level': 0.4,
        'description': '你所在的公司成功上市了！',
        'choices': [
            {'text': '套现离场', 'stat_changes': {'money': 80000, 'mood': 20, 'luck': 10}, 'difficulty_mod': 0.5},
            {'text': '继续持有', 'stat_changes': {'money': 75000, 'mood': 15, 'karma': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '转行成功',
        'category': 'career',
        'min_age': 28,
        'max_age': 45,
        'base_weight': 0.7,
        'difficulty_level': 0.6,
        'description': '你成功转行到了新的行业！',
        'choices': [
            {'text': '从零开始学习', 'stat_changes': {'intelligence': 10, 'creativity': 5, 'energy': -20, 'mood': 5}, 'difficulty_mod': 0.5},
            {'text': '利用之前经验', 'stat_changes': {'intelligence': 5, 'social_capital': 5, 'mood': 10}, 'difficulty_mod': 0.5}
        ]
    },

    # ==================== 新增：更多家庭/关系事件 ====================
    {
        'title': '二胎出生',
        'category': 'family',
        'min_age': 28,
        'max_age': 45,
        'base_weight': 0.8,
        'difficulty_level': 0.6,
        'description': '你的第二个孩子出生了！',
        'choices': [
            {'text': '全力以赴照顾', 'stat_changes': {'mood': 20, 'karma': 10, 'money': -80000, 'energy': -30, 'health': -5}, 'difficulty_mod': 0.5},
            {'text': '请父母帮忙', 'stat_changes': {'mood': 15, 'money': -30000, 'karma': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '孩子高考',
        'category': 'family',
        'min_age': 38,
        'max_age': 50,
        'base_weight': 1.0,
        'difficulty_level': 0.5,
        'description': '你的孩子要高考了！',
        'choices': [
            {'text': '全力支持', 'stat_changes': {'mood': 10, 'karma': 5, 'money': -20000, 'energy': -20}, 'difficulty_mod': 0.5},
            {'text': '让孩子自己面对', 'stat_changes': {'mood': 5, 'intelligence': 3, 'karma': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '父母生病',
        'category': 'family',
        'min_age': 35,
        'max_age': 50,
        'base_weight': 1.0,
        'difficulty_level': 0.7,
        'description': '你的父母生病了，需要你照顾。',
        'choices': [
            {'text': '悉心照顾', 'stat_changes': {'karma': 15, 'health': -5, 'mood': -5, 'energy': -25, 'money': -50000}, 'difficulty_mod': 0.5},
            {'text': '请护工帮忙', 'stat_changes': {'money': -30000, 'mood': -3, 'karma': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '和父母一起住',
        'category': 'family',
        'min_age': 28,
        'max_age': 50,
        'base_weight': 0.8,
        'difficulty_level': 0.5,
        'description': '你决定和父母一起住，方便照顾他们。',
        'choices': [
            {'text': '其乐融融', 'stat_changes': {'karma': 10, 'mood': 10, 'charm': 5, 'money': -20000}, 'difficulty_mod': 0.5},
            {'text': '生活习惯有摩擦', 'stat_changes': {'mood': -5, 'emotional_stability': 3, 'karma': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '第二次婚姻',
        'category': 'relationship',
        'min_age': 30,
        'max_age': 50,
        'base_weight': 0.6,
        'difficulty_level': 0.5,
        'cooldown_category': 'family',
        'description': '你迎来了第二段婚姻。',
        'choices': [
            {'text': '珍惜眼前人', 'stat_changes': {'mood': 15, 'karma': 10, 'charm': 5, 'money': -100000}, 'difficulty_mod': 0.5},
            {'text': '有所保留', 'stat_changes': {'mood': 8, 'karma': 3, 'money': -50000}, 'difficulty_mod': 0.5}
        ]
    },

    # ==================== 新增：更多健康事件 ====================
    {
        'title': '高血压',
        'category': 'health',
        'min_age': 35,
        'max_age': 50,
        'base_weight': 0.8,
        'difficulty_level': 0.5,
        'description': '你查出了高血压，需要注意身体了。',
        'choices': [
            {'text': '积极治疗', 'stat_changes': {'health': 5, 'money': -10000, 'mood': -3}, 'difficulty_mod': 0.5},
            {'text': '控制饮食锻炼', 'stat_changes': {'health': 8, 'physical_fitness': 5, 'energy': -10}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '腰椎间盘突出',
        'category': 'health',
        'min_age': 30,
        'max_age': 50,
        'base_weight': 0.8,
        'difficulty_level': 0.5,
        'description': '你得了腰椎间盘突出，很痛。',
        'choices': [
            {'text': '手术治疗', 'stat_changes': {'health': 3, 'money': -50000, 'mood': -5, 'energy': -20}, 'difficulty_mod': 0.5},
            {'text': '保守治疗', 'stat_changes': {'health': -2, 'physical_fitness': -5, 'money': -10000}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '体检出结节',
        'category': 'health',
        'min_age': 30,
        'max_age': 50,
        'base_weight': 0.9,
        'difficulty_level': 0.4,
        'description': '体检出了结节，需要进一步检查。',
        'choices': [
            {'text': '定期复查', 'stat_changes': {'mood': -5, 'money': -5000, 'health': 2}, 'difficulty_mod': 0.5},
            {'text': '手术切除', 'stat_changes': {'health': -3, 'money': -30000, 'mood': -8}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '心理健康问题',
        'category': 'health',
        'min_age': 25,
        'max_age': 50,
        'base_weight': 0.8,
        'difficulty_level': 0.6,
        'description': '你感觉自己有些心理健康问题。',
        'choices': [
            {'text': '看心理医生', 'stat_changes': {'emotional_stability': 10, 'mood': 5, 'money': -20000}, 'difficulty_mod': 0.5},
            {'text': '自我调节', 'stat_changes': {'emotional_stability': 5, 'mood': 3}, 'difficulty_mod': 0.5}
        ]
    },

    # ==================== 新增：更多财富/生活事件 ====================
    {
        'title': '炒股大赚',
        'category': 'wealth',
        'min_age': 25,
        'max_age': 50,
        'base_weight': 0.4,
        'difficulty_level': 0.3,
        'description': '你买的股票涨了很多！',
        'choices': [
            {'text': '及时止盈', 'stat_changes': {'money': 30000, 'mood': 15, 'intelligence': 5}, 'difficulty_mod': 0.5},
            {'text': '继续持有', 'stat_changes': {'money': 100000, 'luck': 5, 'mood': 10}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '房价大涨',
        'category': 'wealth',
        'min_age': 28,
        'max_age': 50,
        'base_weight': 0.7,
        'difficulty_level': 0.3,
        'description': '你买的房子房价大涨了！',
        'choices': [
            {'text': '卖出套利', 'stat_changes': {'money': 80000, 'mood': 20, 'luck': 8}, 'difficulty_mod': 0.5},
            {'text': '继续持有', 'stat_changes': {'money': 75000, 'mood': 10}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '欠债还钱',
        'category': 'wealth',
        'min_age': 25,
        'max_age': 50,
        'base_weight': 0.8,
        'difficulty_level': 0.5,
        'description': '你欠了别人一笔钱，现在该还了。',
        'choices': [
            {'text': '按时还钱', 'stat_changes': {'money': -100000, 'karma': 8, 'reputation': 5, 'mood': 3}, 'difficulty_mod': 0.5},
            {'text': '拖欠', 'stat_changes': {'reputation': -8, 'karma': -5, 'mood': -5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '买彩票中奖',
        'category': 'wealth',
        'min_age': 20,
        'max_age': 60,
        'base_weight': 0.3,
        'difficulty_level': 0.2,
        'description': '你买彩票中了不小的奖！',
        'choices': [
            {'text': '好好规划使用', 'stat_changes': {'money': 30000, 'mood': 20, 'intelligence': 3}, 'difficulty_mod': 0.5},
            {'text': '挥霍庆祝', 'stat_changes': {'money': 100000, 'mood': 15, 'karma': -3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '学习新技能',
        'category': 'life',
        'min_age': 22,
        'max_age': 50,
        'base_weight': 1.0,
        'difficulty_level': 0.4,
        'description': '你决定学习一项新技能。',
        'choices': [
            {'text': '学编程', 'stat_changes': {'intelligence': 10, 'creativity': 5, 'money': -10000, 'energy': -15}, 'difficulty_mod': 0.5},
            {'text': '学摄影', 'stat_changes': {'creativity': 8, 'charm': 5, 'money': -15000, 'mood': 8}, 'difficulty_mod': 0.5},
            {'text': '学做饭', 'stat_changes': {'creativity': 5, 'health': 3, 'mood': 5, 'money': -3000}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '养宠物',
        'category': 'life',
        'min_age': 22,
        'max_age': 50,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '你决定养一只宠物陪伴自己。',
        'choices': [
            {'text': '养狗', 'stat_changes': {'mood': 10, 'charm': 5, 'physical_fitness': 3, 'money': -10000}, 'difficulty_mod': 0.5},
            {'text': '养猫', 'stat_changes': {'mood': 12, 'creativity': 3, 'money': -8000}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '学乐器',
        'category': 'life',
        'min_age': 22,
        'max_age': 50,
        'base_weight': 0.8,
        'difficulty_level': 0.4,
        'description': '你决定学一门乐器。',
        'choices': [
            {'text': '学钢琴', 'stat_changes': {'creativity': 10, 'charm': 8, 'money': -30000, 'energy': -15}, 'difficulty_mod': 0.5},
            {'text': '学吉他', 'stat_changes': {'creativity': 8, 'mood': 8, 'money': -5000}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '参加同学会',
        'category': 'social',
        'min_age': 28,
        'max_age': 50,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '你参加了同学聚会。',
        'choices': [
            {'text': '积极交流', 'stat_changes': {'social_capital': 10, 'charm': 5, 'mood': 10, 'money': -1000}, 'difficulty_mod': 0.5},
            {'text': '低调参加', 'stat_changes': {'social_capital': 3, 'mood': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '结交新朋友',
        'category': 'social',
        'min_age': 22,
        'max_age': 50,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '你通过各种方式结交了新朋友。',
        'choices': [
            {'text': '积极社交', 'stat_changes': {'social_capital': 10, 'charm': 5, 'mood': 8, 'energy': -10}, 'difficulty_mod': 0.5},
            {'text': '保持联系', 'stat_changes': {'social_capital': 5, 'mood': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '朋友借钱',
        'category': 'social',
        'min_age': 25,
        'max_age': 50,
        'base_weight': 0.9,
        'difficulty_level': 0.4,
        'description': '朋友找你借钱。',
        'choices': [
            {'text': '借钱', 'stat_changes': {'money': -50000, 'karma': 5, 'mood': 3}, 'difficulty_mod': 0.5},
            {'text': '婉拒', 'stat_changes': {'social_capital': -3, 'karma': -2, 'mood': -3}, 'difficulty_mod': 0.5}
        ]
    },

    # ==================== 新增：更多社会事件 ====================
    {
        'title': '疫情来袭',
        'category': 'life',
        'min_age': 18,
        'max_age': 100,
        'base_weight': 0.7,
        'difficulty_level': 0.5,
        'description': '疫情来了，生活受到很大影响。',
        'choices': [
            {'text': '居家隔离', 'stat_changes': {'health': 2, 'mood': -8, 'social_capital': -5, 'energy': 5}, 'difficulty_mod': 0.5},
            {'text': '正常工作', 'stat_changes': {'health': -5, 'mood': -3, 'karma': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '经济危机',
        'category': 'life',
        'min_age': 22,
        'max_age': 60,
        'base_weight': 0.7,
        'difficulty_level': 0.6,
        'description': '经济危机来了，大家都很困难。',
        'choices': [
            {'text': '节俭度日', 'stat_changes': {'intelligence': 5, 'mood': -3, 'money': 10000}, 'difficulty_mod': 0.5},
            {'text': '寻找机会', 'stat_changes': {'luck': 5, 'creativity': 5, 'energy': -15}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '自然灾害',
        'category': 'life',
        'min_age': 18,
        'max_age': 100,
        'base_weight': 0.5,
        'difficulty_level': 0.6,
        'description': '发生了自然灾害，大家都受到了影响。',
        'choices': [
            {'text': '捐款捐物', 'stat_changes': {'money': -50000, 'karma': 15, 'mood': 5, 'reputation': 10}, 'difficulty_mod': 0.5},
            {'text': '做好自己', 'stat_changes': {'karma': 3, 'mood': -3}, 'difficulty_mod': 0.5}
        ]
    },
    
    # ==================== 新增更多成年期事件 ====================
    {
        'title': '买彩票中奖',
        'category': 'wealth',
        'min_age': 20,
        'max_age': 100,
        'base_weight': 0.3,
        'difficulty_level': 0.2,
        'description': '你买彩票中奖了！',
        'choices': [
            {'text': '好好规划使用', 'stat_changes': {'money': 100000, 'mood': 25, 'intelligence': 3, 'karma': 3}, 'difficulty_mod': 0.5},
            {'text': '挥霍庆祝', 'stat_changes': {'money': 50000, 'mood': 15, 'karma': -3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '买基金赚钱',
        'category': 'wealth',
        'min_age': 25,
        'max_age': 100,
        'base_weight': 0.7,
        'difficulty_level': 0.3,
        'description': '你买的基金涨了，赚了不少！',
        'choices': [
            {'text': '及时止盈', 'stat_changes': {'money': 50000, 'intelligence': 5, 'mood': 10}, 'difficulty_mod': 0.5},
            {'text': '继续持有', 'stat_changes': {'money': 30000, 'luck': 5, 'mood': 8}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '成为公司高管',
        'category': 'career',
        'min_age': 35,
        'max_age': 60,
        'base_weight': 0.5,
        'difficulty_level': 0.5,
        'description': '你升职成为公司高管了！',
        'choices': [
            {'text': '努力工作做出成绩', 'stat_changes': {'money': 75000, 'reputation': 10, 'energy': -25, 'social_capital': 8}, 'difficulty_mod': 0.5},
            {'text': '稳步前进', 'stat_changes': {'money': 45000, 'mood': 10}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '被裁员',
        'category': 'career',
        'min_age': 30,
        'max_age': 60,
        'base_weight': 0.9,
        'difficulty_level': 0.6,
        'description': '公司裁员，你不幸被裁了！',
        'choices': [
            {'text': '拿赔偿金再找工作', 'stat_changes': {'money': 100000, 'mood': -5, 'intelligence': 3, 'luck': 3}, 'difficulty_mod': 0.5},
            {'text': '休息一段时间', 'stat_changes': {'money': -50000, 'mood': -10, 'energy': 10}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '孩子上大学',
        'category': 'family',
        'min_age': 40,
        'max_age': 55,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '你的孩子考上大学了！',
        'choices': [
            {'text': '开心地送孩子上大学', 'stat_changes': {'mood': 25, 'karma': 8, 'money': -100000}, 'difficulty_mod': 0.5},
            {'text': '有些不舍', 'stat_changes': {'mood': 10, 'emotional_stability': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '和伴侣旅行',
        'category': 'relationship',
        'min_age': 25,
        'max_age': 60,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '你和伴侣一起去旅行！',
        'choices': [
            {'text': '开心地玩', 'stat_changes': {'mood': 20, 'charm': 8, 'money': -50000, 'energy': -15}, 'difficulty_mod': 0.5},
            {'text': '温馨地玩', 'stat_changes': {'mood': 15, 'emotional_stability': 8, 'money': -20000}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '和朋友聚会',
        'category': 'social',
        'min_age': 25,
        'max_age': 70,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '你和老朋友们一起聚会！',
        'choices': [
            {'text': '积极参与', 'stat_changes': {'social_capital': 10, 'mood': 15, 'charm': 5, 'money': -1000}, 'difficulty_mod': 0.5},
            {'text': '简单聊聊', 'stat_changes': {'social_capital': 5, 'mood': 8}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '去健身房',
        'category': 'life',
        'min_age': 25,
        'max_age': 60,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '你开始去健身房锻炼！',
        'choices': [
            {'text': '坚持锻炼', 'stat_changes': {'physical_fitness': 10, 'health': 8, 'charm': 5, 'money': -10000, 'energy': -15}, 'difficulty_mod': 0.5},
            {'text': '偶尔去', 'stat_changes': {'physical_fitness': 3, 'health': 3, 'mood': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '体检发现健康问题',
        'category': 'health',
        'min_age': 30,
        'max_age': 60,
        'base_weight': 1.0,
        'difficulty_level': 0.5,
        'description': '你在体检中发现了健康问题！',
        'choices': [
            {'text': '积极治疗', 'stat_changes': {'health': 5, 'money': -30000, 'mood': -5}, 'difficulty_mod': 0.5},
            {'text': '不太在意', 'stat_changes': {'health': -10, 'mood': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '减肥成功',
        'category': 'health',
        'min_age': 25,
        'max_age': 60,
        'base_weight': 0.7,
        'difficulty_level': 0.4,
        'description': '你减肥成功了！',
        'choices': [
            {'text': '保持健康生活', 'stat_changes': {'health': 10, 'physical_fitness': 10, 'charm': 8, 'mood': 20}, 'difficulty_mod': 0.5},
            {'text': '松懈下来', 'stat_changes': {'health': 5, 'physical_fitness': 5, 'mood': 10}, 'difficulty_mod': 0.5}
        ]
    },

    # ==================== 事件链：失业复职 ====================
    {
        'title': '失业',
        'category': 'life',
        'min_age': 22,
        'max_age': 60,
        'base_weight': 1.0,
        'difficulty_level': 0.6,
        'description': '公司裁员，你不幸失去了工作！',
        'is_chain_event': True,
        'chain_id': 'unemployment_recovery',
        'step_id': 'unemployment_1',
        'choices': [
            {'text': '立即投简历，积极找工作', 'stat_changes': {'mood': -5, 'intelligence': 3, 'karma': 2}, 'difficulty_mod': 0.5},
            {'text': '先休息一段时间再做打算', 'stat_changes': {'mood': 5, 'energy': 10, 'money': -2000}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '找工作',
        'category': 'career',
        'min_age': 22,
        'max_age': 60,
        'base_weight': 1.0,
        'difficulty_level': 0.5,
        'description': '你投递了很多简历，终于收到面试通知了！',
        'is_chain_event': True,
        'chain_id': 'unemployment_recovery',
        'step_id': 'unemployment_2',
        'immediate': True,
        'choices': [
            {'text': '降低期望，抓住机会', 'stat_changes': {'karma': 3, 'mood': -2}, 'difficulty_mod': 0.5},
            {'text': '继续寻找更合适的机会', 'stat_changes': {'intelligence': 5, 'skill_level': 2, 'money': -3000}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '面试',
        'category': 'career',
        'min_age': 22,
        'max_age': 60,
        'base_weight': 1.0,
        'difficulty_level': 0.4,
        'description': '今天是重要的面试！好好表现！',
        'is_chain_event': True,
        'chain_id': 'unemployment_recovery',
        'step_id': 'unemployment_3',
        'immediate': True,
        'choices': [
            {'text': '充分准备，全力以赴', 'stat_changes': {'intelligence': 4, 'charm': 3, 'mood': 5}, 'difficulty_mod': 0.5},
            {'text': '保持轻松心态', 'stat_changes': {'charm': 5, 'mood': 8}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '入职',
        'category': 'milestone',
        'min_age': 22,
        'max_age': 60,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'is_chain_event': True,
        'chain_id': 'unemployment_recovery',
        'step_id': 'unemployment_4',
        'immediate': True,
        'description': '太棒了！面试通过，你被录用了！',
        'choices': [
            {'text': '努力工作，做出成绩', 'stat_changes': {'career_level': '初级', 'money': 10000, 'karma': 5, 'intelligence': 3, 'energy': -5}, 'difficulty_mod': 0.5}
        ]
    },

    # ==================== 事件链：恋爱结婚 ====================
    {
        'title': '偶遇',
        'category': 'relationship',
        'min_age': 18,
        'max_age': 40,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '你在咖啡馆/图书馆遇到了一个让你心动的人...',
        'is_chain_event': True,
        'chain_id': 'romance_marriage',
        'step_id': 'romance_1',
        'choices': [
            {'text': '主动打招呼', 'stat_changes': {'charm': 5, 'mood': 10}, 'difficulty_mod': 0.5},
            {'text': '偷偷观察', 'stat_changes': {'creativity': 3, 'mood': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '约会',
        'category': 'relationship',
        'min_age': 18,
        'max_age': 42,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '你们开始约会了！',
        'is_chain_event': True,
        'chain_id': 'romance_marriage',
        'step_id': 'romance_2',
        'immediate': True,
        'choices': [
            {'text': '浪漫约会', 'stat_changes': {'charm': 8, 'mood': 15, 'money': -2000}, 'difficulty_mod': 0.5},
            {'text': '简约相处', 'stat_changes': {'karma': 5, 'mood': 8}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '求婚',
        'category': 'milestone',
        'min_age': 20,
        'max_age': 45,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'is_chain_event': True,
        'chain_id': 'romance_marriage',
        'step_id': 'romance_3',
        'immediate': True,
        'description': '是时候考虑结婚了！',
        'choices': [
            {'text': '浪漫求婚', 'stat_changes': {'is_married': True, 'charm': 10, 'mood': 20, 'karma': 10, 'money': -50000}, 'difficulty_mod': 0.5},
            {'text': '继续恋爱', 'stat_changes': {'charm': 3, 'mood': 5}, 'difficulty_mod': 0.5}
        ]
    },

    # ==================== 事件链：疾病治疗 ====================
    {
        'title': '就医',
        'category': 'health',
        'min_age': 6,
        'max_age': 120,
        'base_weight': 1.0,
        'difficulty_level': 0.5,
        'description': '你决定去医院检查身体...',
        'is_chain_event': True,
        'chain_id': 'illness_recovery',
        'step_id': 'illness_1',
        'choices': [
            {'text': '积极治疗', 'stat_changes': {'health': 15, 'money': -3000, 'mood': -5}, 'difficulty_mod': 0.5},
            {'text': '先回家休养', 'stat_changes': {'mood': 3, 'energy': 10}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '康复中',
        'category': 'health',
        'min_age': 6,
        'max_age': 120,
        'base_weight': 1.0,
        'difficulty_level': 0.4,
        'description': '治疗正在进行中...',
        'is_chain_event': True,
        'chain_id': 'illness_recovery',
        'step_id': 'illness_2',
        'immediate': True,
        'choices': [
            {'text': '按时吃药', 'stat_changes': {'health': 20, 'money': -1500}, 'difficulty_mod': 0.5},
            {'text': '锻炼辅助', 'stat_changes': {'health': 15, 'energy': 10, 'physical_fitness': 1}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '康复',
        'category': 'milestone',
        'min_age': 6,
        'max_age': 120,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'is_chain_event': True,
        'chain_id': 'illness_recovery',
        'step_id': 'illness_3',
        'immediate': True,
        'description': '恭喜！你完全康复了！',
        'choices': [
            {'text': '庆祝一下', 'stat_changes': {'health': 30, 'mood': 15, 'karma': 5, 'money': -2000}, 'difficulty_mod': 0.5}
        ]
    }
]
