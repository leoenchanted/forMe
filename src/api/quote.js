/**
 * 每日一句 API 调用
 * 支持多个公共 API 服务
 */

/**
 * 获取每日一句（英文 + 中文）
 * 使用金山词霸每日一句 API
 * @returns {Promise<Object>} 包含英文和中文的每日一句
 */
export const fetchDailyQuote = async () => {
  try {
    // 使用金山词霸每日一句 API
    const response = await fetch('https://open.iciba.com/dsapi/');
    const data = await response.json();

    if (data && data.content) {
      return {
        en: data.content, // 英文句子
        zh: data.note, // 中文翻译
        source: data.source || 'Unknown', // 来源
        date: data.dateline || new Date().toDateString(),
        picture: data.picture2, // 配图 URL (可选)
      };
    }

    // 如果金山词霸 API 失败，使用备用方案
    return await fetchDailyQuoteBackup();
  } catch (error) {
    console.error('获取每日一句失败:', error);
    return await fetchDailyQuoteBackup();
  }
};

/**
 * 备用每日一句 API - 使用 Hitokoto 一言 API
 * @returns {Promise<Object>} 每日一句数据
 */
const fetchDailyQuoteBackup = async () => {
  try {
    // 使用 Hitokoto 一言 API (支持多种类型)
    // c=d 表示诗词类, c=i 表示网易云, c=a 表示动画
    const response = await fetch('https://v1.hitokoto.cn/?c=d&c=i&c=k&encode=json');
    const data = await response.json();

    if (data && data.hitokoto) {
      return {
        en: data.hitokoto, // 句子内容
        zh: data.from || '来自网络', // 来源
        source: data.from || 'Hitokoto',
        date: new Date().toDateString(),
      };
    }

    // 如果所有 API 都失败，返回默认句子
    return getDefaultQuote();
  } catch (error) {
    console.error('备用 API 也失败了:', error);
    return getDefaultQuote();
  }
};

/**
 * 获取默认的每日一句（当所有 API 失败时使用）
 * @returns {Object} 默认句子
 */
const getDefaultQuote = () => {
  const defaultQuotes = [
    {
      en: 'Believe in yourself and all that you are.',
      zh: '相信自己，相信你所拥有的一切。',
      source: 'Unknown',
    },
    {
      en: 'Stay hungry, stay foolish.',
      zh: '求知若饥，虚心若愚。',
      source: 'Steve Jobs',
    },
    {
      en: 'The best time to plant a tree was 20 years ago. The second best time is now.',
      zh: '种一棵树最好的时间是十年前，其次是现在。',
      source: 'Chinese Proverb',
    },
    {
      en: 'Make it happen.',
      zh: '让梦想成真。',
      source: 'Unknown',
    },
    {
      en: 'Dream big, work hard, stay focused.',
      zh: '心怀远大梦想，努力工作，保持专注。',
      source: 'Unknown',
    },
    {
      en: 'The journey of a thousand miles begins with one step.',
      zh: '千里之行，始于足下。',
      source: 'Lao Tzu',
    },
  ];

  // 随机返回一条
  const randomIndex = Math.floor(Math.random() * defaultQuotes.length);
  return {
    ...defaultQuotes[randomIndex],
    date: new Date().toDateString(),
  };
};

/**
 * 获取励志名言 (使用其他 API)
 * @returns {Promise<Object>} 励志名言
 */
export const fetchInspirationalQuote = async () => {
  try {
    // 使用 quotable.io API 获取励志名言
    const response = await fetch('https://api.quotable.io/random?tags=inspirational');
    const data = await response.json();

    if (data && data.content) {
      return {
        en: data.content,
        zh: data.content, // 此 API 只返回英文
        source: data.author || 'Unknown',
        date: new Date().toDateString(),
      };
    }

    return getDefaultQuote();
  } catch (error) {
    console.error('获取励志名言失败:', error);
    return getDefaultQuote();
  }
};
