import { DeepGlowHTML } from '../../assets/deepglow.html.js';
import { HslConverterHTML } from './html/hsl_converter.html.js';

// 标准工具配置格式：
// id: 唯一标识
// title: 列表显示的标题
// description: 列表显示的描述
// icon: Ionicons 图标名
// color: 图标背景色
// type: 'native' (原生页面) | 'webview' (网页工具)
// routeName: 原生页面的路由名 (仅 native 需要)
// sourceHtml: 网页 HTML 字符串 (仅 webview 需要)
// sourceUrl: 在线 URL (仅 webview 需要，优先级高于 sourceHtml)

export const ALL_TOOLS = [
  {
    id: 'deepglow',
    title: 'DeepGlow Studio',
    description: '专业级 WebGL 图像处理，支持辉光与色温调节。',
    icon: 'color-wand',
    color: '#8b5cf6',
    type: 'native', 
    routeName: 'DeepGlow', // 这个比较复杂，我们还是保留独立的原生页面
  },
  {
    id: 'hsl_tools',
    title: 'HSL Color Mixer',
    description: 'HSL 转 RGB/Hex，带触觉反馈的调色板。',
    icon: 'color-palette',
    color: '#f59e0b',
    type: 'webview', // 这是一个网页小工具
    sourceHtml: HslConverterHTML, 
  },
  // 以后在这里加新工具...
];