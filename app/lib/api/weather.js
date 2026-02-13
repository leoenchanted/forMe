/**
 * 和风天气 API 调用
 * 文档: https://dev.qweather.com/docs/api/
 */
import Constants from 'expo-constants';

/**
 * 获取城市信息（用于搜索城市）
 * @param {string} location - 城市关键词
 * @param {string} apiKey - 和风天气 API Key (可选)
 * @returns {Promise<Array>} 城市列表
 */
export const searchCity = async (location, apiKey = null) => {
  // 如果没有提供API Key，从环境变量中获取
  if (!apiKey) {
    apiKey = Constants.expoConfig?.extra?.qweatherApiKey || '';
  }

  if (!apiKey) {
    console.warn('和风天气 API Key 未配置，无法搜索城市');
    return [];
  }

  try {
    const url = `https://geoapi.qweather.com/v2/city/lookup?location=${encodeURIComponent(location)}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== '200') {
      console.error('城市搜索失败:', data.code);
      return [];
    }

    return data.location || [];
  } catch (error) {
    console.error('城市搜索错误:', error);
    return [];
  }
};

/**
 * 获取实时天气
 * @param {string} location - 城市名称、经纬度或 Location ID (例如: "beijing", "116.41,39.92")
 * @param {string} apiKey - 和风天气 API Key (可选，如果不提供会从环境变量中读取)
 * @returns {Promise<Object>} 天气数据
 */
export const fetchRealtimeWeather = async (location, apiKey = null) => {
  // 如果没有提供API Key，从环境变量中获取
  if (!apiKey) {
    apiKey = Constants.expoConfig?.extra?.qweatherApiKey || '';
  }

  if (!apiKey) {
    console.warn('和风天气 API Key 未配置，返回模拟数据');
    // 返回模拟数据
    return {
      temp: '26',
      condition: 'Sunny',
      icon: 'partly-sunny',
      city: 'Your City',
      humidity: '65',
      windSpeed: '12',
    };
  }

  try {
    let locationId = location;
    
    // 检查是否是经纬度格式 (例如: "116.41,39.92")
    const isCoordinates = /^\d+\.\d+,\d+\.\d+$/.test(location);
    
    // 检查是否是LocationID格式 (纯数字)
    const isLocationId = /^\d+$/.test(location);
    
    // 如果是城市名称，先获取LocationID
    if (!isCoordinates && !isLocationId) {
      const cities = await searchCity(location, apiKey);
      if (cities.length > 0) {
        locationId = cities[0].id;
        location = cities[0].name;
      } else {
        console.warn('未找到城市:', location);
        return null;
      }
    }

    // 和风天气实时天气接口
    const url = `https://devapi.qweather.com/v7/weather/now?location=${encodeURIComponent(locationId)}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    // 检查响应状态
    if (data.code !== '200') {
      console.error('和风天气 API 错误:', data.code, data);
      return null;
    }

    // 解析天气数据
    const now = data.now;
    return {
      temp: now.temp, // 温度
      condition: now.text, // 天气状况文字
      icon: mapWeatherIcon(now.icon), // 映射图标
      city: location, // 城市名称
      humidity: now.humidity, // 湿度
      windSpeed: now.windSpeed, // 风速
      windDir: now.windDir, // 风向
      pressure: now.pressure, // 气压
      vis: now.vis, // 能见度
    };
  } catch (error) {
    console.error('获取天气数据失败:', error);
    return null;
  }
};

/**
 * 将和风天气图标代码映射为 Ionicons 图标名称
 * @param {string} iconCode - 和风天气图标代码
 * @returns {string} Ionicons 图标名称
 */
const mapWeatherIcon = (iconCode) => {
  const iconMap = {
    '100': 'sunny', // 晴
    '101': 'partly-sunny', // 多云
    '102': 'cloudy', // 少云
    '103': 'cloudy', // 晴间多云
    '104': 'cloudy', // 阴
    '150': 'moon', // 晴(夜间)
    '151': 'cloudy-night', // 多云(夜间)
    '152': 'cloudy-night', // 少云(夜间)
    '153': 'cloudy-night', // 晴间多云(夜间)
    '300': 'rainy', // 阵雨
    '301': 'thunderstorm', // 强阵雨
    '302': 'thunderstorm', // 雷阵雨
    '303': 'thunderstorm', // 强雷阵雨
    '304': 'thunderstorm', // 雷阵雨伴有冰雹
    '305': 'rainy', // 小雨
    '306': 'rainy', // 中雨
    '307': 'rainy', // 大雨
    '308': 'rainy', // 极端降雨
    '309': 'rainy', // 毛毛雨/细雨
    '310': 'rainy', // 暴雨
    '311': 'rainy', // 大暴雨
    '312': 'rainy', // 特大暴雨
    '313': 'rainy', // 冻雨
    '314': 'rainy', // 小到中雨
    '315': 'rainy', // 中到大雨
    '316': 'rainy', // 大到暴雨
    '317': 'rainy', // 暴雨到大暴雨
    '318': 'rainy', // 大暴雨到特大暴雨
    '399': 'rainy', // 雨
    '400': 'snow', // 小雪
    '401': 'snow', // 中雪
    '402': 'snow', // 大雪
    '403': 'snow', // 暴雪
    '404': 'rainy', // 雨夹雪
    '405': 'rainy', // 雨雪天气
    '406': 'rainy', // 阵雨夹雪
    '407': 'snow', // 阵雪
    '408': 'snow', // 小到中雪
    '409': 'snow', // 中到大雪
    '410': 'snow', // 大到暴雪
    '499': 'snow', // 雪
    '500': 'cloudy', // 薄雾
    '501': 'cloudy', // 雾
    '502': 'cloudy', // 霾
    '503': 'cloudy', // 扬沙
    '504': 'cloudy', // 浮尘
    '507': 'cloudy', // 沙尘暴
    '508': 'cloudy', // 强沙尘暴
    '509': 'cloudy', // 浓雾
    '510': 'cloudy', // 强浓雾
    '511': 'cloudy', // 中度霾
    '512': 'cloudy', // 重度霾
    '513': 'cloudy', // 严重霾
    '514': 'cloudy', // 大雾
    '515': 'cloudy', // 特强浓雾
  };

  return iconMap[iconCode] || 'partly-sunny'; // 默认图标
};


