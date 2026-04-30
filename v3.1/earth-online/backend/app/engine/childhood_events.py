
# -*- coding: utf-8 -*-
"""扩展的0-12岁儿童事件库"""

CHILDHOOD_EVENTS = [
    # ==================== 0-5岁新增事件 ====================
    
    # 疫苗接种系列
    {
        'title': '乙肝疫苗第一针',
        'category': 'health',
        'min_age': 0,
        'max_age': 0,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '你刚出生，医生给你注射了乙肝疫苗第一针。',
        'choices': [
            {'text': '安静地接受', 'stat_changes': {'health': 2, 'karma': 1}, 'difficulty_mod': 0.5},
            {'text': '哇哇大哭', 'stat_changes': {'health': 1, 'mood': -2}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '脊髓灰质炎疫苗',
        'category': 'health',
        'min_age': 2,
        'max_age': 3,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '今天要去吃脊髓灰质炎糖丸疫苗，甜甜的，但有点害怕。',
        'choices': [
            {'text': '乖乖吃下', 'stat_changes': {'health': 3, 'mood': 2}, 'difficulty_mod': 0.5},
            {'text': '哭闹拒绝', 'stat_changes': {'health': 1, 'mood': -3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '百白破联合疫苗',
        'category': 'health',
        'min_age': 3,
        'max_age': 4,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '又要打针了，这次是百白破联合疫苗，三种疾病一起预防。',
        'choices': [
            {'text': '勇敢面对', 'stat_changes': {'health': 4, 'karma': 2, 'mood': -1}, 'difficulty_mod': 0.5},
            {'text': '躲在妈妈身后', 'stat_changes': {'health': 2, 'mood': -2}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '麻腮风疫苗',
        'category': 'health',
        'min_age': 1,
        'max_age': 2,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '需要接种麻腮风联合疫苗，预防麻疹、腮腺炎、风疹。',
        'choices': [
            {'text': '平静度过', 'stat_changes': {'health': 3, 'karma': 1}, 'difficulty_mod': 0.5},
            {'text': '大哭大闹', 'stat_changes': {'health': 2, 'mood': -4}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': 'A群流脑疫苗',
        'category': 'health',
        'min_age': 6,
        'max_age': 8,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '到了接种A群流脑疫苗的时间，这是预防流行性脑脊髓膜炎的重要疫苗。',
        'choices': [
            {'text': '勇敢地去打针', 'stat_changes': {'health': 4, 'karma': 2}, 'difficulty_mod': 0.5},
            {'text': '有点害怕但配合', 'stat_changes': {'health': 3, 'mood': -1}, 'difficulty_mod': 0.5}
        ]
    },
    
    # 常见小病
    {
        'title': '感冒鼻塞',
        'category': 'health',
        'min_age': 0,
        'max_age': 5,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '你感冒了，鼻子不通气，有点不舒服。',
        'choices': [
            {'text': '多喝水多休息', 'stat_changes': {'health': -2, 'mood': -1}, 'difficulty_mod': 0.5},
            {'text': '哭闹求抱', 'stat_changes': {'health': -3, 'mood': -3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '发烧了',
        'category': 'health',
        'min_age': 0,
        'max_age': 5,
        'base_weight': 1.0,
        'difficulty_level': 0.5,
        'description': '你突然发烧了，小脸红红的，体温有点高。',
        'choices': [
            {'text': '去医院看医生', 'stat_changes': {'health': -3, 'mood': -3, 'money': -1000}, 'difficulty_mod': 0.5},
            {'text': '在家物理降温', 'stat_changes': {'health': -5, 'mood': -4}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '肚子痛',
        'category': 'health',
        'min_age': 1,
        'max_age': 5,
        'base_weight': 1.0,
        'difficulty_level': 0.4,
        'description': '肚子突然痛起来，你捂着肚子哭。',
        'choices': [
            {'text': '告诉爸爸妈妈', 'stat_changes': {'health': 0, 'mood': 2, 'karma': 1}, 'difficulty_mod': 0.5},
            {'text': '忍着不说', 'stat_changes': {'health': -2, 'mood': -4}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '蚊虫叮咬',
        'category': 'health',
        'min_age': 0,
        'max_age': 5,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '被蚊子咬了好几个包，痒痒的。',
        'choices': [
            {'text': '不去抓包', 'stat_changes': {'health': 1, 'karma': 1, 'mood': -1}, 'difficulty_mod': 0.5},
            {'text': '拼命抓挠', 'stat_changes': {'health': -2, 'mood': -2}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '长湿疹',
        'category': 'health',
        'min_age': 0,
        'max_age': 3,
        'base_weight': 0.8,
        'difficulty_level': 0.3,
        'description': '你的小脸上长了一些湿疹，红红的，有点痒。',
        'choices': [
            {'text': '配合涂药膏', 'stat_changes': {'health': 2, 'mood': -1}, 'difficulty_mod': 0.5},
            {'text': '不配合治疗', 'stat_changes': {'health': -1, 'mood': -3}, 'difficulty_mod': 0.5}
        ]
    },
    
    # 家庭类事件
    {
        'title': '有了小弟弟/妹妹',
        'category': 'family',
        'min_age': 2,
        'max_age': 5,
        'base_weight': 0.7,
        'difficulty_level': 0.4,
        'description': '妈妈生了一个小弟弟或小妹妹，你当哥哥姐姐啦！',
        'choices': [
            {'text': '开心地当哥哥姐姐', 'stat_changes': {'karma': 5, 'mood': 10, 'charm': 3}, 'difficulty_mod': 0.5},
            {'text': '有点吃醋', 'stat_changes': {'mood': -2, 'karma': -1}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '和弟弟妹妹抢玩具',
        'category': 'family',
        'min_age': 2,
        'max_age': 5,
        'base_weight': 0.8,
        'difficulty_level': 0.3,
        'description': '你和弟弟妹妹都想玩同一个玩具，发生了争执。',
        'choices': [
            {'text': '分享玩具', 'stat_changes': {'karma': 5, 'charm': 3, 'mood': 5}, 'difficulty_mod': 0.5},
            {'text': '不肯分享', 'stat_changes': {'karma': -2, 'mood': -3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '家庭旅行',
        'category': 'family',
        'min_age': 2,
        'max_age': 5,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '爸爸妈妈带你出去旅行了，第一次离开家这么远。',
        'choices': [
            {'text': '兴奋地到处看', 'stat_changes': {'creativity': 5, 'intelligence': 3, 'mood': 15}, 'difficulty_mod': 0.5},
            {'text': '有点想家', 'stat_changes': {'mood': 5, 'intelligence': 1}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '春节团圆',
        'category': 'family',
        'min_age': 1,
        'max_age': 5,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '过年啦！全家人团聚在一起，热热闹闹的。',
        'choices': [
            {'text': '开心收红包', 'stat_changes': {'money': 2000, 'mood': 15, 'charm': 2}, 'difficulty_mod': 0.5},
            {'text': '有点怕陌生人', 'stat_changes': {'money': 2000, 'mood': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '和爷爷奶奶视频',
        'category': 'family',
        'min_age': 2,
        'max_age': 5,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '通过手机视频和远在老家的爷爷奶奶聊天。',
        'choices': [
            {'text': '对着镜头说话', 'stat_changes': {'charm': 3, 'mood': 8, 'karma': 2}, 'difficulty_mod': 0.5},
            {'text': '不好意思地躲起来', 'stat_changes': {'mood': 3, 'charm': -1}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '帮爸爸妈妈做家务',
        'category': 'family',
        'min_age': 3,
        'max_age': 5,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '你想帮爸爸妈妈做点家务，虽然可能越帮越忙。',
        'choices': [
            {'text': '认真帮忙', 'stat_changes': {'karma': 5, 'physical_fitness': 2, 'mood': 8}, 'difficulty_mod': 0.5},
            {'text': '玩着玩着就忘了', 'stat_changes': {'mood': 5, 'karma': 1}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '爸爸妈妈吵架',
        'category': 'family',
        'min_age': 2,
        'max_age': 5,
        'base_weight': 0.5,
        'difficulty_level': 0.5,
        'description': '听到爸爸妈妈吵架的声音，你有点害怕。',
        'choices': [
            {'text': '躲在一边', 'stat_changes': {'mood': -10, 'emotional_stability': -2}, 'difficulty_mod': 0.5},
            {'text': '想办法让他们和好', 'stat_changes': {'charm': 5, 'karma': 5, 'mood': -3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '和妈妈去超市',
        'category': 'family',
        'min_age': 2,
        'max_age': 5,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '跟着妈妈去超市买东西，超市好大好热闹。',
        'choices': [
            {'text': '自己挑喜欢的零食', 'stat_changes': {'mood': 10, 'health': -1}, 'difficulty_mod': 0.5},
            {'text': '乖乖跟着妈妈', 'stat_changes': {'karma': 3, 'mood': 5}, 'difficulty_mod': 0.5}
        ]
    },
    
    # 成长里程碑事件
    {
        'title': '学会说话',
        'category': 'milestone',
        'min_age': 1,
        'max_age': 2,
        'base_weight': 1.0,
        'difficulty_level': 0.1,
        'description': '你终于能清楚地说出完整的词语了，家人都很开心！',
        'choices': [
            {'text': '继续多练习', 'stat_changes': {'intelligence': 5, 'charm': 3, 'mood': 10}, 'difficulty_mod': 0.5},
            {'text': '有时候还是用手势', 'stat_changes': {'intelligence': 2, 'mood': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '自己穿衣服',
        'category': 'milestone',
        'min_age': 2,
        'max_age': 4,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '你开始尝试自己穿衣服，虽然总是穿反或者扣错扣子。',
        'choices': [
            {'text': '慢慢练习自己穿', 'stat_changes': {'intelligence': 4, 'physical_fitness': 3, 'mood': 8}, 'difficulty_mod': 0.5},
            {'text': '还是让大人帮忙', 'stat_changes': {'mood': 3, 'intelligence': 1}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '学会脱鞋脱袜子',
        'category': 'milestone',
        'min_age': 1,
        'max_age': 3,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '你学会自己脱鞋子和袜子了，虽然动作有点笨拙。',
        'choices': [
            {'text': '积极练习', 'stat_changes': {'physical_fitness': 3, 'intelligence': 2, 'mood': 8}, 'difficulty_mod': 0.5},
            {'text': '脱完就不管了', 'stat_changes': {'mood': 5, 'karma': -1}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '认识数字',
        'category': 'milestone',
        'min_age': 2,
        'max_age': 4,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '你开始认识1234这些数字了，真聪明！',
        'choices': [
            {'text': '认真学习', 'stat_changes': {'intelligence': 5, 'mood': 8}, 'difficulty_mod': 0.5},
            {'text': '数着玩', 'stat_changes': {'intelligence': 2, 'creativity': 2}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '认识颜色',
        'category': 'milestone',
        'min_age': 2,
        'max_age': 4,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '你认识了红色、蓝色、绿色这些颜色，太棒了！',
        'choices': [
            {'text': '找出身边的颜色', 'stat_changes': {'intelligence': 4, 'creativity': 3, 'mood': 8}, 'difficulty_mod': 0.5},
            {'text': '有点混淆颜色', 'stat_changes': {'intelligence': 1, 'mood': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '第一次独立睡觉',
        'category': 'milestone',
        'min_age': 2,
        'max_age': 5,
        'base_weight': 1.0,
        'difficulty_level': 0.4,
        'description': '今天你要尝试一个人睡觉了，感觉有点害怕又有点兴奋。',
        'choices': [
            {'text': '勇敢地自己睡', 'stat_changes': {'emotional_stability': 5, 'karma': 3, 'mood': 5}, 'difficulty_mod': 0.5},
            {'text': '半夜去找爸妈', 'stat_changes': {'mood': 2, 'emotional_stability': -1}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '学会自己洗手',
        'category': 'milestone',
        'min_age': 2,
        'max_age': 4,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '你学会自己洗手了，饭前便后都要记得洗手哦！',
        'choices': [
            {'text': '认真洗手', 'stat_changes': {'health': 3, 'karma': 2, 'mood': 5}, 'difficulty_mod': 0.5},
            {'text': '随便冲一下', 'stat_changes': {'health': 1, 'karma': -1}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '学会刷牙',
        'category': 'milestone',
        'min_age': 2,
        'max_age': 5,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '开始学习自己刷牙，让牙齿变得白白的！',
        'choices': [
            {'text': '认真刷干净', 'stat_changes': {'health': 4, 'karma': 2, 'mood': 5}, 'difficulty_mod': 0.5},
            {'text': '玩着刷', 'stat_changes': {'health': 1, 'mood': 8}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '学会用筷子',
        'category': 'milestone',
        'min_age': 3,
        'max_age': 5,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '你开始学习用筷子吃饭，虽然总是夹不住菜。',
        'choices': [
            {'text': '耐心练习', 'stat_changes': {'physical_fitness': 4, 'intelligence': 3, 'mood': 8}, 'difficulty_mod': 0.5},
            {'text': '还是用勺子', 'stat_changes': {'mood': 5, 'physical_fitness': 1}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '说出自己的名字',
        'category': 'milestone',
        'min_age': 2,
        'max_age': 3,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '别人问你叫什么名字，你能清楚地回答了！',
        'choices': [
            {'text': '大方地介绍自己', 'stat_changes': {'charm': 5, 'mood': 10, 'intelligence': 2}, 'difficulty_mod': 0.5},
            {'text': '有点害羞', 'stat_changes': {'charm': 1, 'mood': 5}, 'difficulty_mod': 0.5}
        ]
    },
    
    # 生活体验事件
    {
        'title': '第一次去动物园',
        'category': 'life',
        'min_age': 2,
        'max_age': 5,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '爸爸妈妈带你去动物园，看到好多动物！',
        'choices': [
            {'text': '兴奋地看各种动物', 'stat_changes': {'creativity': 8, 'intelligence': 5, 'mood': 15}, 'difficulty_mod': 0.5},
            {'text': '有点害怕大型动物', 'stat_changes': {'mood': 5, 'intelligence': 2}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '第一次去水族馆',
        'category': 'life',
        'min_age': 2,
        'max_age': 5,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '走进水族馆，好多好多漂亮的鱼在水里游来游去！',
        'choices': [
            {'text': '看呆了', 'stat_changes': {'creativity': 10, 'intelligence': 5, 'mood': 15}, 'difficulty_mod': 0.5},
            {'text': '想伸手去抓', 'stat_changes': {'mood': 10, 'karma': -1}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '学游泳',
        'category': 'life',
        'min_age': 3,
        'max_age': 5,
        'base_weight': 1.0,
        'difficulty_level': 0.4,
        'description': '你开始学游泳了，带着游泳圈在水里扑腾。',
        'choices': [
            {'text': '勇敢地玩水', 'stat_changes': {'physical_fitness': 8, 'mood': 15}, 'difficulty_mod': 0.5},
            {'text': '有点怕水', 'stat_changes': {'physical_fitness': 2, 'mood': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '参加亲子活动',
        'category': 'life',
        'min_age': 2,
        'max_age': 5,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '幼儿园组织亲子活动，有好多好玩的游戏。',
        'choices': [
            {'text': '积极参与', 'stat_changes': {'charm': 5, 'mood': 15, 'social_capital': 3}, 'difficulty_mod': 0.5},
            {'text': '躲在爸妈身后', 'stat_changes': {'mood': 3, 'charm': -1}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '第一次吃冰淇淋',
        'category': 'life',
        'min_age': 1,
        'max_age': 5,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '夏天到了，你第一次吃冰淇淋，又甜又凉！',
        'choices': [
            {'text': '开心地吃', 'stat_changes': {'mood': 15, 'health': -1}, 'difficulty_mod': 0.5},
            {'text': '凉得有点受不了', 'stat_changes': {'mood': 5, 'health': -2}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '吹泡泡',
        'category': 'life',
        'min_age': 1,
        'max_age': 5,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '吹泡泡玩，看着彩色的泡泡飘向天空，真好玩！',
        'choices': [
            {'text': '追着泡泡跑', 'stat_changes': {'physical_fitness': 3, 'mood': 10, 'creativity': 2}, 'difficulty_mod': 0.5},
            {'text': '安静地看泡泡', 'stat_changes': {'mood': 8, 'creativity': 4}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '玩沙子',
        'category': 'life',
        'min_age': 1,
        'max_age': 5,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '在沙坑里玩沙子，用小铲子和小桶堆沙堡。',
        'choices': [
            {'text': '开心地玩', 'stat_changes': {'creativity': 5, 'physical_fitness': 2, 'mood': 10}, 'difficulty_mod': 0.5},
            {'text': '弄得一身都是沙', 'stat_changes': {'mood': 8, 'karma': -1}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '看儿童绘本',
        'category': 'life',
        'min_age': 1,
        'max_age': 5,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '看绘本图书，里面有好多好看的图画。',
        'choices': [
            {'text': '认真看图画', 'stat_changes': {'intelligence': 4, 'creativity': 5, 'mood': 8}, 'difficulty_mod': 0.5},
            {'text': '听妈妈讲故事', 'stat_changes': {'intelligence': 3, 'mood': 10}, 'difficulty_mod': 0.5}
        ]
    },
    
    # ==================== 6-12岁新增事件 ====================
    
    # 教育类事件
    {
        'title': '数学考了100分',
        'category': 'education',
        'min_age': 6,
        'max_age': 12,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'required_attrs': {'intelligence__gte': 40},
        'description': '这次数学考试你考了满分，太厉害了！',
        'choices': [
            {'text': '开心地告诉爸妈', 'stat_changes': {'intelligence': 5, 'mood': 15, 'karma': 3}, 'difficulty_mod': 0.5},
            {'text': '谦虚地说只是运气好', 'stat_changes': {'intelligence': 3, 'charm': 5, 'karma': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '语文作文获奖',
        'category': 'education',
        'min_age': 8,
        'max_age': 12,
        'base_weight': 0.8,
        'difficulty_level': 0.4,
        'description': '你的作文写得很好，在学校作文比赛中获奖了！',
        'choices': [
            {'text': '上台领奖', 'stat_changes': {'charm': 8, 'creativity': 10, 'mood': 15}, 'difficulty_mod': 0.5},
            {'text': '有点不好意思', 'stat_changes': {'creativity': 5, 'mood': 8, 'charm': 2}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '英语课朗读',
        'category': 'education',
        'min_age': 7,
        'max_age': 12,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '英语课上老师叫你起来朗读课文，有点紧张。',
        'choices': [
            {'text': '大声地朗读', 'stat_changes': {'intelligence': 4, 'charm': 3, 'mood': 8}, 'difficulty_mod': 0.5},
            {'text': '小声地读', 'stat_changes': {'intelligence': 2, 'mood': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '参加数学竞赛',
        'category': 'education',
        'min_age': 8,
        'max_age': 12,
        'base_weight': 0.7,
        'difficulty_level': 0.5,
        'description': '学校组织数学竞赛，你报名参加了！',
        'choices': [
            {'text': '认真准备', 'stat_changes': {'intelligence': 10, 'energy': -10, 'mood': 5}, 'difficulty_mod': 0.5},
            {'text': '随便考考', 'stat_changes': {'intelligence': 2, 'mood': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '忘做作业',
        'category': 'education',
        'min_age': 6,
        'max_age': 12,
        'base_weight': 0.8,
        'difficulty_level': 0.4,
        'description': '糟糕！昨天玩太开心，忘记做作业了！',
        'choices': [
            {'text': '早去学校补', 'stat_changes': {'karma': -1, 'energy': -5, 'mood': -5}, 'difficulty_mod': 0.5},
            {'text': '告诉老师没写', 'stat_changes': {'karma': 3, 'mood': -8}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '上课睡觉被老师点名',
        'category': 'education',
        'min_age': 8,
        'max_age': 12,
        'base_weight': 0.7,
        'difficulty_level': 0.4,
        'description': '上课太困睡着了，被老师点名起来回答问题。',
        'choices': [
            {'text': '羞愧道歉', 'stat_changes': {'karma': 3, 'mood': -8}, 'difficulty_mod': 0.5},
            {'text': '装傻不知道', 'stat_changes': {'karma': -3, 'mood': -3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '当选数学课代表',
        'category': 'education',
        'min_age': 7,
        'max_age': 12,
        'base_weight': 0.7,
        'difficulty_level': 0.3,
        'required_attrs': {'intelligence__gte': 45},
        'description': '你被选为数学课代表了！老师说你数学学得好。',
        'choices': [
            {'text': '认真履行职责', 'stat_changes': {'intelligence': 5, 'karma': 5, 'charm': 3, 'social_capital': 5}, 'difficulty_mod': 0.5},
            {'text': '觉得很有压力', 'stat_changes': {'intelligence': 3, 'mood': -2}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '体育课上跑步',
        'category': 'education',
        'min_age': 6,
        'max_age': 12,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '体育课要跑1000米，好累啊！',
        'choices': [
            {'text': '努力跑完全程', 'stat_changes': {'physical_fitness': 5, 'health': 2, 'energy': -15, 'karma': 3}, 'difficulty_mod': 0.5},
            {'text': '跑不动走完全程', 'stat_changes': {'physical_fitness': 1, 'energy': -8, 'mood': -3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '学做广播体操',
        'category': 'education',
        'min_age': 6,
        'max_age': 8,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '开始学做广播体操，动作有点不协调。',
        'choices': [
            {'text': '认真学', 'stat_changes': {'physical_fitness': 3, 'mood': 5}, 'difficulty_mod': 0.5},
            {'text': '随便做做', 'stat_changes': {'physical_fitness': 1, 'mood': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '参加美术兴趣班',
        'category': 'education',
        'min_age': 6,
        'max_age': 12,
        'base_weight': 0.8,
        'difficulty_level': 0.3,
        'description': '你报名参加了美术兴趣班，学习画画。',
        'choices': [
            {'text': '认真地学画画', 'stat_changes': {'creativity': 10, 'mood': 10}, 'difficulty_mod': 0.5},
            {'text': '就是随便玩', 'stat_changes': {'creativity': 3, 'mood': 8}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '学弹钢琴',
        'category': 'education',
        'min_age': 6,
        'max_age': 12,
        'base_weight': 0.7,
        'difficulty_level': 0.4,
        'description': '开始学弹钢琴了，要每天练习，有点辛苦。',
        'choices': [
            {'text': '每天坚持练习', 'stat_changes': {'creativity': 8, 'intelligence': 5, 'energy': -10, 'money': -3000}, 'difficulty_mod': 0.5},
            {'text': '三天打鱼两天晒网', 'stat_changes': {'creativity': 2, 'mood': -3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '学跳舞',
        'category': 'education',
        'min_age': 6,
        'max_age': 12,
        'base_weight': 0.8,
        'difficulty_level': 0.3,
        'description': '去学舞蹈，有芭蕾舞、民族舞、街舞可以选。',
        'choices': [
            {'text': '认真学跳舞', 'stat_changes': {'physical_fitness': 8, 'charm': 5, 'creativity': 3, 'mood': 8}, 'difficulty_mod': 0.5},
            {'text': '学着玩', 'stat_changes': {'physical_fitness': 3, 'mood': 8}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '学围棋',
        'category': 'education',
        'min_age': 6,
        'max_age': 12,
        'base_weight': 0.7,
        'difficulty_level': 0.4,
        'description': '开始学习下围棋，这是一项很需要动脑筋的棋类游戏。',
        'choices': [
            {'text': '认真钻研棋艺', 'stat_changes': {'intelligence': 10, 'mood': 5}, 'difficulty_mod': 0.5},
            {'text': '学着玩', 'stat_changes': {'intelligence': 3, 'mood': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '参加学校运动会',
        'category': 'education',
        'min_age': 6,
        'max_age': 12,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '学校一年一度的运动会开始了！',
        'choices': [
            {'text': '报名参加比赛', 'stat_changes': {'physical_fitness': 8, 'charm': 3, 'mood': 12, 'energy': -15}, 'difficulty_mod': 0.5},
            {'text': '当啦啦队加油', 'stat_changes': {'charm': 5, 'mood': 8}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '在运动会上获奖',
        'category': 'education',
        'min_age': 7,
        'max_age': 12,
        'base_weight': 0.7,
        'difficulty_level': 0.2,
        'required_attrs': {'physical_fitness__gte': 45},
        'description': '太棒了！你在运动会上取得了好成绩，获得了奖状！',
        'choices': [
            {'text': '开心地上台领奖', 'stat_changes': {'physical_fitness': 3, 'charm': 8, 'mood': 20, 'social_capital': 5}, 'difficulty_mod': 0.5},
            {'text': '低调地接受', 'stat_changes': {'physical_fitness': 2, 'mood': 10, 'karma': 2}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '加入学校足球队',
        'category': 'education',
        'min_age': 7,
        'max_age': 12,
        'base_weight': 0.8,
        'difficulty_level': 0.4,
        'description': '通过选拔，你加入了学校足球队！',
        'choices': [
            {'text': '认真训练', 'stat_changes': {'physical_fitness': 10, 'charm': 5, 'social_capital': 8, 'energy': -20}, 'difficulty_mod': 0.5},
            {'text': '就是去玩玩', 'stat_changes': {'physical_fitness': 3, 'mood': 8, 'energy': -5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '当选班长',
        'category': 'education',
        'min_age': 8,
        'max_age': 12,
        'base_weight': 0.6,
        'difficulty_level': 0.4,
        'required_attrs': {'charm__gte': 50, 'karma__gte': 20},
        'description': '你在班级选举中当选为班长了！',
        'choices': [
            {'text': '认真履行班长职责', 'stat_changes': {'social_capital': 10, 'charm': 5, 'karma': 5, 'energy': -10}, 'difficulty_mod': 0.5},
            {'text': '觉得有压力', 'stat_changes': {'social_capital': 5, 'mood': -3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '期中考试压力大',
        'category': 'education',
        'min_age': 8,
        'max_age': 12,
        'base_weight': 1.0,
        'difficulty_level': 0.4,
        'description': '期中考试就要来了，感觉压力有点大。',
        'choices': [
            {'text': '制定复习计划', 'stat_changes': {'intelligence': 8, 'energy': -15, 'mood': -3}, 'difficulty_mod': 0.5},
            {'text': '还是想玩', 'stat_changes': {'intelligence': -2, 'mood': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '考试考砸了',
        'category': 'education',
        'min_age': 6,
        'max_age': 12,
        'base_weight': 0.8,
        'difficulty_level': 0.5,
        'description': '这次考试成绩很不理想，回家不知道怎么跟爸妈说。',
        'choices': [
            {'text': '诚实地告诉爸妈', 'stat_changes': {'karma': 5, 'mood': -10, 'intelligence': 3}, 'difficulty_mod': 0.5},
            {'text': '隐瞒成绩', 'stat_changes': {'karma': -5, 'mood': -5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '当值日生',
        'category': 'education',
        'min_age': 6,
        'max_age': 12,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '今天轮到你当值日生，要打扫教室卫生。',
        'choices': [
            {'text': '认真打扫', 'stat_changes': {'karma': 5, 'physical_fitness': 2, 'mood': 5}, 'difficulty_mod': 0.5},
            {'text': '随便打扫一下', 'stat_changes': {'karma': -1, 'mood': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '参加升旗仪式',
        'category': 'education',
        'min_age': 6,
        'max_age': 12,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '每周一的升旗仪式，看着国旗升起。',
        'choices': [
            {'text': '庄严肃立', 'stat_changes': {'karma': 3, 'mood': 3}, 'difficulty_mod': 0.5},
            {'text': '偷偷和同学说话', 'stat_changes': {'karma': -2, 'mood': 2}, 'difficulty_mod': 0.5}
        ]
    },
    
    # 社交类事件
    {
        'title': '转学到新学校',
        'category': 'social',
        'min_age': 6,
        'max_age': 12,
        'base_weight': 0.6,
        'difficulty_level': 0.5,
        'description': '你转学了，来到一个新的学校，认识新的老师和同学。',
        'choices': [
            {'text': '主动认识新同学', 'stat_changes': {'charm': 8, 'social_capital': 5, 'mood': 8}, 'difficulty_mod': 0.5},
            {'text': '有点害羞', 'stat_changes': {'mood': -3, 'charm': -1}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '和同学闹矛盾',
        'category': 'social',
        'min_age': 6,
        'max_age': 12,
        'base_weight': 1.0,
        'difficulty_level': 0.4,
        'description': '你和最好的朋友闹别扭了，谁也不理谁。',
        'choices': [
            {'text': '主动道歉', 'stat_changes': {'karma': 8, 'charm': 5, 'mood': 5}, 'difficulty_mod': 0.5},
            {'text': '等着对方先来', 'stat_changes': {'mood': -8, 'karma': -2}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '被同学排挤',
        'category': 'social',
        'min_age': 7,
        'max_age': 12,
        'base_weight': 0.6,
        'difficulty_level': 0.5,
        'description': '班级里几个同学组成了小团体，排挤你不和你玩。',
        'choices': [
            {'text': '主动融入', 'stat_changes': {'charm': 5, 'mood': 3, 'social_capital': 3}, 'difficulty_mod': 0.5},
            {'text': '一个人也挺好', 'stat_changes': {'intelligence': 3, 'creativity': 3, 'mood': -2}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '帮助新同学',
        'category': 'social',
        'min_age': 7,
        'max_age': 12,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '班里来了新同学，对这里不熟悉。',
        'choices': [
            {'text': '主动帮助他', 'stat_changes': {'karma': 8, 'charm': 5, 'social_capital': 8, 'mood': 10}, 'difficulty_mod': 0.5},
            {'text': '让别人去帮', 'stat_changes': {'karma': 1, 'mood': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '参加同学的生日会',
        'category': 'social',
        'min_age': 6,
        'max_age': 12,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '同学邀请你去他/她的生日会，玩得很开心！',
        'choices': [
            {'text': '开心地玩', 'stat_changes': {'social_capital': 5, 'mood': 15, 'charm': 3, 'money': -300}, 'difficulty_mod': 0.5},
            {'text': '有点害羞', 'stat_changes': {'mood': 8, 'social_capital': 2}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '过生日请客',
        'category': 'social',
        'min_age': 6,
        'max_age': 12,
        'base_weight': 0.8,
        'difficulty_level': 0.3,
        'description': '你过生日啦！邀请好朋友们来家里玩。',
        'choices': [
            {'text': '开心地招待大家', 'stat_changes': {'social_capital': 8, 'charm': 5, 'mood': 20, 'money': -1000}, 'difficulty_mod': 0.5},
            {'text': '有点不好意思', 'stat_changes': {'mood': 10, 'social_capital': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '和同学交换玩具',
        'category': 'social',
        'min_age': 6,
        'max_age': 10,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '和同学互相交换玩具玩，感受新玩具的乐趣。',
        'choices': [
            {'text': '愉快地交换', 'stat_changes': {'charm': 3, 'social_capital': 3, 'mood': 10, 'creativity': 3}, 'difficulty_mod': 0.5},
            {'text': '不想交换', 'stat_changes': {'mood': 5, 'karma': -1}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '邀请同学来家里玩',
        'category': 'social',
        'min_age': 6,
        'max_age': 12,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '邀请同学到家里来玩，一起玩游戏、看动画片。',
        'choices': [
            {'text': '热情招待', 'stat_changes': {'charm': 8, 'social_capital': 8, 'mood': 15}, 'difficulty_mod': 0.5},
            {'text': '有点不好意思', 'stat_changes': {'mood': 8, 'social_capital': 2}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '被同学起外号',
        'category': 'social',
        'min_age': 7,
        'max_age': 12,
        'base_weight': 0.7,
        'difficulty_level': 0.4,
        'description': '同学给你起了一个不好听的外号，有点生气。',
        'choices': [
            {'text': '告诉老师', 'stat_changes': {'karma': 3, 'mood': -3}, 'difficulty_mod': 0.5},
            {'text': '也给他起外号', 'stat_changes': {'karma': -3, 'mood': 2}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '捡到同学的东西',
        'category': 'social',
        'min_age': 6,
        'max_age': 12,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '你在校园里捡到了同学的文具盒，里面还有零花钱。',
        'choices': [
            {'text': '交给老师', 'stat_changes': {'karma': 10, 'charm': 3, 'mood': 8}, 'difficulty_mod': 0.5},
            {'text': '自己留下', 'stat_changes': {'karma': -8, 'money': 50, 'mood': -3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '和同学一起打游戏',
        'category': 'social',
        'min_age': 8,
        'max_age': 12,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '和同学们一起打游戏，组队作战真开心！',
        'choices': [
            {'text': '和同学愉快组队', 'stat_changes': {'social_capital': 8, 'mood': 15, 'intelligence': 2}, 'difficulty_mod': 0.5},
            {'text': '喜欢自己玩', 'stat_changes': {'mood': 8, 'creativity': 2}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '组建学习小组',
        'category': 'social',
        'min_age': 8,
        'max_age': 12,
        'base_weight': 0.8,
        'difficulty_level': 0.3,
        'description': '几个同学一起组成学习小组，互相帮助一起进步。',
        'choices': [
            {'text': '积极参与', 'stat_changes': {'intelligence': 5, 'social_capital': 8, 'karma': 3}, 'difficulty_mod': 0.5},
            {'text': '不是很感兴趣', 'stat_changes': {'intelligence': 1, 'mood': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '和同学一起做作业',
        'category': 'social',
        'min_age': 7,
        'max_age': 12,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '放学后和同学一起在教室里做作业。',
        'choices': [
            {'text': '互相帮助', 'stat_changes': {'intelligence': 5, 'social_capital': 5, 'karma': 3}, 'difficulty_mod': 0.5},
            {'text': '各自做各自的', 'stat_changes': {'intelligence': 3, 'mood': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '参加班级联欢会',
        'category': 'social',
        'min_age': 6,
        'max_age': 12,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '班级联欢会，同学们表演节目，玩游戏，好热闹！',
        'choices': [
            {'text': '上台表演节目', 'stat_changes': {'charm': 10, 'creativity': 5, 'mood': 15, 'social_capital': 5}, 'difficulty_mod': 0.5},
            {'text': '在下面看表演', 'stat_changes': {'mood': 10, 'creativity': 2}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '和同学一起去公园',
        'category': 'social',
        'min_age': 8,
        'max_age': 12,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '周末和同学们一起去公园玩，骑车、野餐。',
        'choices': [
            {'text': '开心地玩', 'stat_changes': {'social_capital': 8, 'physical_fitness': 5, 'mood': 15}, 'difficulty_mod': 0.5},
            {'text': '和大家没什么话说', 'stat_changes': {'mood': 3, 'physical_fitness': 3}, 'difficulty_mod': 0.5}
        ]
    },
    
    # 生活类事件
    {
        'title': '自己坐公交上学',
        'category': 'life',
        'min_age': 8,
        'max_age': 12,
        'base_weight': 1.0,
        'difficulty_level': 0.4,
        'description': '你长大了，开始自己坐公交车或地铁上学。',
        'choices': [
            {'text': '小心谨慎', 'stat_changes': {'intelligence': 5, 'karma': 3, 'mood': 5}, 'difficulty_mod': 0.5},
            {'text': '有点害怕', 'stat_changes': {'mood': -3, 'intelligence': 2}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '第一次自己买东西',
        'category': 'life',
        'min_age': 7,
        'max_age': 12,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '你拿着零花钱第一次自己去商店买东西。',
        'choices': [
            {'text': '清楚地说要买什么', 'stat_changes': {'charm': 5, 'intelligence': 3, 'mood': 10}, 'difficulty_mod': 0.5},
            {'text': '不好意思地小声说', 'stat_changes': {'charm': 1, 'mood': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '学会自己整理房间',
        'category': 'life',
        'min_age': 7,
        'max_age': 12,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '你开始学习自己整理房间，把玩具和书本都放整齐。',
        'choices': [
            {'text': '整理得干干净净', 'stat_changes': {'karma': 5, 'physical_fitness': 3, 'mood': 8}, 'difficulty_mod': 0.5},
            {'text': '随便整理一下', 'stat_changes': {'karma': 1, 'mood': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '学骑自行车',
        'category': 'life',
        'min_age': 7,
        'max_age': 11,
        'base_weight': 1.0,
        'difficulty_level': 0.4,
        'description': '你开始学骑自行车，虽然摔了好几次，但终于学会了！',
        'choices': [
            {'text': '不怕摔努力学', 'stat_changes': {'physical_fitness': 8, 'health': -2, 'mood': 15, 'emotional_stability': 5}, 'difficulty_mod': 0.5},
            {'text': '害怕不敢学', 'stat_changes': {'physical_fitness': 1, 'mood': -3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '参加夏令营',
        'category': 'life',
        'min_age': 7,
        'max_age': 12,
        'base_weight': 0.8,
        'difficulty_level': 0.4,
        'description': '暑假去参加夏令营，和小朋友们一起住一起玩！',
        'choices': [
            {'text': '积极参与活动', 'stat_changes': {'charm': 8, 'physical_fitness': 5, 'mood': 15, 'social_capital': 8, 'money': -3000}, 'difficulty_mod': 0.5},
            {'text': '想回家', 'stat_changes': {'mood': -3, 'emotional_stability': -1}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '参加家务劳动',
        'category': 'life',
        'min_age': 8,
        'max_age': 12,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '周末在家做些力所能及的家务，洗碗、扫地、擦桌子。',
        'choices': [
            {'text': '认真做家务', 'stat_changes': {'karma': 8, 'physical_fitness': 3, 'mood': 5}, 'difficulty_mod': 0.5},
            {'text': '敷衍了事', 'stat_changes': {'karma': -1, 'mood': 2}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '学做饭',
        'category': 'life',
        'min_age': 10,
        'max_age': 12,
        'base_weight': 0.7,
        'difficulty_level': 0.4,
        'description': '你开始学习做饭，从简单的煎蛋、煮面条开始。',
        'choices': [
            {'text': '认真学习', 'stat_changes': {'physical_fitness': 5, 'intelligence': 5, 'creativity': 3, 'mood': 10}, 'difficulty_mod': 0.5},
            {'text': '觉得做饭麻烦', 'stat_changes': {'mood': -3, 'intelligence': 1}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '第一次用手机',
        'category': 'life',
        'min_age': 8,
        'max_age': 12,
        'base_weight': 0.8,
        'difficulty_level': 0.3,
        'description': '你有了自己的第一部手机！',
        'choices': [
            {'text': '合理使用手机', 'stat_changes': {'intelligence': 3, 'mood': 10, 'karma': 2}, 'difficulty_mod': 0.5},
            {'text': '沉迷玩手机', 'stat_changes': {'mood': 15, 'intelligence': -3, 'health': -3, 'energy': -5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '第一次坐飞机',
        'category': 'life',
        'min_age': 6,
        'max_age': 12,
        'base_weight': 0.6,
        'difficulty_level': 0.3,
        'description': '你第一次坐飞机，飞向蓝天！',
        'choices': [
            {'text': '兴奋地看窗外', 'stat_changes': {'creativity': 10, 'intelligence': 5, 'mood': 20}, 'difficulty_mod': 0.5},
            {'text': '有点害怕', 'stat_changes': {'mood': 3, 'emotional_stability': -1}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '换牙',
        'category': 'life',
        'min_age': 6,
        'max_age': 12,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '你的乳牙开始松动了，要换牙了！',
        'choices': [
            {'text': '期待恒牙长出来', 'stat_changes': {'health': 2, 'mood': 5}, 'difficulty_mod': 0.5},
            {'text': '害怕掉牙', 'stat_changes': {'health': 1, 'mood': -3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '第一次戴眼镜',
        'category': 'life',
        'min_age': 8,
        'max_age': 12,
        'base_weight': 0.6,
        'difficulty_level': 0.4,
        'required_attrs': {'intelligence__gte': 50},
        'description': '你近视了，需要戴眼镜。',
        'choices': [
            {'text': '开心能看清了', 'stat_changes': {'health': 3, 'mood': 8}, 'difficulty_mod': 0.5},
            {'text': '觉得戴眼镜不好看', 'stat_changes': {'health': 3, 'mood': -5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '参加视力检查',
        'category': 'life',
        'min_age': 6,
        'max_age': 12,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '学校组织视力检查，看看你的视力好不好。',
        'choices': [
            {'text': '认真检查', 'stat_changes': {'health': 2, 'mood': 3}, 'difficulty_mod': 0.5},
            {'text': '有点紧张', 'stat_changes': {'health': 1, 'mood': -2}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '生长痛',
        'category': 'life',
        'min_age': 8,
        'max_age': 12,
        'base_weight': 0.7,
        'difficulty_level': 0.3,
        'description': '最近晚上腿经常痛，妈妈说是生长痛，你在长个子！',
        'choices': [
            {'text': '开心自己在长高', 'stat_changes': {'physical_fitness': 3, 'mood': 10, 'health': -1}, 'difficulty_mod': 0.5},
            {'text': '痛得睡不着', 'stat_changes': {'physical_fitness': 2, 'health': -2, 'mood': -5}, 'difficulty_mod': 0.5}
        ]
    },
    
    # 家庭类事件
    {
        'title': '和父母一起看电影',
        'category': 'family',
        'min_age': 6,
        'max_age': 12,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '和爸爸妈妈一起去电影院看电影，好开心！',
        'choices': [
            {'text': '认真看电影', 'stat_changes': {'creativity': 5, 'mood': 15}, 'difficulty_mod': 0.5},
            {'text': '吃爆米花玩', 'stat_changes': {'mood': 12, 'creativity': 2}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '和父母一起去公园',
        'category': 'family',
        'min_age': 6,
        'max_age': 12,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '周末和爸爸妈妈一起去公园玩，散步、划船、放风筝。',
        'choices': [
            {'text': '开心地玩', 'stat_changes': {'physical_fitness': 5, 'mood': 15, 'creativity': 3}, 'difficulty_mod': 0.5},
            {'text': '觉得无聊', 'stat_changes': {'mood': 3, 'intelligence': 1}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '陪父母去超市',
        'category': 'family',
        'min_age': 6,
        'max_age': 12,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '和父母一起去超市买东西，帮着推购物车、拿东西。',
        'choices': [
            {'text': '帮着挑东西', 'stat_changes': {'karma': 5, 'charm': 3, 'mood': 8}, 'difficulty_mod': 0.5},
            {'text': '只想着买零食', 'stat_changes': {'mood': 10, 'karma': -1, 'health': -1}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '给父母过生日',
        'category': 'family',
        'min_age': 8,
        'max_age': 12,
        'base_weight': 0.8,
        'difficulty_level': 0.3,
        'description': '爸爸/妈妈的生日到了，你想给他们一个惊喜。',
        'choices': [
            {'text': '亲手制作礼物', 'stat_changes': {'creativity': 10, 'karma': 10, 'mood': 15}, 'difficulty_mod': 0.5},
            {'text': '用零花钱买礼物', 'stat_changes': {'karma': 5, 'mood': 10, 'money': -300}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '和父母一起做家务',
        'category': 'family',
        'min_age': 7,
        'max_age': 12,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '周末全家人一起打扫卫生，大扫除！',
        'choices': [
            {'text': '认真帮忙', 'stat_changes': {'karma': 8, 'physical_fitness': 5, 'mood': 8}, 'difficulty_mod': 0.5},
            {'text': '偷懒不想动', 'stat_changes': {'karma': -3, 'mood': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '学习成绩有进步',
        'category': 'family',
        'min_age': 7,
        'max_age': 12,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'required_attrs': {'intelligence__gte': 35},
        'description': '你的学习成绩有了明显的进步，爸爸妈妈很开心！',
        'choices': [
            {'text': '继续保持', 'stat_changes': {'intelligence': 8, 'mood': 15, 'karma': 3}, 'difficulty_mod': 0.5},
            {'text': '骄傲自满', 'stat_changes': {'intelligence': 3, 'karma': -2}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '被父母表扬',
        'category': 'family',
        'min_age': 6,
        'max_age': 12,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '因为某件事做得好，父母表扬了你！',
        'choices': [
            {'text': '开心地接受表扬', 'stat_changes': {'mood': 15, 'karma': 5, 'charm': 3}, 'difficulty_mod': 0.5},
            {'text': '不好意思地接受', 'stat_changes': {'mood': 10, 'charm': 1}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '被父母批评',
        'category': 'family',
        'min_age': 6,
        'max_age': 12,
        'base_weight': 1.0,
        'difficulty_level': 0.4,
        'description': '因为做错了事情，父母批评了你。',
        'choices': [
            {'text': '虚心接受批评', 'stat_changes': {'karma': 8, 'emotional_stability': 5, 'mood': -5}, 'difficulty_mod': 0.5},
            {'text': '不服气顶嘴', 'stat_changes': {'karma': -5, 'mood': -10}, 'difficulty_mod': 0.5}
        ]
    },
    
    # ==================== 新增更多童年期事件 ====================
    {
        'title': '第一次自己睡觉',
        'category': 'milestone',
        'min_age': 4,
        'max_age': 8,
        'base_weight': 1.0,
        'difficulty_level': 0.4,
        'description': '你第一次自己一个人睡觉，有点害怕但是很勇敢！',
        'choices': [
            {'text': '勇敢地自己睡', 'stat_changes': {'emotional_stability': 8, 'mood': 5}, 'difficulty_mod': 0.5},
            {'text': '需要父母陪', 'stat_changes': {'mood': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '养宠物',
        'category': 'family',
        'min_age': 6,
        'max_age': 12,
        'base_weight': 0.8,
        'difficulty_level': 0.3,
        'description': '你家开始养宠物了！小狗、小猫、小兔子...',
        'choices': [
            {'text': '用心照顾', 'stat_changes': {'karma': 8, 'mood': 15, 'physical_fitness': 3}, 'difficulty_mod': 0.5},
            {'text': '和它玩', 'stat_changes': {'mood': 10, 'charm': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '第一次去电影院',
        'category': 'life',
        'min_age': 5,
        'max_age': 12,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '你第一次去电影院看电影，又新奇又开心！',
        'choices': [
            {'text': '开心地看电影', 'stat_changes': {'mood': 15, 'creativity': 3}, 'difficulty_mod': 0.5},
            {'text': '有些害怕', 'stat_changes': {'mood': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '第一次去海边',
        'category': 'life',
        'min_age': 4,
        'max_age': 12,
        'base_weight': 0.7,
        'difficulty_level': 0.2,
        'description': '你第一次去海边玩！看大海、玩沙子、游泳！',
        'choices': [
            {'text': '开心地玩', 'stat_changes': {'mood': 20, 'creativity': 5, 'physical_fitness': 3}, 'difficulty_mod': 0.5},
            {'text': '有点怕水', 'stat_changes': {'mood': 10}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '第一次爬山',
        'category': 'life',
        'min_age': 5,
        'max_age': 12,
        'base_weight': 0.7,
        'difficulty_level': 0.3,
        'description': '你第一次跟着家人去爬山！',
        'choices': [
            {'text': '努力爬到山顶', 'stat_changes': {'mood': 15, 'physical_fitness': 8, 'karma': 3}, 'difficulty_mod': 0.5},
            {'text': '爬到一半不想爬了', 'stat_changes': {'physical_fitness': 3, 'mood': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '第一次坐飞机',
        'category': 'life',
        'min_age': 5,
        'max_age': 12,
        'base_weight': 0.6,
        'difficulty_level': 0.2,
        'description': '你第一次坐飞机！飞上蓝天的感觉很棒！',
        'choices': [
            {'text': '兴奋又好奇', 'stat_changes': {'mood': 20, 'intelligence': 3, 'creativity': 3}, 'difficulty_mod': 0.5},
            {'text': '有点害怕', 'stat_changes': {'mood': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '第一次考100分',
        'category': 'education',
        'min_age': 7,
        'max_age': 12,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '你第一次考试考了100分！特别开心！',
        'choices': [
            {'text': '开心地告诉父母', 'stat_changes': {'mood': 20, 'intelligence': 5, 'reputation': 3}, 'difficulty_mod': 0.5},
            {'text': '继续努力', 'stat_changes': {'intelligence': 8, 'mood': 10}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '第一次当班干部',
        'category': 'education',
        'min_age': 8,
        'max_age': 12,
        'base_weight': 0.7,
        'difficulty_level': 0.3,
        'description': '你第一次当班干部了！当班长、学习委员或者小组长！',
        'choices': [
            {'text': '认真做好工作', 'stat_changes': {'reputation': 8, 'social_capital': 5, 'intelligence': 3, 'energy': -8}, 'difficulty_mod': 0.5},
            {'text': '随便做做', 'stat_changes': {'mood': 5}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '第一次参加运动会',
        'category': 'education',
        'min_age': 7,
        'max_age': 12,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '你第一次参加学校的运动会！',
        'choices': [
            {'text': '参加比赛', 'stat_changes': {'physical_fitness': 5, 'mood': 10, 'charm': 3, 'energy': -10}, 'difficulty_mod': 0.5},
            {'text': '当拉拉队', 'stat_changes': {'social_capital': 3, 'mood': 8}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '第一次参加演讲比赛',
        'category': 'education',
        'min_age': 8,
        'max_age': 12,
        'base_weight': 0.6,
        'difficulty_level': 0.4,
        'description': '你第一次参加演讲比赛！',
        'choices': [
            {'text': '认真准备', 'stat_changes': {'charm': 8, 'intelligence': 5, 'mood': 8, 'energy': -10}, 'difficulty_mod': 0.5},
            {'text': '有点紧张', 'stat_changes': {'charm': 3, 'mood': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '第一次去同学家玩',
        'category': 'social',
        'min_age': 7,
        'max_age': 12,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '你第一次去同学家玩！',
        'choices': [
            {'text': '开心地玩', 'stat_changes': {'social_capital': 8, 'charm': 5, 'mood': 15}, 'difficulty_mod': 0.5},
            {'text': '有点害羞', 'stat_changes': {'mood': 5, 'social_capital': 2}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '第一次请同学来家里玩',
        'category': 'social',
        'min_age': 7,
        'max_age': 12,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '你第一次请同学来家里玩！',
        'choices': [
            {'text': '热情招待', 'stat_changes': {'charm': 10, 'social_capital': 8, 'mood': 15, 'money': -200}, 'difficulty_mod': 0.5},
            {'text': '有点不好意思', 'stat_changes': {'mood': 8, 'social_capital': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '和最好的朋友吵架',
        'category': 'social',
        'min_age': 7,
        'max_age': 12,
        'base_weight': 0.9,
        'difficulty_level': 0.4,
        'description': '你和最好的朋友吵架了，心里很不舒服。',
        'choices': [
            {'text': '主动道歉', 'stat_changes': {'social_capital': 10, 'karma': 8, 'mood': 5, 'charm': 3}, 'difficulty_mod': 0.5},
            {'text': '等着对方来道歉', 'stat_changes': {'mood': -8, 'social_capital': -3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '收到生日礼物',
        'category': 'life',
        'min_age': 5,
        'max_age': 12,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '你生日了，收到了很多生日礼物！',
        'choices': [
            {'text': '特别开心', 'stat_changes': {'mood': 25, 'creativity': 3}, 'difficulty_mod': 0.5},
            {'text': '感谢大家', 'stat_changes': {'mood': 15, 'karma': 5, 'charm': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '第一次学骑自行车',
        'category': 'life',
        'min_age': 6,
        'max_age': 12,
        'base_weight': 1.0,
        'difficulty_level': 0.3,
        'description': '你第一次学骑自行车！',
        'choices': [
            {'text': '认真学习', 'stat_changes': {'physical_fitness': 8, 'intelligence': 3, 'mood': 10, 'energy': -10}, 'difficulty_mod': 0.5},
            {'text': '有点怕摔跤', 'stat_changes': {'mood': 3, 'physical_fitness': 2}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '第一次学游泳',
        'category': 'life',
        'min_age': 6,
        'max_age': 12,
        'base_weight': 0.8,
        'difficulty_level': 0.3,
        'description': '你第一次学游泳！',
        'choices': [
            {'text': '认真学习', 'stat_changes': {'physical_fitness': 10, 'health': 5, 'mood': 10, 'energy': -15}, 'difficulty_mod': 0.5},
            {'text': '有点怕水', 'stat_changes': {'mood': 3, 'physical_fitness': 3}, 'difficulty_mod': 0.5}
        ]
    },
    {
        'title': '过春节',
        'category': 'family',
        'min_age': 3,
        'max_age': 12,
        'base_weight': 1.0,
        'difficulty_level': 0.2,
        'description': '过春节了！穿新衣、放鞭炮、收红包！',
        'choices': [
            {'text': '开心地过年', 'stat_changes': {'mood': 25, 'creativity': 3, 'money': 2000}, 'difficulty_mod': 0.5},
            {'text': '帮家里忙活', 'stat_changes': {'karma': 10, 'mood': 15, 'energy': -8}, 'difficulty_mod': 0.5}
        ]
    }
]
