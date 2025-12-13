export const DeepGlowHTML = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>PhotoGlow Engine</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        gray: { 850: '#1f2937', 900: '#111827', 950: '#030712' },
                        accent: { 500: '#8b5cf6', 600: '#7c3aed', glow: 'rgba(139, 92, 246, 0.5)' }
                    },
                    fontFamily: { mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'] }
                }
            }
        }
    </script>
    <style>
        body { background-color: #000; overflow: hidden; height: 100vh; display: flex; flex-direction: column; }
        /* 隐藏滚动条 */
        ::-webkit-scrollbar { width: 0; }
        
        input[type=range] { 
            -webkit-appearance: none; width: 100%; background: transparent; margin: 6px 0; cursor: pointer; touch-action: none; 
        }
        input[type=range]::-webkit-slider-runnable-track { width: 100%; height: 4px; background: #374151; border-radius: 2px; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 16px; width: 16px; border-radius: 50%; background: #e5e7eb; margin-top: -6px; border: 2px solid #1f2937; }
        
        .canvas-container { flex: 1; position: relative; display: flex; align-items: center; justify-content: center; background-image: radial-gradient(#1f2937 1px, transparent 1px); background-size: 20px 20px; overflow: hidden; }
        canvas { max-width: 100%; max-height: 100%; object-fit: contain; box-shadow: 0 0 20px rgba(0,0,0,0.5); }
        
        .controls-panel { height: 45vh; background: #111827; border-top: 1px solid #374151; overflow-y: auto; padding: 20px; padding-bottom: 40px; }
        .control-group { margin-bottom: 20px; }
        .control-label { display: flex; justify-content: space-between; font-size: 12px; color: #9ca3af; margin-bottom: 8px; font-family: monospace; }
        .section-title { color: #8b5cf6; font-size: 12px; font-weight: bold; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; text-transform: uppercase; letter-spacing: 1px; }
    </style>
</head>
<body>

    <!-- 画布区域 -->
    <div class="canvas-container">
        <div id="placeholder" style="color: #4b5563; text-align: center;">
            <i class="fas fa-image" style="font-size: 48px; margin-bottom: 10px;"></i>
            <p>Waiting for image...</p>
        </div>
        <canvas id="glCanvas" class="hidden"></canvas>
    </div>

    <!-- 控制面板 (保留所有调节选项) -->
    <div class="controls-panel">
        
        <!-- 1. Deep Glow -->
        <div class="section-title"><i class="fas fa-sun"></i> Deep Glow</div>
        <div class="control-group">
            <div class="control-label"><span>Intensity</span><span id="bloomStrengthVal">0.0</span></div>
            <input type="range" id="bloomStrength" min="0" max="300" value="0" step="1">
        </div>
        <div class="control-group">
            <div class="control-label"><span>Threshold</span><span id="bloomThresholdVal">0.70</span></div>
            <input type="range" id="bloomThreshold" min="0" max="100" value="70" step="1">
        </div>
        <div class="control-group">
            <div class="control-label"><span>Radius</span><span id="bloomRadiusVal">100</span></div>
            <input type="range" id="bloomRadius" min="0" max="500" value="100" step="1">
        </div>

        <hr style="border-color: #374151; margin: 15px 0;">

        <!-- 2. Film Look -->
        <div class="section-title" style="color: #fcd34d;"><i class="fas fa-film"></i> Film Look</div>
        <div class="control-group">
            <div class="control-label"><span>Grain</span><span id="grainVal">0.0</span></div>
            <input type="range" id="grain" min="0" max="100" value="0" step="1">
        </div>
        <div class="control-group">
            <div class="control-label"><span>Vignette</span><span id="vignetteVal">0.0</span></div>
            <input type="range" id="vignette" min="0" max="100" value="0" step="1">
        </div>
        <div class="control-group">
            <div class="control-label"><span>Aberration</span><span id="aberrationVal">0.0</span></div>
            <input type="range" id="aberration" min="0" max="100" value="0" step="1">
        </div>
        <div class="control-group">
            <div class="control-label"><span>Temperature</span><span id="temperatureVal">0.0</span></div>
            <input type="range" id="temperature" min="-50" max="50" value="0" step="1">
        </div>

        <hr style="border-color: #374151; margin: 15px 0;">

        <!-- 3. Tone -->
        <div class="section-title" style="color: #93c5fd;"><i class="fas fa-adjust"></i> Tone</div>
        <div class="control-group">
            <div class="control-label"><span>Exposure</span><span id="exposureVal">0.0</span></div>
            <input type="range" id="exposure" min="-100" max="100" value="0" step="1">
        </div>
        <div class="control-group">
            <div class="control-label"><span>Contrast</span><span id="contrastVal">0.0</span></div>
            <input type="range" id="contrast" min="-100" max="100" value="0" step="1">
        </div>
        <div class="control-group">
            <div class="control-label"><span>Saturation</span><span id="saturationVal">0.0</span></div>
            <input type="range" id="saturation" min="-100" max="100" value="0" step="1">
        </div>
        <div class="control-group">
            <div class="control-label"><span>Highs</span><span id="highlightsVal">0.0</span></div>
            <input type="range" id="highlights" min="-100" max="100" value="0" step="1">
        </div>
        <div class="control-group">
            <div class="control-label"><span>Shadows</span><span id="shadowsVal">0.0</span></div>
            <input type="range" id="shadows" min="-100" max="100" value="0" step="1">
        </div>
    </div>

<script>
    // --- WebGL Shaders (完整保留) ---
    const VS_SOURCE = \`
        attribute vec2 a_position;
        attribute vec2 a_texCoord;
        varying vec2 v_texCoord;
        void main() {
            gl_Position = vec4(a_position, 0, 1);
            v_texCoord = a_texCoord;
        }
    \`;

    const FS_COPY = \`
        precision mediump float;
        varying vec2 v_texCoord;
        uniform sampler2D u_image;
        void main() {
            gl_FragColor = texture2D(u_image, v_texCoord);
        }
    \`;

    const FS_PREPROCESS = \`
        precision mediump float;
        varying vec2 v_texCoord;
        uniform sampler2D u_image;
        uniform float u_exposure;
        uniform float u_contrast;
        uniform float u_saturation;
        uniform float u_temp;
        uniform float u_highs;
        uniform float u_shadows;
        uniform float u_bloomThresh;

        vec3 adjustColor(vec3 color) {
            color = color * pow(2.0, u_exposure);
            color = (color - 0.5) * (u_contrast + 1.0) + 0.5;
            float gray = dot(color, vec3(0.299, 0.587, 0.114));
            color = mix(vec3(gray), color, u_saturation + 1.0);
            color.r += u_temp * 0.1;
            color.b -= u_temp * 0.1;
            return clamp(color, 0.0, 1.0);
        }

        void main() {
            vec4 texColor = texture2D(u_image, v_texCoord);
            vec3 color = adjustColor(texColor.rgb);
            gl_FragColor = vec4(color, 1.0);
        }
    \`;

    const FS_BLUR = \`
        precision mediump float;
        varying vec2 v_texCoord;
        uniform sampler2D u_image;
        uniform vec2 u_resolution;
        uniform vec2 u_direction; 
        uniform bool u_isFirstPass; 
        uniform float u_bloomThresh;

        void main() {
            vec2 off1 = vec2(1.3846153846) * u_direction;
            vec2 off2 = vec2(3.2307692308) * u_direction;
            vec3 color = vec3(0.0);
            float weight0 = 0.227027;
            float weight1 = 0.316216; 
            float weight2 = 0.070270;
            
            vec4 c = texture2D(u_image, v_texCoord);
            vec3 center = c.rgb;
            if (u_isFirstPass) {
                float brightness = dot(center, vec3(0.2126, 0.7152, 0.0722));
                center *= smoothstep(u_bloomThresh, u_bloomThresh + 0.1, brightness);
            }
            color += center * weight0;
            
            vec3 s1 = texture2D(u_image, v_texCoord + (off1 / u_resolution)).rgb;
            vec3 s2 = texture2D(u_image, v_texCoord - (off1 / u_resolution)).rgb;
            if(u_isFirstPass) {
                float b1 = dot(s1, vec3(0.2126, 0.7152, 0.0722)); s1 *= smoothstep(u_bloomThresh, u_bloomThresh+0.1, b1);
                float b2 = dot(s2, vec3(0.2126, 0.7152, 0.0722)); s2 *= smoothstep(u_bloomThresh, u_bloomThresh+0.1, b2);
            }
            color += (s1 + s2) * weight1;
            
            vec3 s3 = texture2D(u_image, v_texCoord + (off2 / u_resolution)).rgb;
            vec3 s4 = texture2D(u_image, v_texCoord - (off2 / u_resolution)).rgb;
            if(u_isFirstPass) {
                float b3 = dot(s3, vec3(0.2126, 0.7152, 0.0722)); s3 *= smoothstep(u_bloomThresh, u_bloomThresh+0.1, b3);
                float b4 = dot(s4, vec3(0.2126, 0.7152, 0.0722)); s4 *= smoothstep(u_bloomThresh, u_bloomThresh+0.1, b4);
            }
            color += (s3 + s4) * weight2;
            gl_FragColor = vec4(color, 1.0);
        }
    \`;

    const FS_COMPOSITE = \`
        precision mediump float;
        varying vec2 v_texCoord;
        uniform sampler2D u_base;  
        uniform sampler2D u_bloom; 
        
        uniform float u_bloomStrength;
        uniform float u_grain;
        uniform float u_vignette;
        uniform float u_aberration; 
        uniform float u_time; 

        float rand(vec2 n) { return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453); }

        void main() {
            vec3 baseColor;
            if (u_aberration > 0.0) {
                float dist = distance(v_texCoord, vec2(0.5));
                vec2 offset = (v_texCoord - 0.5) * u_aberration * dist * 0.05;
                float r = texture2D(u_base, v_texCoord - offset).r;
                float g = texture2D(u_base, v_texCoord).g;
                float b = texture2D(u_base, v_texCoord + offset).b;
                baseColor = vec3(r, g, b);
            } else {
                baseColor = texture2D(u_base, v_texCoord).rgb;
            }

            vec3 bloomColor = texture2D(u_bloom, v_texCoord).rgb;
            vec3 result = baseColor + (bloomColor * u_bloomStrength);
            
            vec2 uv = v_texCoord * 2.0 - 1.0; 
            float dist = length(uv);
            float vig = smoothstep(0.5, 1.5, dist * (1.0 + u_vignette));
            result *= (1.0 - vig * 0.6 * u_vignette);

            if (u_grain > 0.0) {
                float noise = rand(v_texCoord * 10.0 + mod(u_time, 10.0));
                float lum = dot(result, vec3(0.2126, 0.7152, 0.0722));
                float mask = 1.0 - pow(abs(lum - 0.5) * 2.0, 2.0); 
                result = mix(result, result + (noise - 0.5) * 0.2, u_grain * mask);
            }
            gl_FragColor = vec4(result, 1.0);
        }
    \`;

    // --- Core Logic ---
    const canvas = document.getElementById('glCanvas');
    const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true, alpha: false }); 
    const state = {
        textureOriginal: null,
        fboBase: null, fboPing: null, fboPong: null, 
        width: 0, height: 0, programs: {}
    };

    // 监听 React Native 发来的消息
    document.addEventListener('message', handleRNMessage);
    window.addEventListener('message', handleRNMessage);

    function handleRNMessage(event) {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'loadImage') {
                loadImage(data.payload);
            } else if (data.type === 'saveImage') {
                saveImage();
            }
        } catch(e) { console.error('JSON Parse error', e); }
    }

    function loadImage(base64) {
        const img = new Image();
        img.onload = () => {
            state.width = img.width;
            state.height = img.height;
            canvas.width = state.width;
            canvas.height = state.height;
            
            // Re-init WebGL with new dimensions
            if (state.textureOriginal) gl.deleteTexture(state.textureOriginal);
            state.textureOriginal = createTexture(gl, img);
            
            const bloomScale = 0.5;
            state.fboBase = createFramebuffer(gl, state.width, state.height);
            state.fboPing = createFramebuffer(gl, state.width * bloomScale, state.height * bloomScale);
            state.fboPong = createFramebuffer(gl, state.width * bloomScale, state.height * bloomScale);
            
            document.getElementById('placeholder').classList.add('hidden');
            canvas.classList.remove('hidden');
            
            requestAnimationFrame(render);
        };
        img.src = base64;
    }

    function saveImage() {
        requestAnimationFrame(() => {
            render();
            // 获取 Base64 发回给 App
    // 稍微延迟确保缓冲区就绪
    setTimeout(() => {
        try {
            const dataURL = canvas.toDataURL('image/jpeg', 0.95);
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ 
                    type: 'saveResult', 
                    payload: dataURL 
                }));
            }
        } catch (e) {
            console.error("Canvas toDataURL failed", e);
        }
    }, 100); 
        });
    }

    // WebGL Helpers
    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return null;
        return shader;
    }
    function createProgram(gl, vsSource, fsSource) {
        const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
        const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
        const prog = gl.createProgram();
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
        return prog;
    }
    function createTexture(gl, image) {
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        if (image) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        return tex;
    }
    function createFramebuffer(gl, width, height) {
        const fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
        return { fbo, tex, width, height };
    }

    function initGL() {
        if (!gl) return;
        state.programs.copy = createProgram(gl, VS_SOURCE, FS_COPY);
        state.programs.preprocess = createProgram(gl, VS_SOURCE, FS_PREPROCESS);
        state.programs.blur = createProgram(gl, VS_SOURCE, FS_BLUR);
        state.programs.composite = createProgram(gl, VS_SOURCE, FS_COMPOSITE);
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, -1, 1, 0, 1, 1, -1, 1, 0, 1, 1, 1, 1]), gl.STATIC_DRAW);
    }

    function render() {
        if (!state.textureOriginal) return;
        gl.viewport(0, 0, state.width, state.height);
        
        // 1. Preprocess
        gl.useProgram(state.programs.preprocess);
        gl.bindFramebuffer(gl.FRAMEBUFFER, state.fboBase.fbo);
        bindUniformsPreprocess();
        bindQuad(state.programs.preprocess);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, state.textureOriginal);
        gl.uniform1i(gl.getUniformLocation(state.programs.preprocess, "u_image"), 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // 2. Bloom Blur
        const radius = parseInt(document.getElementById('bloomRadius').value) / 20; 
        const iterations = Math.max(2, Math.floor(radius)); 
        
        gl.useProgram(state.programs.blur);
        bindQuad(state.programs.blur);
        
        // First blur pass
        gl.bindFramebuffer(gl.FRAMEBUFFER, state.fboPing.fbo);
        gl.viewport(0, 0, state.fboPing.width, state.fboPing.height);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, state.fboBase.tex);
        gl.uniform1i(gl.getUniformLocation(state.programs.blur, "u_image"), 0);
        
        gl.uniform2f(gl.getUniformLocation(state.programs.blur, "u_resolution"), state.fboPing.width, state.fboPing.height);
        gl.uniform2f(gl.getUniformLocation(state.programs.blur, "u_direction"), 1.0, 0.0);
        gl.uniform1i(gl.getUniformLocation(state.programs.blur, "u_isFirstPass"), 1);
        gl.uniform1f(gl.getUniformLocation(state.programs.blur, "u_bloomThresh"), parseInt(document.getElementById('bloomThreshold').value) / 100);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        let currFBO = state.fboPing; 
        let nextFBO = state.fboPong;
        const uDir = gl.getUniformLocation(state.programs.blur, "u_direction");
        const uFirst = gl.getUniformLocation(state.programs.blur, "u_isFirstPass");

        for (let i = 0; i < iterations; i++) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, nextFBO.fbo);
            gl.bindTexture(gl.TEXTURE_2D, currFBO.tex);
            gl.uniform2f(uDir, 0.0, 1.0);
            gl.uniform1i(uFirst, 0); 
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            let temp = currFBO; currFBO = nextFBO; nextFBO = temp;

            gl.bindFramebuffer(gl.FRAMEBUFFER, nextFBO.fbo);
            gl.bindTexture(gl.TEXTURE_2D, currFBO.tex);
            gl.uniform2f(uDir, 1.0, 0.0);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            temp = currFBO; currFBO = nextFBO; nextFBO = temp;
        }

        // 3. Composite
        gl.bindFramebuffer(gl.FRAMEBUFFER, null); 
        gl.viewport(0, 0, state.width, state.height);
        gl.useProgram(state.programs.composite);
        bindQuad(state.programs.composite);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, state.fboBase.tex);
        gl.uniform1i(gl.getUniformLocation(state.programs.composite, "u_base"), 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, currFBO.tex);
        gl.uniform1i(gl.getUniformLocation(state.programs.composite, "u_bloom"), 1);
        
        gl.uniform1f(gl.getUniformLocation(state.programs.composite, "u_bloomStrength"), document.getElementById('bloomStrength').value / 100);
        gl.uniform1f(gl.getUniformLocation(state.programs.composite, "u_grain"), document.getElementById('grain').value / 100);
        gl.uniform1f(gl.getUniformLocation(state.programs.composite, "u_vignette"), document.getElementById('vignette').value / 100);
        gl.uniform1f(gl.getUniformLocation(state.programs.composite, "u_aberration"), document.getElementById('aberration').value / 100);
        gl.uniform1f(gl.getUniformLocation(state.programs.composite, "u_time"), Date.now() / 1000);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    function bindQuad(prog) {
        const posLoc = gl.getAttribLocation(prog, "a_position");
        const texLoc = gl.getAttribLocation(prog, "a_texCoord");
        gl.enableVertexAttribArray(posLoc);
        gl.enableVertexAttribArray(texLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 16, 0);
        gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 16, 8);
    }

    function bindUniformsPreprocess() {
        const p = state.programs.preprocess;
        const getVal = (id) => parseInt(document.getElementById(id).value);
        gl.uniform1f(gl.getUniformLocation(p, "u_exposure"), getVal('exposure')/100);
        gl.uniform1f(gl.getUniformLocation(p, "u_contrast"), getVal('contrast')/100);
        gl.uniform1f(gl.getUniformLocation(p, "u_saturation"), getVal('saturation')/100);
        gl.uniform1f(gl.getUniformLocation(p, "u_temp"), getVal('temperature')/50);
        // highs/shadows 暂时不用，或者你可以在 html 添加对应滑块
        gl.uniform1f(gl.getUniformLocation(p, "u_highs"), getVal('highlights') / 100);
        gl.uniform1f(gl.getUniformLocation(p, "u_shadows"), getVal('shadows') / 100);
        gl.uniform1f(gl.getUniformLocation(p, "u_bloomThresh"), getVal('bloomThreshold')/100);
    }

    const inputs = ['bloomStrength','bloomThreshold','bloomRadius','grain','vignette','aberration','temperature','exposure','contrast','saturation','highlights','shadows'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        const disp = document.getElementById(id + 'Val');
        el.addEventListener('input', (e) => {
            if(disp) {
                let val = e.target.value;
                if(id === 'bloomThreshold') val = (val/100).toFixed(2);
                if(id === 'bloomStrength') val = (val/100).toFixed(1);
                else if(['exposure','contrast','saturation','highlights','shadows'].includes(id)) val = (val / 100).toFixed(1);
                else val = val;
                disp.textContent = val;
            }
            requestAnimationFrame(render);
        });
    });

    initGL();
</script>
</body>
</html>
`;
