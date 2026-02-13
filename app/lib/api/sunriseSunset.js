// 日出日落API封装
// 使用免费的 sunrise-sunset.org API

const SUNRISE_SUNSET_API = 'https://api.sunrise-sunset.org/json';

/**
 * 获取日出日落时间
 * @param {number} lat - 纬度
 * @param {number} lng - 经度
 * @param {string} date - 日期 (YYYY-MM-DD)，默认今天
 * @returns {Promise<Object>} 日出日落数据
 */
export const fetchSunriseSunset = async (lat = 39.9042, lng = 116.4074, date = 'today') => {
  try {
    const url = `${SUNRISE_SUNSET_API}?lat=${lat}&lng=${lng}&date=${date}&formatted=0`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK') {
      const { results } = data;
      
      // 格式化时间
      const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString('zh-CN', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      };
      
      return {
        sunrise: formatTime(results.sunrise),
        sunset: formatTime(results.sunset),
        solarNoon: formatTime(results.solar_noon),
        dayLength: results.day_length,
        civilTwilightBegin: formatTime(results.civil_twilight_begin),
        civilTwilightEnd: formatTime(results.civil_twilight_end),
        goldenHour: formatTime(results.golden_hour),
        success: true,
      };
    }
    
    throw new Error('API返回错误');
  } catch (error) {
    console.error('获取日出日落时间失败:', error);
    
    // 返回默认数据（北京大致时间）
    return {
      sunrise: '06:30',
      sunset: '18:45',
      solarNoon: '12:08',
      dayLength: '12:15:00',
      civilTwilightBegin: '06:05',
      civilTwilightEnd: '19:10',
      goldenHour: '17:30',
      success: false,
      error: error.message,
    };
  }
};

/**
 * 获取当前位置的日出日落时间
 * 使用地理位置API（如果用户授权）
 */
export const fetchSunriseSunsetForCurrentLocation = async () => {
  try {
    // 先尝试获取当前位置
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      return await fetchSunriseSunset(latitude, longitude);
    }
  } catch (e) {
    console.log('无法获取位置，使用默认位置');
  }
  
  // 如果无法获取位置，使用默认位置（北京）
  return await fetchSunriseSunset();
};

/**
 * 计算当前是白天还是夜晚
 */
export const isDaytime = (sunrise, sunset) => {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const [sunriseHour, sunriseMin] = sunrise.split(':').map(Number);
  const [sunsetHour, sunsetMin] = sunset.split(':').map(Number);
  
  const sunriseMinutes = sunriseHour * 60 + sunriseMin;
  const sunsetMinutes = sunsetHour * 60 + sunsetMin;
  
  return currentTime >= sunriseMinutes && currentTime < sunsetMinutes;
};

/**
 * 计算距离日出/日落还有多少时间
 */
export const getTimeUntilNextEvent = (sunrise, sunset) => {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const [sunriseHour, sunriseMin] = sunrise.split(':').map(Number);
  const [sunsetHour, sunsetMin] = sunset.split(':').map(Number);
  
  const sunriseMinutes = sunriseHour * 60 + sunriseMin;
  const sunsetMinutes = sunsetHour * 60 + sunsetMin;
  
  if (currentTime < sunriseMinutes) {
    const diff = sunriseMinutes - currentTime;
    return { type: 'sunrise', minutes: diff, time: sunrise };
  } else if (currentTime < sunsetMinutes) {
    const diff = sunsetMinutes - currentTime;
    return { type: 'sunset', minutes: diff, time: sunset };
  } else {
    // 已经过了日落，计算到明天日出的时间
    const tomorrowSunrise = sunriseMinutes + 24 * 60;
    const diff = tomorrowSunrise - currentTime;
    return { type: 'sunrise', minutes: diff, time: sunrise };
  }
};
