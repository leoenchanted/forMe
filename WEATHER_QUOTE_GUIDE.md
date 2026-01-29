# 和风天气 & 每日一句 API 集成说明

## 🎉 已完成的功能

### ✅ 1. 实时天气显示（和风天气 API）
- 显示当前温度
- 显示天气状况（晴天、多云、雨天等）
- 显示湿度百分比
- 显示风速
- 动态天气图标（根据实际天气变化）

### ✅ 2. 每日一句（多个 API 源）
- 金山词霸每日一句（英文 + 中文翻译）
- Hitokoto 一言 API（备用）
- 显示句子来源
- 优雅的中英文双语显示

---

## 📋 使用步骤

### 第一步：获取和风天气 API Key

1. 访问和风天气开发者平台：https://dev.qweather.com/
2. 注册账号并登录
3. 创建应用，选择「免费订阅」
4. 获取你的 API Key（Web API 密钥）

### 第二步：配置 API Key

打开 `.env` 文件，将你的 API Key 填入：

```env
QWEATHER_API_KEY=你的和风天气API_KEY
```

⚠️ **重要提示**：
- 如果没有配置 API Key，应用会使用模拟数据，不会报错
- 配置后需要**重启 Expo 服务**才能生效

### 第三步：修改默认城市（可选）

打开 `src/screens/tabs/HomeScreen.js`，找到第 26 行：

```javascript
const [location, setLocation] = useState('beijing'); // 改成你的城市
```

支持的城市格式：
- 中文拼音：`beijing`, `shanghai`, `guangzhou`
- 英文名称：`new york`, `london`, `tokyo`
- 经纬度：`116.41,39.92` (北京的经纬度)
- Location ID：可以通过和风天气城市搜索 API 获取

### 第四步：启动应用测试

```bash
cd "f:\前端demo\应用\nnnew\forMe"
npm start
```

或者直接运行：

```bash
npm run android  # Android 设备
npm run ios      # iOS 设备
```

---

## 🎨 界面效果

### 天气卡片
- 大号温度显示
- 天气图标自动适配（晴天、多云、雨天、雪天等）
- 湿度和风速信息
- 毛玻璃效果背景

### 每日一句卡片
- 英文原句（大字体、斜体）
- 中文翻译（小字体、浅色）
- 来源标注（右对齐、更小字体）

---

## 🔄 下拉刷新

在主页下拉可以刷新天气和每日一句，数据实时更新！

---

## 📁 新增文件

1. **`src/api/weather.js`** - 和风天气 API 封装
   - `fetchRealtimeWeather()` - 获取实时天气
   - `searchCity()` - 搜索城市
   - `mapWeatherIcon()` - 天气图标映射

2. **`src/api/quote.js`** - 每日一句 API 封装
   - `fetchDailyQuote()` - 获取每日一句（金山词霸）
   - `fetchDailyQuoteBackup()` - 备用 API（Hitokoto）
   - `fetchInspirationalQuote()` - 励志名言（Quotable.io）
   - `getDefaultQuote()` - 默认句子（离线使用）

---

## 🚀 高级功能（可扩展）

### 1. 切换城市功能
可以在设置页面添加城市选择器，使用 `setLocation()` 切换城市。

### 2. 更多天气信息
和风天气 API 还支持：
- 未来 7 天天气预报
- 逐小时预报
- 生活指数（穿衣、运动、洗车等）
- 空气质量
- 预警信息

### 3. 更多每日一句源
已经集成了备用 API，如果需要可以切换：
- 使用 `fetchInspirationalQuote()` 获取英文励志名言
- Hitokoto 一言 API 支持多种类型（动画、诗词、网易云等）

---

## 🐛 常见问题

### Q: 天气数据不更新？
A: 检查以下几点：
1. 确认 `.env` 文件中的 API Key 正确
2. 重启 Expo 服务（`npm start` 重新运行）
3. 检查网络连接
4. 查看控制台是否有错误信息

### Q: 每日一句显示 "Loading..."？
A: 每日一句 API 无需 Key，如果一直显示加载：
1. 检查网络连接
2. 查看控制台错误信息
3. 应用会自动降级到默认句子

### Q: 想改成其他城市？
A: 修改 `HomeScreen.js` 第 26 行的 `location` 默认值即可。

---

## 📚 API 文档

- **和风天气 API**: https://dev.qweather.com/docs/api/
- **金山词霸每日一句**: https://open.iciba.com/dsapi/
- **Hitokoto 一言**: https://hitokoto.cn/
- **Quotable.io**: https://github.com/lukePeavey/quotable

---

## ✨ 享受你的新主页！

现在你的 forMe 应用主页已经接入了实时天气和每日一句功能！
