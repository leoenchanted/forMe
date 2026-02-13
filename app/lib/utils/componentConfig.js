// 首页组件配置
export const COMPONENT_CATEGORIES = {
  life: {
    id: 'life',
    name: '生活',
    icon: 'sunny',
    description: '日常生活相关的实用信息',
  },
  study: {
    id: 'study',
    name: '学习',
    icon: 'book',
    description: '学习提升相关的每日内容',
  },
  utility: {
    id: 'utility',
    name: '工具',
    icon: 'construct',
    description: '实用工具和信息',
  },
};

// 所有可用组件配置
export const AVAILABLE_COMPONENTS = {
  // 生活类
  weather: {
    id: 'weather',
    name: '天气',
    category: 'life',
    icon: 'partly-sunny',
    description: '实时天气信息',
    defaultVisible: true,
    configurable: true,
    configFields: [
      { key: 'city', label: '城市', type: 'text', placeholder: '输入城市名称' },
    ],
  },
  sunriseSunset: {
    id: 'sunriseSunset',
    name: '日出日落',
    category: 'life',
    icon: 'sunny',
    description: '日出日落时间',
    defaultVisible: true,
    configurable: false,
  },
  horoscope: {
    id: 'horoscope',
    name: '星座运势',
    category: 'life',
    icon: 'star',
    description: '每日星座运势',
    defaultVisible: true,
    configurable: true,
    configFields: [
      { key: 'zodiacSign', label: '星座', type: 'select', options: [] }, // 动态加载
    ],
  },
  // 学习类
  dailyQuote: {
    id: 'dailyQuote',
    name: '每日一句',
    category: 'study',
    icon: 'chatbubble-ellipses',
    description: '每日英语好句',
    defaultVisible: true,
    configurable: false,
  },
};

// 获取组件配置key
export const getComponentConfigKey = (componentId) => `home_component_${componentId}_config`;
export const getComponentVisibilityKey = (componentId) => `home_component_${componentId}_visible`;
