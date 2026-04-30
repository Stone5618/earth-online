# -*- coding: utf-8 -*-
"""Moral dilemma events - key life choices with deep consequences.

These events present ethical dilemmas where the player must choose between
personal gain and moral principles. Each choice has long-lasting impacts
on karma, relationships, and future event possibilities.
"""

from ..utils import rng

MORAL_DILEMMAS = [
    {
        "id": 10001,
        "title": "同事的错误",
        "description": "你发现关系不错的同事在重要项目中犯了一个严重错误，但没人注意到。如果上报，他可能被辞退；如果隐瞒，公司可能蒙受损失。",
        "min_age": 22,
        "max_age": 65,
        "category": "moral_dilemma",
        "choices": [
            {
                "text": "立即上报管理层",
                "stat_changes": {"karma": 10, "mood": -5, "charm": -10},
                "follow_up": "公司避免了重大损失，同事被辞退了。你内心有些愧疚，但做了正确的事。",
                "consequences": {"flag": "reported_colleague", "karma_shift": "positive"},
            },
            {
                "text": "私下提醒同事改正",
                "stat_changes": {"karma": 5, "charm": 5, "mood": 3},
                "follow_up": "同事感激你的善意，及时修正了错误。你们的关系更亲密了。",
                "consequences": {"flag": "helped_colleague", "karma_shift": "neutral"},
            },
            {
                "text": "装作没看见",
                "stat_changes": {"karma": -15, "mood": -10, "trauma": 5},
                "follow_up": "问题最终暴露，公司蒙受了损失。你一直为此感到内疚。",
                "consequences": {"flag": "ignored_error", "karma_shift": "negative"},
            },
        ],
    },
    {
        "id": 10002,
        "title": "路边摔倒的老人",
        "description": "你走在街上，看到一位老人摔倒在地。周围人都在观望，没人上前帮忙。",
        "min_age": 18,
        "max_age": 80,
        "category": "moral_dilemma",
        "choices": [
            {
                "text": "立即上前扶起老人",
                "stat_changes": {"karma": 15, "mood": 5, "luck": 3},
                "follow_up": "老人感激不已，他的家人后来也对你表示感谢。善良的种子在世间传递。",
                "consequences": {"flag": "helped_elder", "karma_shift": "positive"},
            },
            {
                "text": "报警等待专业人员",
                "stat_changes": {"karma": 8, "mood": 2},
                "follow_up": "你拨打了急救电话，专业人员赶到处理。你做了力所能及的事。",
                "consequences": {"flag": "called_help", "karma_shift": "positive"},
            },
            {
                "text": "快速离开",
                "stat_changes": {"karma": -20, "mood": -15, "trauma": 10},
                "follow_up": "你假装没看见走开了，但这件事一直萦绕在你心头。",
                "consequences": {"flag": "ignored_elder", "karma_shift": "negative"},
            },
        ],
    },
    {
        "id": 10003,
        "title": "意外之财",
        "description": "你在路边捡到一个钱包，里面有大量现金和失主的名片。失主是一家慈善机构的负责人。",
        "min_age": 10,
        "max_age": 70,
        "category": "moral_dilemma",
        "choices": [
            {
                "text": "根据名片联系归还",
                "stat_changes": {"karma": 20, "luck": 5, "mood": 10},
                "follow_up": "失主感激不已，邀请你参观他们的慈善项目，你受到了深深的感动。",
                "consequences": {"flag": "returned_wallet", "karma_shift": "positive"},
            },
            {
                "text": "交给警察局",
                "stat_changes": {"karma": 12, "mood": 5},
                "follow_up": "警察妥善保管，最终找到了失主。你做了一件好事。",
                "consequences": {"flag": "police_wallet", "karma_shift": "positive"},
            },
            {
                "text": "收下现金",
                "stat_changes": {"karma": -25, "money": 50000, "mood": -5, "trauma": 5},
                "follow_up": "你用这笔钱改善了自己的生活，但内心始终有个声音在提醒你。",
                "consequences": {"flag": "kept_wallet", "karma_shift": "negative"},
            },
        ],
    },
    {
        "id": 10004,
        "title": "朋友的秘密",
        "description": "你最好的朋友向你坦白了他/她的一个秘密：他/她正在做一些违法的事情，但表示已经准备收手。",
        "min_age": 18,
        "max_age": 60,
        "category": "moral_dilemma",
        "choices": [
            {
                "text": "鼓励他/她自首",
                "stat_changes": {"karma": 15, "charm": 5, "mood": -5},
                "follow_up": "朋友经过挣扎后选择了自首，得到了从轻处理。他/她感激你的帮助。",
                "consequences": {"flag": "encouraged_confession", "karma_shift": "positive"},
            },
            {
                "text": "保密并督促收手",
                "stat_changes": {"karma": -5, "charm": 10, "mood": -10},
                "follow_up": "你替朋友保守了秘密，但每天都生活在担忧之中。",
                "consequences": {"flag": "kept_secret", "karma_shift": "neutral"},
            },
            {
                "text": "匿名举报",
                "stat_changes": {"karma": 5, "charm": -15, "mood": -8, "trauma": 5},
                "follow_up": "朋友最终被发现，他/她非常伤心和愤怒。你做对了事，但失去了友谊。",
                "consequences": {"flag": "reported_friend", "karma_shift": "neutral"},
            },
        ],
    },
    {
        "id": 10005,
        "title": "职场的诱惑",
        "description": "你的上司暗示你可以在一个项目上做手脚，从中获取巨额回扣。风险很小，收益巨大。",
        "min_age": 25,
        "max_age": 65,
        "category": "moral_dilemma",
        "choices": [
            {
                "text": "严词拒绝",
                "stat_changes": {"karma": 20, "mood": -5, "intelligence": 3},
                "follow_up": "你坚守了底线。后来发现那个项目出了问题，参与的人都被调查了。",
                "consequences": {"flag": "refused_corruption", "karma_shift": "positive"},
            },
            {
                "text": "收集证据并举报",
                "stat_changes": {"karma": 25, "charm": -10, "intelligence": 5, "mood": -10},
                "follow_up": "你将证据提交给相关部门，公司进行了一次大整顿。你被调到了更安全的岗位。",
                "consequences": {"flag": "reported_corruption", "karma_shift": "positive"},
            },
            {
                "text": "参与其中",
                "stat_changes": {"karma": -30, "money": 200000, "mood": -15, "trauma": 10},
                "follow_up": "你获得了巨额财富，但每天都活在恐惧中。这笔不义之财改变了你的命运。",
                "consequences": {"flag": "took_bribe", "karma_shift": "negative"},
            },
        ],
    },
    {
        "id": 10006,
        "title": "孩子的错误",
        "description": "你发现自己的孩子在学校欺负同学，还偷了别人的东西。作为父母，你需要做出选择。",
        "min_age": 30,
        "max_age": 60,
        "category": "moral_dilemma",
        "choices": [
            {
                "text": "严厉批评并带孩子道歉",
                "stat_changes": {"karma": 15, "charm": -5, "mood": -5},
                "follow_up": "孩子认识到了错误，主动道歉并改正。这是一次深刻的教育。",
                "consequences": {"flag": "disciplined_child", "karma_shift": "positive"},
            },
            {
                "text": "私下教育孩子但不声张",
                "stat_changes": {"karma": 5, "charm": 5, "mood": -3},
                "follow_up": "你教育了孩子，但没有让外人知道。孩子似乎认识到了错误。",
                "consequences": {"flag": "private_discipline", "karma_shift": "neutral"},
            },
            {
                "text": "帮孩子掩盖事实",
                "stat_changes": {"karma": -20, "charm": 5, "mood": -15, "trauma": 10},
                "follow_up": "你替孩子掩盖了真相，但这让他/她以为犯错没有代价。",
                "consequences": {"flag": "covered_up_child", "karma_shift": "negative"},
            },
        ],
    },
    {
        "id": 10007,
        "title": "遗产的归属",
        "description": "一位远房亲戚去世，留下了一笔可观的遗产。法律上你有权继承一部分，但你知道这笔钱对另一个困难家庭更有意义。",
        "min_age": 30,
        "max_age": 80,
        "category": "moral_dilemma",
        "choices": [
            {
                "text": "放弃继承权，让给更需要的人",
                "stat_changes": {"karma": 25, "mood": 10, "luck": 5},
                "follow_up": "那个家庭感激涕零，你的善举传遍了整个社区。",
                "consequences": {"flag": "renounced_inheritance", "karma_shift": "positive"},
            },
            {
                "text": "合理分配，各取所需",
                "stat_changes": {"karma": 15, "money": 50000, "mood": 5},
                "follow_up": "你与困难家庭协商，达成了一个双方都能接受的分配方案。",
                "consequences": {"flag": "shared_inheritance", "karma_shift": "positive"},
            },
            {
                "text": "依法全部继承",
                "stat_changes": {"karma": -15, "money": 200000, "mood": -10},
                "follow_up": "你拿到了全部遗产，但那个家庭的困境让你难以释怀。",
                "consequences": {"flag": "took_all_inheritance", "karma_shift": "negative"},
            },
        ],
    },
    {
        "id": 10008,
        "title": "环保与利益",
        "description": "你的公司计划在一片自然保护区附近建厂，能带来巨大经济效益，但会破坏生态环境。",
        "min_age": 25,
        "max_age": 65,
        "category": "moral_dilemma",
        "choices": [
            {
                "text": "坚决反对并提议替代方案",
                "stat_changes": {"karma": 20, "intelligence": 5, "mood": -5, "charm": 5},
                "follow_up": "你花费大量精力提出了替代方案，虽然过程艰辛，但最终保护了环境。",
                "consequences": {"flag": "opposed_pollution", "karma_shift": "positive"},
            },
            {
                "text": "支持但要求环保措施",
                "stat_changes": {"karma": 5, "charm": 10, "mood": 3},
                "follow_up": "项目进行了，增加了一些环保措施。虽然不是完美的解决方案，但有所改善。",
                "consequences": {"flag": "compromised_environment", "karma_shift": "neutral"},
            },
            {
                "text": "全力支持以获取升职",
                "stat_changes": {"karma": -25, "money": 100000, "charm": -5},
                "follow_up": "项目顺利推进，你获得了升职。但环境破坏的后果日益显现。",
                "consequences": {"flag": "supported_pollution", "karma_shift": "negative"},
            },
        ],
    },
]
