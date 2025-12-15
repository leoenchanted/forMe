// src/tools/html/draggable_mesh_gradient.html.js
export const DraggableMeshGradientHTML = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Draggable Mesh Gradient</title>
    <style>
        body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background-color: #000;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            touch-action: none;
        }
        canvas {
            display: block;
            width: 100%;
            height: 100%;
            position: absolute;
            z-index: 1;
        }

        #interaction-layer {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 30;
            pointer-events: none;
        }

        .control-point {
            position: absolute;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.25);
            border: 2px solid rgba(255, 255, 255, 0.9);
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            transform: translate(-50%, -50%);
            cursor: grab;
            pointer-events: auto;
            backdrop-filter: blur(4px);
            transition: transform 0.1s;
        }
        .control-point:active {
            transform: translate(-50%, -50%) scale(1.2);
            background: rgba(255, 255, 255, 0.6);
            cursor: grabbing;
        }
        .control-point::after {
            content: '';
            position: absolute;
            top: 50%; left: 50%;
            width: 14px; height: 14px;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            background: currentColor;
            box-shadow: 0 0 8px rgba(0,0,0,0.4);
            border: 1px solid rgba(255,255,255,0.6);
        }

        .controls-panel {
            position: absolute;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            width: 85%;
            max-width: 400px;
            padding: 16px;
            background: rgba(20, 20, 20, 0.75);
            backdrop-filter: blur(25px);
            -webkit-backdrop-filter: blur(25px);
            border-radius: 24px;
            border: 1px solid rgba(255, 255, 255, 0.15);
            display: flex;
            flex-direction: column;
            gap: 15px;
            z-index: 20;
            box-shadow: 0 10px 40px rgba(0,0,0,0.4);
        }
        
        .pickers-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
        }

        .color-wrapper {
            position: relative;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            overflow: hidden;
            border: 2px solid rgba(255,255,255,0.9);
            transition: transform 0.2s;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .color-wrapper:active { transform: scale(0.9); }
        input[type="color"] {
            position: absolute;
            top: -50%; left: -50%;
            width: 200%; height: 200%;
            border: none; cursor: pointer;
            padding: 0; margin: 0;
        }

        .actions-row {
            display: flex;
            gap: 10px;
        }

        .action-btn {
            flex: 1;
            border: none;
            background: rgba(255, 255, 255, 0.15);
            color: white;
            padding: 12px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s, transform 0.1s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
        }
        .action-btn:active {
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0.96);
        }
    </style>
