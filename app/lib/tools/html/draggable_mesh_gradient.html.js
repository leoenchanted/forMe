// src/tools/html/draggable_mesh_gradient.html.js
export const DraggableMeshGradientHTML = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Pro Mesh Gradient V3</title>
    <style>
        /* [Styles - 保持不变] */
        :root {
            --glass-bg: rgba(20, 20, 20, 0.85);
            --glass-border: rgba(255, 255, 255, 0.15);
            --accent: #007aff;
            --panel-height: 140px; 
        }
        body, html {
            margin: 0; padding: 0; width: 100%; height: 100%;
            overflow: hidden; background-color: #000;
            font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", Roboto, sans-serif;
            touch-action: none;
            -webkit-tap-highlight-color: transparent;
        }
        canvas {
            display: block; width: 100%; height: 100%;
            position: absolute; z-index: 1;
        }

        /* --- 交互层 (网格点) --- */
        #interaction-layer {
            position: absolute; inset: 0; z-index: 10;
            pointer-events: none;
        }
        .control-point {
            position: absolute; width: 54px; height: 54px; 
            border-radius: 50%;
            background: rgba(255,255,255,0.15);
            border: 2px solid rgba(255,255,255,0.7);
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            transform: translate(-50%, -50%);
            pointer-events: auto;
            backdrop-filter: blur(4px);
            display: flex; justify-content: center; align-items: center;
            transition: transform 0.1s;
        }
        .control-point:active { transform: translate(-50%, -50%) scale(1.1); background: rgba(255,255,255,0.3); }
        
        .control-point::after {
            content: ''; width: 16px; height: 16px;
            border-radius: 50%; background: currentColor;
            border: 2px solid rgba(255,255,255,0.9);
            box-shadow: 0 0 6px rgba(0,0,0,0.3);
        }

        /* --- 底部主控板 --- */
        .controls-panel {
            position: absolute; bottom: 30px; left: 16px; right: 16px;
            padding: 20px;
            background: var(--glass-bg);
            backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
            border-radius: 28px;
            border: 1px solid var(--glass-border);
            z-index: 20;
            display: flex; flex-direction: column; gap: 18px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.6);
        }
        .circles-row {
            display: flex; justify-content: space-between; align-items: center;
            padding: 0 8px;
        }
        .color-btn {
            width: 48px; height: 48px; border-radius: 50%;
            border: 2px solid rgba(255,255,255,0.9);
            position: relative; overflow: hidden;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            transition: transform 0.2s;
            /* 确保底部按钮是可交互的 (点击打开编辑器) */
            cursor: pointer;
            pointer-events: auto; 
        }
        .color-btn:active { transform: scale(0.9); }

        .actions-row { display: flex; gap: 12px; }
        .action-btn {
            flex: 1; height: 48px; border: none;
            background: rgba(255,255,255,0.15);
            color: white; border-radius: 14px;
            font-size: 15px; font-weight: 600;
            display: flex; align-items: center; justify-content: center; gap: 8px;
            cursor: pointer;
        }
        .action-btn:active { background: rgba(255,255,255,0.3); transform: scale(0.98); }

        /* --- 弹窗基础 --- */
        .modal-overlay {
            position: absolute; inset: 0;
            background: rgba(0,0,0,0.7);
            backdrop-filter: blur(8px);
            z-index: 100;
            opacity: 0; pointer-events: none;
            transition: opacity 0.25s;
            display: flex; justify-content: center;
        }
        .modal-overlay.active { opacity: 1; pointer-events: auto; }

        /* --- 颜色编辑器 (底部弹出) --- */
        .editor-sheet {
            width: 100%; max-width: 500px;
            background: #1c1c1e;
            border-top-left-radius: 24px; border-top-right-radius: 24px;
            padding: 24px 24px 50px 24px;
            margin-top: auto; 
            transform: translateY(100%); transition: transform 0.3s cubic-bezier(0.2, 0.9, 0.3, 1);
            border-top: 1px solid rgba(255,255,255,0.15);
            display: flex; flex-direction: column; gap: 20px;
        }
        .modal-overlay.active .editor-sheet { transform: translateY(0); }

        .sheet-header {
            display: flex; justify-content: space-between; align-items: center;
            color: white; font-size: 18px; font-weight: 700; margin-bottom: 5px;
        }
        .close-text-btn { background: none; border: none; color: #007aff; font-size: 16px; font-weight: 600; padding: 5px; }

        /* 滑块 */
        .slider-group { display: flex; flex-direction: column; gap: 16px; }
        .slider-row { display: flex; align-items: center; gap: 15px; }
        .slider-label { color: #8e8e93; width: 20px; font-size: 14px; font-weight: 700; }
        input[type=range] { flex: 1; -webkit-appearance: none; height: 6px; border-radius: 3px; outline: none; }
        input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none; width: 24px; height: 24px;
            border-radius: 50%; background: white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4); border: 0.5px solid rgba(0,0,0,0.1);
        }
        #hue-slider { background: linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00); }

        /* 输入框 */
        .input-group { display: flex; gap: 10px; }
        .input-box {
            background: #2c2c2e; border-radius: 10px;
            padding: 8px 10px; flex: 1; display: flex; flex-direction: column;
            border: 1px solid rgba(255,255,255,0.1);
        }
        .input-box label { color: #8e8e93; font-size: 10px; margin-bottom: 2px; }
        .input-box input {
            background: none; border: none; color: white;
            font-size: 14px; font-family: monospace; width: 100%; outline: none; padding: 0;
        }

        /* --- 中心弹窗 (保存/信息) --- */
        .center-modal {
            position: relative;
            background: rgba(35, 35, 35, 0.95);
            padding: 24px; border-radius: 24px;
            width: 80%; max-width: 340px;
            text-align: center; color: white;
            margin: auto; 
            border: 1px solid rgba(255,255,255,0.15);
            box-shadow: 0 20px 40px rgba(0,0,0,0.6);
            transform: scale(0.9); transition: transform 0.2s;
            max-height: 90vh; overflow-y: auto; 
        }
        .modal-overlay.active .center-modal { transform: scale(1); }

        /* 右上角关闭按钮 X */
        .modal-close-icon {
            position: absolute; top: 15px; right: 15px;
            width: 30px; height: 30px;
            background: rgba(255,255,255,0.1);
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 16px; color: #ddd; cursor: pointer;
            z-index: 10;
        }
        .modal-close-icon:active { background: rgba(255,255,255,0.3); }

        .save-preview-img {
            width: 100%; height: auto; border-radius: 12px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            margin: 10px 0 15px 0; border: 2px solid rgba(255,255,255,0.1);
        }
        
        .copy-value {
            font-size: 22px; font-family: monospace; letter-spacing: 1px; font-weight: 700;
            padding: 12px; background: rgba(0,0,0,0.3); border-radius: 12px;
            margin: 15px 0; user-select: text; border: 1px solid rgba(255,255,255,0.1);
        }

        /* Toast */
        #toast {
            position: fixed; top: 20px; left: 50%; transform: translateX(-50%) translateY(-100px);
            background: rgba(255,255,255,0.95); color: #000;
            padding: 12px 24px; border-radius: 30px; font-weight: 600; font-size: 14px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            z-index: 200; pointer-events: none; display: flex; align-items: center; gap: 8px;
        }
        #toast.show { transform: translateX(-50%) translateY(0); }
    </style>
