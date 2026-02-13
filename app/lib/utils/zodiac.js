// 星座配置数据
export const ZODIAC_SIGNS = [
  { id: 'aries', name: '白羊座', date: '3.21-4.19', icon: '♈', element: 'fire' },
  { id: 'taurus', name: '金牛座', date: '4.20-5.20', icon: '♉', element: 'earth' },
  { id: 'gemini', name: '双子座', date: '5.21-6.21', icon: '♊', element: 'air' },
  { id: 'cancer', name: '巨蟹座', date: '6.22-7.22', icon: '♋', element: 'water' },
  { id: 'leo', name: '狮子座', date: '7.23-8.22', icon: '♌', element: 'fire' },
  { id: 'virgo', name: '处女座', date: '8.23-9.22', icon: '♍', element: 'earth' },
  { id: 'libra', name: '天秤座', date: '9.23-10.23', icon: '♎', element: 'air' },
  { id: 'scorpio', name: '天蝎座', date: '10.24-11.22', icon: '♏', element: 'water' },
  { id: 'sagittarius', name: '射手座', date: '11.23-12.21', icon: '♐', element: 'fire' },
  { id: 'capricorn', name: '摩羯座', date: '12.22-1.19', icon: '♑', element: 'earth' },
  { id: 'aquarius', name: '水瓶座', date: '1.20-2.18', icon: '♒', element: 'air' },
  { id: 'pisces', name: '双鱼座', date: '2.19-3.20', icon: '♓', element: 'water' },
];

// 运势模板（当API不可用时使用）
const FORTUNE_TEMPLATES = {
  general: [
    '今日运势平稳，适合按部就班完成工作。保持耐心，好事多磨。',
    '今天心情愉悦，工作效率高，适合处理重要事务。',
    '可能会遇到一些小挑战，但你的应变能力会帮你度过难关。',
    '今日贵人运佳，遇到困难时记得向朋友寻求帮助。',
    '保持低调行事，今天的你更适合默默努力而非张扬。',
  ],
  love: [
    '单身者今日桃花运不错，多参加社交活动有望遇到心仪对象。',
    '有伴侣者感情稳定，适合安排浪漫约会增进感情。',
    '今天适合表达内心感受，坦诚沟通能让关系更进一步。',
    '感情运势平稳，享受当下的甜蜜时光吧。',
    '避免在感情中过于强势，多倾听对方的心声。',
  ],
  career: [
    '工作中可能遇到新的机会，保持开放心态去迎接挑战。',
    '今日适合与同事合作，团队协作会带来更好的成果。',
    '专注当前任务，不要被外界干扰影响工作效率。',
    '可能会收到领导的肯定，继续保持良好的工作状态。',
    '今天适合学习新技能，为未来职业发展做准备。',
  ],
  wealth: [
    '财运平稳，避免冲动消费，理性规划支出。',
    '今天可能会有意外之财，但不宜过度期待。',
    '投资需谨慎，多做调研再下决定。',
    '适合制定理财计划，为未来积累财富。',
    '避免借贷给他人，以免影响自己的资金周转。',
  ],
};

// 幸运颜色和数字
const LUCKY_COLORS = ['红色', '蓝色', '绿色', '黄色', '紫色', '粉色', '橙色', '白色'];
const LUCKY_NUMBERS = ['3', '7', '8', '9', '12', '16', '21', '28'];

// 获取星座信息
export const getZodiacInfo = (signId) => {
  return ZODIAC_SIGNS.find(z => z.id === signId) || ZODIAC_SIGNS[0];
};

// 根据日期自动判断星座
export const getZodiacByDate = (month, day) => {
  const date = month * 100 + day;
  if (date >= 321 && date <= 419) return 'aries';
  if (date >= 420 && date <= 520) return 'taurus';
  if (date >= 521 && date <= 621) return 'gemini';
  if (date >= 622 && date <= 722) return 'cancer';
  if (date >= 723 && date <= 822) return 'leo';
  if (date >= 823 && date <= 922) return 'virgo';
  if (date >= 923 && date <= 1023) return 'libra';
  if (date >= 1024 && date <= 1122) return 'scorpio';
  if (date >= 1123 && date <= 1221) return 'sagittarius';
  if (date >= 1222 || date <= 119) return 'capricorn';
  if (date >= 120 && date <= 218) return 'aquarius';
  if (date >= 219 && date <= 320) return 'pisces';
  return 'aries';
};

// 获取今日运势（备用方案）
export const getDailyFortune = (signId) => {
  const sign = getZodiacInfo(signId);
  const today = new Date();
  const seed = today.getDate() + today.getMonth() * 31 + signId.length;
  
  const randomIndex = (seed) => {
    const x = Math.sin(seed) * 10000;
    return Math.floor((x - Math.floor(x)) * 5);
  };

  return {
    sign: sign,
    general: FORTUNE_TEMPLATES.general[randomIndex(seed)],
    love: FORTUNE_TEMPLATES.love[randomIndex(seed + 1)],
    career: FORTUNE_TEMPLATES.career[randomIndex(seed + 2)],
    wealth: FORTUNE_TEMPLATES.wealth[randomIndex(seed + 3)],
    luckyColor: LUCKY_COLORS[randomIndex(seed + 4)],
    luckyNumber: LUCKY_NUMBERS[randomIndex(seed + 5)],
    rating: Math.floor(Math.random() * 3) + 3, // 3-5星
  };
};

// 尝试调用免费API获取真实数据
export const fetchHoroscopeFromAPI = async (signId) => {
  try {
    // 尝试使用 Aztro API (免费)
    const response = await fetch(`https://aztro.sameerkumar.website/?sign=${signId}&day=today`, {
      method: 'POST',
    });
    
    if (response.ok) {
      const data = await response.json();
      const sign = getZodiacInfo(signId);
      return {
        sign: sign,
        general: data.description,
        love: `感情运势${data.compatibility === sign.name ? '较佳' : '平稳'}，${data.mood}的心情有利于感情发展。`,
        career: `工作运势指数${data.mood}，${data.lucky_number}是你的幸运数字。`,
        wealth: `财运${data.color}色是今天的幸运色，把握机会。`,
        luckyColor: data.color,
        luckyNumber: data.lucky_number,
        rating: Math.min(5, Math.max(3, Math.round(parseInt(data.lucky_number) / 2))),
      };
    }
  } catch (e) {
    console.log('API调用失败，使用备用数据');
  }
  
  // 如果API失败，返回备用数据
  return getDailyFortune(signId);
};
