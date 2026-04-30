/**
 * 家族姓名系统
 * 生成随机的中文姓氏、名字和家族名
 */

const SURNAMES = [
  '赵', '钱', '孙', '李', '周', '吴', '郑', '王', '冯', '陈',
  '褚', '卫', '蒋', '沈', '韩', '杨', '朱', '秦', '尤', '许',
  '何', '吕', '施', '张', '孔', '曹', '严', '华', '金', '魏',
  '陶', '姜', '戚', '谢', '邹', '喻', '柏', '水', '窦', '章',
  '云', '苏', '潘', '葛', '奚', '范', '彭', '郎', '鲁', '韦',
  '昌', '马', '苗', '凤', '花', '方', '俞', '任', '袁', '柳',
  '酆', '鲍', '史', '唐', '费', '廉', '岑', '薛', '雷', '贺',
  '倪', '汤', '滕', '殷', '罗', '毕', '郝', '邬', '安', '常',
  '乐', '于', '时', '傅', '皮', '卞', '齐', '康', '伍', '余',
  '元', '卜', '顾', '孟', '平', '黄', '和', '穆', '萧', '尹',
];

const MALE_NAMES = [
  '伟', '强', '军', '杰', '勇', '磊', '明', '涛', '鹏', '超',
  '俊', '峰', '建', '华', '文', '斌', '刚', '辉', '宇', '浩',
  '凯', '龙', '波', '鑫', '飞', '志', '东', '海', '亮', '庆',
  '国', '栋', '林', '云', '晨', '阳', '翔', '瑞', '昊', '天',
  '思', '博', '哲', '睿', '轩', '航', '泽', '诚', '嘉', '逸',
];

const FEMALE_NAMES = [
  '芳', '娜', '秀', '敏', '静', '丽', '艳', '娟', '霞', '玲',
  '婷', '雪', '颖', '慧', '莹', '晶', '梅', '兰', '燕', '凤',
  '洁', '云', '薇', '倩', '欣', '怡', '佳', '琪', '璐', '瑶',
  '涵', '萱', '彤', '雯', '菲', '妍', '琳', '琦', '蕾', '茜',
  '梦', '馨', '宁', '诗', '韵', '茹', '晴', '媛', '瑾', '瑜',
];

const FAMILY_SUFFIXES = [
  '氏', '家', '族', '府', '堂', '阁', '轩', '居', '园', '庄',
];

const FAMILY_PREFIXES = [
  '东海', '南阳', '陇西', '琅琊', '陈留', '清河', '博陵', '荥阳',
  '太原', '京兆', '天水', '敦煌', '扶风', '河内', '颍川', '沛郡',
  '吴兴', ' FAMILY', '高阳', '中山', '信都', '江夏', '会稽', '长沙',
];

/** 生成随机姓氏 */
export function generateSurname(): string {
  return SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
}

/** 生成随机名字 */
export function generateGivenName(gender: 'male' | 'female' = 'male'): string {
  const names = gender === 'male' ? MALE_NAMES : FEMALE_NAMES;
  // 50%概率单字名，50%概率双字名
  if (Math.random() < 0.5) {
    return names[Math.floor(Math.random() * names.length)];
  }
  const name1 = names[Math.floor(Math.random() * names.length)];
  const name2 = names[Math.floor(Math.random() * names.length)];
  return name1 + name2;
}

/** 生成完整姓名 */
export function generateFullName(gender: 'male' | 'female' = 'male'): string {
  return generateSurname() + generateGivenName(gender);
}

/** 生成家族名 */
export function generateFamilyName(): string {
  const prefix = FAMILY_PREFIXES[Math.floor(Math.random() * FAMILY_PREFIXES.length)];
  const suffix = FAMILY_SUFFIXES[Math.floor(Math.random() * FAMILY_SUFFIXES.length)];
  return prefix + suffix;
}

/** 根据家族职业生成家族名 */
export function generateFamilyNameByOccupation(occupation: string | null): string {
  const surname = generateSurname();
  if (!occupation) {
    return surname + '家';
  }
  
  const occupationFamilyNames: Record<string, string[]> = {
    civil_servant: ['官宦世家', '书香门第', '仕宦之家'],
    police: ['忠义之家', '正义门第', '警世之家'],
    teacher_family: ['书香门第', '儒学世家', '教化之家'],
    doctor_family: ['杏林世家', '医道之家', '悬壶世家'],
    lawyer: ['法理之家', '辩才世家', '律政门第'],
    engineer: ['工匠世家', '技艺之家', '巧思门第'],
    programmer_family: ['数码世家', '代码之家', '极客门第'],
    scientist: ['科研世家', '探索之家', '求真门第'],
    business: ['商贾世家', '贸易之家', '经商门第'],
    finance: ['金融世家', '理财之家', '聚财门第'],
    entrepreneur: ['创业世家', '开拓之家', '商道门第'],
    artist: ['艺术世家', '文华之家', '艺道门第'],
    athlete: ['体育世家', '健儿之家', '运动门第'],
    writer: ['文学世家', '笔墨之家', '文思门第'],
    designer: ['设计世家', '创意之家', '美学门第'],
    farmer: ['农耕世家', '田园之家', '稼穑门第'],
    worker: ['工匠世家', '劳动之家', '实干门第'],
    craftsman: ['手艺世家', '精工之家', '巧艺门第'],
    scholar: ['儒学世家', '学问之家', '书香门第'],
    military: ['将门世家', '武德之家', '军武门第'],
    hermit: ['隐士世家', '清修之家', '隐逸门第'],
    adventurer: ['探险世家', '勇者之家', '开拓门第'],
  };
  
  const names = occupationFamilyNames[occupation];
  if (names && names.length > 0) {
    return surname + names[Math.floor(Math.random() * names.length)];
  }
  
  return surname + '家';
}

/** 生成子女名字（继承父姓） */
export function generateChildName(familySurname: string, gender: 'male' | 'female'): string {
  return familySurname + generateGivenName(gender);
}

/** 生成配偶名字 */
export function generateSpouseName(playerSurname: string, gender: 'male' | 'female'): string {
  // 配偶通常不同姓
  let spouseSurname = generateSurname();
  // 避免同姓（虽然现实中也有）
  while (spouseSurname === playerSurname && SURNAMES.length > 1) {
    spouseSurname = generateSurname();
  }
  return spouseSurname + generateGivenName(gender);
}