</head>
<body>

    <canvas id="mesh-canvas"></canvas>

    <div id="interaction-layer">
        <div class="control-point" id="pt0"></div>
        <div class="control-point" id="pt1"></div>
        <div class="control-point" id="pt2"></div>
        <div class="control-point" id="pt3"></div>
    </div>

    <div class="controls-panel">
        <div class="pickers-row">
            <div class="color-wrapper"><input type="color" id="picker0" value="#4facfe"></div>
            <div class="color-wrapper"><input type="color" id="picker1" value="#00f2fe"></div>
            <div class="color-wrapper"><input type="color" id="picker2" value="#ff9a9e"></div>
            <div class="color-wrapper"><input type="color" id="picker3" value="#fecfef"></div>
        </div>
        
        <div class="actions-row">
            <button class="action-btn" id="btn-random">
                <span>🎲</span> 随机灵感
            </button>
            <button class="action-btn" id="btn-save">
                <span>📸</span> 保存壁纸
            </button>
        </div>
    </div>

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
            float t = u_time * 0.2;
            vec2 warp = vec2(sin(pos.y * 1.5 + t) * 0.3, cos(pos.x * 1.5 + t) * 0.3);
            vec2 distPos = pos + warp * 0.5;
            vec3 finalColor = vec3(0.0);
            float totalWeight = 0.0;
            for (int i = 0; i < 4; i++) {
                vec2 p = u_points[i];
                p.x *= aspect; 
                float d = distance(distPos, p);
                float w = 1.0 / (pow(d, 2.0) + 0.05); 
                finalColor += u_colors[i] * w;
                totalWeight += w;
            }
            finalColor /= totalWeight;
            finalColor += (hash(st * 100.0 + t) - 0.5) * 0.04;
            gl_FragColor = vec4(finalColor, 1.0);
        }
    </script>

    <script>
        function sendToApp(type, payload = null) {
            if (window.ReactNativeWebView) {
                const msg = typeof payload === 'object' ? { type, ...payload } : { type, payload };
                window.ReactNativeWebView.postMessage(JSON.stringify(msg));
            }
        }

        const canvas = document.getElementById('mesh-canvas');
        const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
        if (!gl) {
            sendToApp('haptic', { style: 'heavy' });
            alert("WebGL not supported");
        }

        function createShader(gl, type, src) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, src);
            gl.compileShader(shader);
            return shader;
        }
        const program = gl.createProgram();
        gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, document.getElementById('vertexShader').textContent));
        gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, document.getElementById('fragmentShader').textContent));
        gl.linkProgram(program);
        gl.useProgram(program);

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
        const aPos = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

        const uRes = gl.getUniformLocation(program, "u_resolution");
        const uTime = gl.getUniformLocation(program, "u_time");
        const uColors = gl.getUniformLocation(program, "u_colors"); 
        const uPoints = gl.getUniformLocation(program, "u_points");

        const state = {
            points: [
                { x: 0.15, y: 0.25 }, 
                { x: 0.85, y: 0.25 }, 
                { x: 0.20, y: 0.65 }, 
                { x: 0.80, y: 0.65 }
            ],
            colors: []
        };

        const pointEls = ['pt0','pt1','pt2','pt3'].map(id => document.getElementById(id));
        const pickerEls = ['picker0','picker1','picker2','picker3'].map(id => document.getElementById(id));

        function hexToRgb(hex) {
            return [
                parseInt(hex.slice(1,3),16)/255,
                parseInt(hex.slice(3,5),16)/255,
                parseInt(hex.slice(5,7),16)/255
            ];
        }

        function updateUniforms() {
            let flatColors = [];
            state.colors.forEach(c => flatColors.push(...c));
            let flatPoints = [];
            state.points.forEach(p => flatPoints.push(p.x, 1.0 - p.y)); 

            gl.uniform3fv(uColors, new Float32Array(flatColors));
            gl.uniform2fv(uPoints, new Float32Array(flatPoints));
            
            pointEls.forEach((el, i) => {
                el.style.left = (state.points[i].x * 100) + '%';
                el.style.top = (state.points[i].y * 100) + '%';
                const c = state.colors[i];
                el.style.color = \`rgb(\${c[0]*255}, \${c[1]*255}, \${c[2]*255})\`;
            });
        }

        pickerEls.forEach((picker, i) => {
            state.colors[i] = hexToRgb(picker.value);
            picker.addEventListener('input', (e) => {
                state.colors[i] = hexToRgb(e.target.value);
                updateUniforms();
                sendToApp('haptic', { style: 'light' });
            });
        });

        document.getElementById('btn-random').addEventListener('click', () => {
            pickerEls.forEach((picker, i) => {
                const r = Math.floor(Math.random() * 255);
                const g = Math.floor(Math.random() * 255);
                const b = Math.floor(Math.random() * 255);
                const hex = "#" + [r,g,b].map(x => x.toString(16).padStart(2,'0')).join('');
                picker.value = hex;
                state.colors[i] = [r/255, g/255, b/255];
            });
            updateUniforms();
            sendToApp('haptic', { style: 'medium' });
        });

        // ✅ 关键修改：使用 requestScreenshot + action
        document.getElementById('btn-save').addEventListener('click', function() {
            sendToApp('requestScreenshot', { action: 'saveToAlbum' });
            sendToApp('haptic', { style: 'heavy' });
        });

        // 👇 安全调用：使用可选链，避免其他工具报错
        function setCaptureMode(enable) {
            const panel = document.querySelector('.controls-panel');
            const points = document.querySelectorAll('.control-point');
            if (panel && points) {
                panel.style.display = enable ? 'none' : 'flex';
                points.forEach(p => p.style.display = enable ? 'none' : 'block');
            }
        }

        let activeIdx = -1;
        function handleStart(i, cx, cy) { activeIdx = i; }
        function handleMove(cx, cy) {
            if (activeIdx === -1) return;
            let x = cx / window.innerWidth;
            let y = cy / window.innerHeight;
            x = Math.max(0, Math.min(1, x));
            y = Math.max(0, Math.min(1, y));
            state.points[activeIdx] = { x, y };
            updateUniforms();
        }

        pointEls.forEach((el, i) => {
            el.addEventListener('touchstart', e => {
                e.preventDefault();
                handleStart(i, e.touches[0].clientX, e.touches[0].clientY);
                sendToApp('haptic', { style: 'light' });
            }, {passive: false});
            el.addEventListener('mousedown', e => {
                handleStart(i, e.clientX, e.clientY);
                sendToApp('haptic', { style: 'light' });
            });
        });

        window.addEventListener('touchmove', e => {
            if(activeIdx !== -1) {
                e.preventDefault();
                handleMove(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, {passive: false});
        window.addEventListener('mousemove', e => handleMove(e.clientX, e.clientY));
        window.addEventListener('touchend', () => activeIdx = -1);
        window.addEventListener('mouseup', () => activeIdx = -1);

        function resize() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform2f(uRes, canvas.width, canvas.height);
            updateUniforms();
        }
        window.addEventListener('resize', resize);
        resize();

        let startTime = Date.now();
        function loop() {
            gl.uniform1f(uTime, (Date.now() - startTime) / 1000);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            requestAnimationFrame(loop);
        }
        loop();
    </script>
</body>
</html>
`;