</head>
<body>

    <canvas id="mesh-canvas"></canvas>

    <div id="interaction-layer">
        <div class="control-point" id="pt0" data-idx="0"></div>
        <div class="control-point" id="pt1" data-idx="1"></div>
        <div class="control-point" id="pt2" data-idx="2"></div>
        <div class="control-point" id="pt3" data-idx="3"></div>
    </div>

    <div class="controls-panel" id="main-panel">
        <div class="circles-row">
            <div class="color-btn" id="cbtn0" data-idx="0" onclick="openEditor(0)"></div>
            <div class="color-btn" id="cbtn1" data-idx="1" onclick="openEditor(1)"></div>
            <div class="color-btn" id="cbtn2" data-idx="2" onclick="openEditor(2)"></div>
            <div class="color-btn" id="cbtn3" data-idx="3" onclick="openEditor(3)"></div>
        </div>
        
        <div class="actions-row">
            <button class="action-btn" id="btn-random">
                <span>🎲</span> 随机配色
            </button>
            <button class="action-btn" id="btn-export">
                <span>📸</span> 生成壁纸
            </button>
        </div>
    </div>

    <div class="modal-overlay" id="editor-modal">
        <div class="editor-sheet" onclick="event.stopPropagation()">
            <div class="sheet-header">
                <span>调色板</span>
                <button class="close-text-btn" onclick="closeModal('editor-modal')">完成</button>
            </div>

            <div class="slider-group">
                <div class="slider-row">
                    <span class="slider-label">H</span>
                    <input type="range" id="hue-slider" min="0" max="360">
                </div>
                <div class="slider-row">
                    <span class="slider-label">S</span>
                    <input type="range" id="sat-slider" min="0" max="100">
                </div>
                <div class="slider-row">
                    <span class="slider-label">L</span>
                    <input type="range" id="light-slider" min="0" max="100">
                </div>
            </div>

            <div class="input-group">
                <div class="input-box" style="flex: 1.5;">
                    <label>HEX</label>
                    <input type="text" id="input-hex">
                </div>
                <div class="input-box">
                    <label>R</label>
                    <input type="number" id="input-r" min="0" max="255">
                </div>
                <div class="input-box">
                    <label>G</label>
                    <input type="number" id="input-g" min="0" max="255">
                </div>
                <div class="input-box">
                    <label>B</label>
                    <input type="number" id="input-b" min="0" max="255">
                </div>
            </div>
        </div>
    </div>

    <div class="modal-overlay" id="save-modal">
        <div class="center-modal" onclick="event.stopPropagation()">
            <div class="modal-close-icon" onclick="closeModal('save-modal')">✕</div>

            <div class="sheet-header" style="justify-content:center; margin-bottom:10px;">壁纸预览 (浏览器调试)</div>
            <img id="result-img" class="save-preview-img" alt="Preview">
            
            <div style="font-size:13px; color:#aaa; margin-bottom:20px; line-height:1.5;">
                长按上方图片 → “存储到照片”<br>即可保存到系统相册
            </div>
            
            <button class="action-btn" style="width:100%; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2);" onclick="closeModal('save-modal')">
                关闭预览
            </button>
        </div>
    </div>

    <div class="modal-overlay" id="info-modal">
        <div class="center-modal" onclick="event.stopPropagation()">
            <div class="modal-close-icon" onclick="closeModal('info-modal')">✕</div>

            <div class="sheet-header" style="justify-content:center;">颜色详情</div>
            <div class="color-btn" id="info-color-preview" style="width:60px; height:60px; margin: 15px auto; border-radius:18px; pointer-events: none;"></div>
            
            <div class="copy-value" id="info-hex">#FFFFFF</div>
            <div style="font-size:13px; color:#888; margin-bottom:20px;" id="info-rgb">rgb(255, 255, 255)</div>

            <button class="action-btn" style="width:100%; background:var(--accent); margin-bottom:10px;" onclick="copyColor()">
                复制 HEX 代码
            </button>
        </div>
    </div>

    <div id="toast"><span>✅</span> 已复制</div>

    <script type="x-shader/x-vertex" id="vertexShader">
        attribute vec2 a_position;
        void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
    </script>
    <script type="x-shader/x-fragment" id="fragmentShader">
        precision highp float;
        uniform vec2 u_resolution;
        uniform float u_time;
        uniform vec3 u_colors[4];
        uniform vec2 u_points[4];
        float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
        void main() {
            vec2 st = gl_FragCoord.xy / u_resolution.xy;
            float aspect = u_resolution.x / u_resolution.y;
            vec2 pos = st; pos.x *= aspect;
            float t = u_time * 0.15;
            vec2 warp = vec2(sin(pos.y * 1.2 + t) * 0.35, cos(pos.x * 1.2 + t) * 0.35);
            vec2 distPos = pos + warp * 0.5;
            vec3 finalColor = vec3(0.0);
            float totalWeight = 0.0;
            for (int i = 0; i < 4; i++) {
                vec2 p = u_points[i];
                p.x *= aspect; 
                float d = distance(distPos, p);
                float w = 1.0 / (pow(d, 2.2) + 0.02); 
                finalColor += u_colors[i] * w;
                totalWeight += w;
            }
            finalColor /= totalWeight;
            finalColor += (hash(st * 100.0 + t) - 0.5) * 0.03;
            gl_FragColor = vec4(finalColor, 1.0);
        }
    </script>

    <script>
        // [JS Logic - 保持不变，但更新长按/点击逻辑]

        // 初始化 WebGL
        const canvas = document.getElementById('mesh-canvas');
        const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true, alpha: false });
        // ... (WebGL setup)
        if (!gl) alert("WebGL unsupported");

        function createShader(gl, type, src) {
            const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s;
        }
        const prog = gl.createProgram();
        gl.attachShader(prog, createShader(gl, gl.VERTEX_SHADER, document.getElementById('vertexShader').text));
        gl.attachShader(prog, createShader(gl, gl.FRAGMENT_SHADER, document.getElementById('fragmentShader').text));
        gl.linkProgram(prog); gl.useProgram(prog);

        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
        const aPos = gl.getAttribLocation(prog, "a_position");
        gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

        const uRes = gl.getUniformLocation(prog, "u_resolution");
        const uTime = gl.getUniformLocation(prog, "u_time");
        const uColors = gl.getUniformLocation(prog, "u_colors");
        const uPoints = gl.getUniformLocation(prog, "u_points");

        // 状态管理
        const state = {
            points: [{x:0.15,y:0.25}, {x:0.85,y:0.25}, {x:0.2,y:0.65}, {x:0.8,y:0.65}],
            colors: [[0,0.5,1], [0,0.9,0.9], [1,0.5,0.6], [1,0.85,0.95]],
            editingIdx: -1
        };
        const domPoints = ['pt0','pt1','pt2','pt3'].map(id => document.getElementById(id));
        const domBtns = ['cbtn0','cbtn1','cbtn2','cbtn3'].map(id => document.getElementById(id));

        // 辅助函数 (保持不变)
        const rgb2hex = (r,g,b) => "#" + [r,g,b].map(x=>Math.round(x*255).toString(16).padStart(2,'0')).join('').toUpperCase();
        const hex2rgb = (hex) => {
            let c = hex.substring(1).match(/.{1,2}/g).map(x=>parseInt(x,16)/255);
            return c.length===3 ? c : [0,0,0];
        };
        function rgbToHsl(r, g, b) {
            let max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;
            if (max == min) { h = s = 0; } else {
                let d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h *= 60;
            }
            return [h, s * 100, l * 100];
        }
        function hslToRgb(h, s, l) {
            s /= 100; l /= 100;
            let c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2, r=0, g=0, b=0;
            if (0 <= h && h < 60) { r=c; g=x; b=0; }
            else if (60 <= h && h < 120) { r=x; g=c; b=0; }
            else if (120 <= h && h < 180) { r=0; g=c; b=x; }
            else if (180 <= h && h < 240) { r=0; g=x; b=c; }
            else if (240 <= h && h < 300) { r=x; g=0; b=c; }
            else if (300 <= h && h < 360) { r=c; g=0; b=x; }
            return [r+m, g+m, b+m];
        }

        function updateEngine() {
            const flatColors = []; state.colors.forEach(c => flatColors.push(...c));
            const flatPoints = []; state.points.forEach(p => flatPoints.push(p.x, 1.0 - p.y));
            gl.uniform3fv(uColors, new Float32Array(flatColors));
            gl.uniform2fv(uPoints, new Float32Array(flatPoints));
            
            state.points.forEach((p, i) => {
                domPoints[i].style.left = (p.x * 100) + '%';
                domPoints[i].style.top = (p.y * 100) + '%';
                const [r,g,b] = state.colors[i];
                const cssRgb = \`rgb(\${Math.round(r*255)},\${Math.round(g*255)},\${Math.round(b*255)})\`;
                domPoints[i].style.color = cssRgb;
                domBtns[i].style.backgroundColor = cssRgb;
            });
        }

        // 编辑器逻辑 (保持不变)
        const sliderEls = [document.getElementById('hue-slider'), document.getElementById('sat-slider'), document.getElementById('light-slider')];
        const inputEls = {
            hex: document.getElementById('input-hex'),
            r: document.getElementById('input-r'),
            g: document.getElementById('input-g'),
            b: document.getElementById('input-b')
        };

        window.openEditor = function(idx) { // 🚨 暴露给 HTML onClick
            state.editingIdx = idx;
            const [r,g,b] = state.colors[idx];
            syncEditorUI(r,g,b);
            document.getElementById('editor-modal').classList.add('active');
        }

        function syncEditorUI(r, g, b, skipInputs = false) {
            const [h, s, l] = rgbToHsl(r,g,b);
            sliderEls[0].value = h; sliderEls[1].value = s; sliderEls[2].value = l;
            
            sliderEls[1].style.background = \`linear-gradient(to right, #888, hsl(\${h}, 100%, 50%))\`;
            sliderEls[2].style.background = \`linear-gradient(to right, #000, hsl(\${h}, \${s}%, 50%), #fff)\`;

            if(!skipInputs) {
                if(document.activeElement !== inputEls.hex) inputEls.hex.value = rgb2hex(r,g,b);
                if(document.activeElement !== inputEls.r) inputEls.r.value = Math.round(r*255);
                if(document.activeElement !== inputEls.g) inputEls.g.value = Math.round(g*255);
                if(document.activeElement !== inputEls.b) inputEls.b.value = Math.round(b*255);
            }
        }

        function applyColor(r, g, b) {
            r = Math.max(0, Math.min(1, r));
            g = Math.max(0, Math.min(1, g));
            b = Math.max(0, Math.min(1, b));

            if(state.editingIdx === -1) return;
            state.colors[state.editingIdx] = [r,g,b];
            updateEngine();
            syncEditorUI(r,g,b, true); 
        }

        // ... (Slider/Input event listeners - 保持不变)
        sliderEls.forEach(el => el.addEventListener('input', () => {
            const [r,g,b] = hslToRgb(parseFloat(sliderEls[0].value), parseFloat(sliderEls[1].value), parseFloat(sliderEls[2].value));
            applyColor(r,g,b);
        }));

        [inputEls.r, inputEls.g, inputEls.b].forEach(el => el.addEventListener('input', () => {
            applyColor(parseFloat(inputEls.r.value)/255, parseFloat(inputEls.g.value)/255, parseFloat(inputEls.b.value)/255);
        }));

        inputEls.hex.addEventListener('change', () => {
            let val = inputEls.hex.value;
            if(!val.startsWith('#')) val = '#' + val;
            if(/^#[0-9A-F]{6}$/i.test(val)) {
                const [r,g,b] = hex2rgb(val);
                applyColor(r,g,b);
            }
        });

        // 🚀 长按控制点显示信息弹窗 (现在只在长按时触发)
        function showInfoModal(idx) {
            const [r,g,b] = state.colors[idx];
            const hex = rgb2hex(r,g,b);
            const cssRgb = \`rgb(\${Math.round(r*255)}, \${Math.round(g*255)}, \${Math.round(b*255)})\`;

            document.getElementById('info-color-preview').style.backgroundColor = cssRgb;
            document.getElementById('info-hex').textContent = hex;
            document.getElementById('info-rgb').textContent = cssRgb.replace('rgb', 'RGB');
            
            // 确保 Native 端接收到 haptic 消息
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'haptic', style: 'medium' }));
            }

            document.getElementById('info-modal').classList.add('active');
        }

        // 复制功能 (保持不变)
        window.copyColor = function() {
            const txt = document.getElementById('info-hex').textContent;
            navigator.clipboard.writeText(txt).then(() => {
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'haptic', style: 'light' }));
                }

                const t = document.getElementById('toast');
                t.classList.add('show');
                setTimeout(()=>t.classList.remove('show'), 2000);
                closeModal('info-modal');
            });
        };

        // 随机 & 导出 (保持不变)
        document.getElementById('btn-random').addEventListener('click', () => {
            state.colors = state.colors.map(() => {
                const r = Math.random(), g = Math.random(), b = Math.random();
                return [r * 0.5 + 0.5, g * 0.5 + 0.5, b * 0.5 + 0.5]; 
            });
            updateEngine();
        });

        document.getElementById('btn-export').addEventListener('click', () => {
            const dpr = window.devicePixelRatio || 2; 
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform2f(uRes, canvas.width, canvas.height);
            updateEngine();
            gl.uniform1f(uTime, (Date.now()-startTime)/1000);
            gl.drawArrays(gl.TRIANGLES, 0, 6);

            const dataUrl = canvas.toDataURL('image/png', 1.0);
            
            const colorData = state.colors.map(rgb => {
                const [r, g, b] = rgb.map(c => Math.round(c * 255));
                const hex = rgb2hex(rgb[0], rgb[1], rgb[2]);
                return { hex, r, g, b };
            });

            const message = JSON.stringify({
                type: 'exportAndSave', 
                payload: {
                    dataUrl: dataUrl,
                    colors: colorData, 
                },
            });

            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(message);
            } else {
                document.getElementById('result-img').src = dataUrl;
                document.getElementById('save-modal').classList.add('active');
            }
            
            resize(); 
        });

        // 通用关闭
        window.closeModal = function(id) { document.getElementById(id).classList.remove('active'); };
        document.querySelectorAll('.modal-overlay').forEach(el => {
            el.addEventListener('click', function(e) { if(e.target === this) this.classList.remove('active'); });
        });

        // 🚀 拖拽/长按逻辑 (修正：短按/点击不应再打开编辑器)
        let activePt = -1;
        let pressTimer = null; 
        let isLongPress = false; 
        const panelHeightPct = 180 / window.innerHeight;
        
        const handleStart = (i) => {
            activePt = i;
            isLongPress = false;
            
            // 启动长按计时器 (500ms) -> 触发 showInfoModal
            pressTimer = setTimeout(() => {
                isLongPress = true;
                showInfoModal(i); 
                activePt = -1; // 触发长按后，结束拖拽流程
            }, 500);
        };

        const handleMove = (cx, cy) => {
            if(activePt === -1) return;
            
            // 如果开始拖动，则取消长按事件，不执行任何操作
            if (pressTimer) {
                clearTimeout(pressTimer);
                pressTimer = null;
            }

            let x = cx / window.innerWidth;
            let y = cy / window.innerHeight;
            
            const maxY = 1.0 - (180 / window.innerHeight); 
            
            state.points[activePt] = {
                x: Math.max(0, Math.min(1, x)),
                y: Math.max(0, Math.min(maxY, y)) 
            };
            updateEngine();
        };

        const handleEnd = () => {
            if (pressTimer) {
                clearTimeout(pressTimer); // 清除计时器
                // 🚨 修正逻辑：短按/点击不执行任何操作 (不再调用 openEditor)
            }
            activePt = -1;
            isLongPress = false;
        };

        domPoints.forEach((el, i) => {
            el.addEventListener('touchstart', e => { handleStart(i); }, {passive:true});
            el.addEventListener('mousedown', e => handleStart(i));
        });
        window.addEventListener('touchmove', e => { 
            if(activePt!==-1) { 
                e.preventDefault(); 
                handleMove(e.touches[0].clientX, e.touches[0].clientY); 
            }
        }, {passive:false});
        window.addEventListener('mousemove', e => handleMove(e.clientX, e.clientY));
        window.addEventListener('touchend', handleEnd); window.addEventListener('mouseup', handleEnd);

        // Resize & Loop (保持不变)
        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform2f(uRes, canvas.width, canvas.height);
            updateEngine();
        };
        window.addEventListener('resize', resize);
        resize(); updateEngine();

        let startTime = Date.now();
        function loop() {
            gl.uniform1f(uTime, (Date.now()-startTime)/1000);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            requestAnimationFrame(loop);
        }
        loop();

    </script>
</body>
</html>
`;