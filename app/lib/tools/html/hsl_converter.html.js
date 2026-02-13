export const HslConverterHTML = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <style>
        :root { --primary: #8b5cf6; --bg: #000; --card: #1f2937; --text: #fff; }
        body { background-color: var(--bg); color: var(--text); font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 20px; height: 100vh; display: flex; flex-direction: column; box-sizing: border-box; }
        
        /* 颜色预览卡片 */
        .preview-box { height: 120px; border-radius: 16px; margin-bottom: 30px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); transition: background 0.2s; position: relative; }
        .hex-text { font-size: 24px; font-weight: bold; text-shadow: 0 2px 10px rgba(0,0,0,0.5); letter-spacing: 2px; }
        .copy-hint { position: absolute; bottom: 10px; font-size: 10px; opacity: 0.7; }

        /* 滑块样式 */
        .controls { background: var(--card); padding: 20px; border-radius: 20px; }
        .slider-group { margin-bottom: 25px; }
        .label-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; font-weight: 500; }
        .val { color: var(--primary); font-family: monospace; }
        
        input[type=range] { -webkit-appearance: none; width: 100%; background: transparent; }
        input[type=range]::-webkit-slider-runnable-track { width: 100%; height: 6px; background: #374151; border-radius: 3px; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 24px; width: 24px; border-radius: 50%; background: #fff; border: 4px solid var(--primary); margin-top: -9px; box-shadow: 0 2px 5px rgba(0,0,0,0.3); }

        /* 底部按钮 */
        .actions { margin-top: auto; display: flex; gap: 10px; }
        .btn { flex: 1; padding: 15px; border: none; border-radius: 12px; font-weight: bold; font-size: 14px; cursor: pointer; transition: 0.2s; }
        .btn-copy { background: var(--primary); color: white; }
        .btn-copy:active { opacity: 0.8; transform: scale(0.98); }
        .btn-reset { background: #374151; color: #ccc; }
    </style>
</head>
<body>

    <div id="preview" class="preview-box" onclick="copyHex()">
        <span id="hexLabel" class="hex-text">#8B5CF6</span>
        <span class="copy-hint">TAP TO COPY</span>
    </div>

    <div class="controls">
        <div class="slider-group">
            <div class="label-row"><span>Hue (色相)</span><span id="hVal" class="val">258°</span></div>
            <input type="range" id="h" min="0" max="360" value="258">
        </div>
        <div class="slider-group">
            <div class="label-row"><span>Saturation (饱和)</span><span id="sVal" class="val">57%</span></div>
            <input type="range" id="s" min="0" max="100" value="57">
        </div>
        <div class="slider-group">
            <div class="label-row"><span>Lightness (亮度)</span><span id="lVal" class="val">66%</span></div>
            <input type="range" id="l" min="0" max="100" value="66">
        </div>
    </div>

    <div class="actions">
        <button class="btn btn-reset" onclick="reset()">RESET</button>
        <button class="btn btn-copy" onclick="copyHex()">COPY RGB</button>
    </div>

    <script>
        // 核心：颜色转换算法
        function hslToHex(h, s, l) {
            l /= 100;
            const a = s * Math.min(l, 1 - l) / 100;
            const f = n => {
                const k = (n + h / 30) % 12;
                const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
                return Math.round(255 * color).toString(16).padStart(2, '0');
            };
            return \`#\${f(0)}\${f(8)}\${f(4)}\`.toUpperCase();
        }

        function hslToRgbString(h, s, l) {
             s /= 100; l /= 100;
             const k = n => (n + h / 30) % 12;
             const a = s * Math.min(l, 1 - l);
             const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
             return \`rgb(\${Math.round(255 * f(0))}, \${Math.round(255 * f(8))}, \${Math.round(255 * f(4))})\`;
        }

        const inputs = ['h', 's', 'l'];
        let currentHex = '';

        function update() {
            const h = document.getElementById('h').value;
            const s = document.getElementById('s').value;
            const l = document.getElementById('l').value;

            document.getElementById('hVal').innerText = h + '°';
            document.getElementById('sVal').innerText = s + '%';
            document.getElementById('lVal').innerText = l + '%';

            currentHex = hslToHex(h, s, l);
            const rgbString = hslToRgbString(h, s, l);

            const preview = document.getElementById('preview');
            preview.style.backgroundColor = currentHex;
            document.getElementById('hexLabel').innerText = currentHex;
            
            // 根据亮度自动调整文字颜色
            preview.style.color = l > 50 ? '#000' : '#fff';
        }

        // 绑定事件
        inputs.forEach(id => {
            const el = document.getElementById(id);
            el.addEventListener('input', () => {
                update();
                // 每次滑动，让手机轻微震动，增加手感！
                // 这是一个优化性能的节流震动，防止太频繁
                if(Math.random() > 0.5) sendToApp('haptic', { style: 'light' });
            });
        });

        function copyHex() {
            sendToApp('copy', currentHex);
            sendToApp('haptic', { style: 'medium' });
            // 简单的网页反馈
            const label = document.getElementById('hexLabel');
            const originalText = label.innerText;
            label.innerText = 'COPIED!';
            setTimeout(() => label.innerText = originalText, 1000);
        }

        function reset() {
            document.getElementById('h').value = 258;
            document.getElementById('s').value = 57;
            document.getElementById('l').value = 66;
            update();
            sendToApp('haptic', { style: 'medium' });
        }

        // 🔥 与 App 通信的桥梁
        function sendToApp(type, payload = null) {
            if (window.ReactNativeWebView) {
                // 如果 payload 是对象，合并进去
                const msg = typeof payload === 'object' ? { type, ...payload } : { type, payload };
                window.ReactNativeWebView.postMessage(JSON.stringify(msg));
            }
        }

        // 初始化
        update();
    </script>
</body>
</html>
`;