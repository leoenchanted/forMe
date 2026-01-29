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
        .section-title { color: #00f2ff; font-size: 12px; font-weight: bold; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; text-transform: uppercase; letter-spacing: 1px; }
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

    <!-- 控制面板 -->
    <div class="controls-panel">
        
        <!-- 1. Soft Glow (Ultra Algorithm) -->
        <div class="section-title"><i class="fas fa-cloud-sun"></i> Soft Glow</div>
        <div class="control-group">
            <div class="control-label"><span>Intensity</span><span id="softGlowIntensityVal">50</span></div>
            <input type="range" id="softGlowIntensity" min="0" max="100" value="50" step="1">
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
    // --- Vertex Shader (shared) ---
    const VS_SOURCE = \`
        attribute vec2 a_position;
        attribute vec2 a_texCoord;
        varying vec2 v_texCoord;
        void main() {
            gl_Position = vec4(a_position, 0, 1);
            v_texCoord = a_texCoord;
        }
    \`;

    // --- Preprocess Shader (Color Grading) ---
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

        vec3 applyContrast(vec3 color, float contrast) {
            float c = contrast * 0.5;
            color = clamp(color, 0.0, 1.0);
            color = color - 0.5;
            color = color * (1.0 + c) / (1.0 + abs(color) * c);
            color = color + 0.5;
            return clamp(color, 0.0, 1.0);
        }
        
        vec3 applyTemperature(vec3 color, float temp) {
            float t = clamp(temp, -1.0, 1.0);
            vec3 warm = vec3(1.06, 1.01, 0.96);
            vec3 cool = vec3(0.96, 1.01, 1.06);
            vec3 balance = mix(cool, warm, t * 0.5 + 0.5);
            return clamp(color * balance, 0.0, 1.0);
        }
        
        vec3 adjustShadows(vec3 color, float amount) {
            amount = clamp(amount, 0.0, 1.0);
            float lum = dot(color, vec3(0.299, 0.587, 0.114));
            float mask = 1.0 - smoothstep(0.0, 0.25, lum);
            float targetLum = mix(lum, 0.2, amount * mask);
            float delta = targetLum - lum;
            return clamp(color + delta, 0.0, 1.0);
        }
        
        vec3 adjustHighlights(vec3 color, float amount) {
            float lum = dot(color, vec3(0.299, 0.587, 0.114));
            float mask = smoothstep(0.6, 1.0, lum);
            float compressed = mix(lum, 1.0 - exp(-lum * 4.0), amount * mask);
            return color * (compressed / max(lum, 0.001));
        }
        
        vec3 adjustColor(vec3 color) {
            color = color * pow(2.0, u_exposure);
            color = applyContrast(color, u_contrast);
            float gray = dot(color, vec3(0.299, 0.587, 0.114));
            color = mix(vec3(gray), color, u_saturation + 1.0);
            color = applyTemperature(color, u_temp);
            color = adjustShadows(color, u_shadows);
            color = adjustHighlights(color, u_highs);
            return clamp(color, 0.0, 1.0);
        }
        
        void main() {
            vec4 texColor = texture2D(u_image, v_texCoord);
            vec3 color = adjustColor(texColor.rgb);
            gl_FragColor = vec4(color, 1.0);
        }
    \`;

    // --- ULTRA SOFT GLOW SHADER (Original Algorithm, Full Quality) ---
    const FS_SOFT_GLOW = \`
        precision highp float;

        uniform sampler2D u_image;
        uniform vec2 u_resolution;
        uniform float u_glowAmount; // 0.0 to 1.0

        varying vec2 v_texCoord;

        float random(vec3 scale, float seed) {
            return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
        }

        vec3 blendScreen(vec3 base, vec3 blend) {
            return 1.0 - ((1.0 - base) * (1.0 - blend));
        }

        void main() {
            vec4 originalColor = texture2D(u_image, v_texCoord);
            
            vec3 blurColor = vec3(0.0);
            float totalWeight = 0.0;
            float offset = (u_glowAmount * 4.0 + 1.0) / min(u_resolution.x, u_resolution.y); 
            const float directions = 16.0;
            const float quality = 4.0; 
            const float pi = 3.14159265359;
            float dither = random(vec3(12.9898, 78.233, 151.7182), 0.0);

            for(float d = 0.0; d < pi * 2.0; d += pi * 2.0 / directions) {
                for(float i = 1.0; i <= quality; i++) {
                    float r = i / quality + (dither * 0.1 / quality);
                    vec2 uvOffset = vec2(cos(d), sin(d)) * offset * r * 5.0;
                    vec3 sampleC = texture2D(u_image, v_texCoord + uvOffset).rgb;
                    float luma = dot(sampleC, vec3(0.299, 0.587, 0.114));
                    float weight = 1.0 + (luma * 1.5);
                    blurColor += sampleC * weight;
                    totalWeight += weight;
                }
            }
            blurColor /= totalWeight;
            
            vec3 gray = vec3(dot(blurColor, vec3(0.2126, 0.7152, 0.0722)));
            blurColor = mix(gray, blurColor, 1.3);
            vec3 glow = blendScreen(originalColor.rgb, blurColor);
            float mixFactor = smoothstep(0.0, 1.0, u_glowAmount * 0.8 + 0.1);
            vec3 finalColor = mix(originalColor.rgb, glow, mixFactor);
            finalColor = finalColor - 0.02;
            finalColor = (finalColor - 0.5) * 1.05 + 0.5;
            
            gl_FragColor = vec4(finalColor, originalColor.a);
        }
    \`;

    // --- Core State & GL Context ---
    const canvas = document.getElementById('glCanvas');
    const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true, alpha: false }); 
    const state = {
        textureOriginal: null,
        fboPreprocessed: null,
        width: 0, height: 0,
        programs: {}
    };

    // Message handling for React Native
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
            
            if (state.textureOriginal) gl.deleteTexture(state.textureOriginal);
            state.textureOriginal = createTexture(gl, img);
            
            // Only one FBO needed: for preprocessed image
            if (state.fboPreprocessed) {
                gl.deleteFramebuffer(state.fboPreprocessed.fbo);
                gl.deleteTexture(state.fboPreprocessed.tex);
            }
            state.fboPreprocessed = createFramebuffer(gl, state.width, state.height);
            
            document.getElementById('placeholder').classList.add('hidden');
            canvas.classList.remove('hidden');
            
            requestAnimationFrame(render);
        };
        img.src = base64;
    }

    function saveImage() {
        requestAnimationFrame(() => {
            render();
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
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    }
    function createProgram(gl, vsSource, fsSource) {
        const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
        const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
        const prog = gl.createProgram();
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            console.error(gl.getProgramInfoLog(prog));
        }
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
        state.programs.preprocess = createProgram(gl, VS_SOURCE, FS_PREPROCESS);
        state.programs.softGlow = createProgram(gl, VS_SOURCE, FS_SOFT_GLOW);
        
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1, 0, 0,
             1, -1, 1, 0,
            -1,  1, 0, 1,
            -1,  1, 0, 1,
             1, -1, 1, 0,
             1,  1, 1, 1
        ]), gl.STATIC_DRAW);
    }

    function render() {
        if (!state.textureOriginal) return;
        gl.viewport(0, 0, state.width, state.height);
        
        // Step 1: Preprocess (Color Grading)
        gl.useProgram(state.programs.preprocess);
        gl.bindFramebuffer(gl.FRAMEBUFFER, state.fboPreprocessed.fbo);
        bindUniformsPreprocess();
        bindQuad(state.programs.preprocess);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, state.textureOriginal);
        gl.uniform1i(gl.getUniformLocation(state.programs.preprocess, "u_image"), 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // Step 2: Apply Ultra Soft Glow
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.useProgram(state.programs.softGlow);
        bindQuad(state.programs.softGlow);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, state.fboPreprocessed.tex);
        gl.uniform1i(gl.getUniformLocation(state.programs.softGlow, "u_image"), 0);
        gl.uniform2f(gl.getUniformLocation(state.programs.softGlow, "u_resolution"), state.width, state.height);
        gl.uniform1f(gl.getUniformLocation(state.programs.softGlow, "u_glowAmount"), 
                     document.getElementById('softGlowIntensity').value / 100.0);
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
        gl.uniform1f(gl.getUniformLocation(p, "u_exposure"), getVal('exposure') / 100);
        gl.uniform1f(gl.getUniformLocation(p, "u_contrast"), getVal('contrast') / 100);
        gl.uniform1f(gl.getUniformLocation(p, "u_saturation"), getVal('saturation') / 100);
        gl.uniform1f(gl.getUniformLocation(p, "u_temp"), getVal('temperature') / 50);
        gl.uniform1f(gl.getUniformLocation(p, "u_highs"), getVal('highlights') / 100);
        gl.uniform1f(gl.getUniformLocation(p, "u_shadows"), getVal('shadows') / 100);
    }

    // UI Event Listeners
    const toneInputs = ['exposure','contrast','saturation','highlights','shadows'];
    toneInputs.forEach(id => {
        document.getElementById(id).addEventListener('input', (e) => {
            const val = (parseInt(e.target.value) / 100).toFixed(1);
            document.getElementById(id + 'Val').textContent = val;
            requestAnimationFrame(render);
        });
    });

    const filmInputs = ['grain','vignette','aberration'];
    filmInputs.forEach(id => {
        document.getElementById(id).addEventListener('input', (e) => {
            document.getElementById(id + 'Val').textContent = e.target.value;
            requestAnimationFrame(render);
        });
    });

    document.getElementById('temperature').addEventListener('input', (e) => {
        document.getElementById('temperatureVal').textContent = (parseInt(e.target.value) / 50).toFixed(1);
        requestAnimationFrame(render);
    });

    // Soft Glow Intensity
    document.getElementById('softGlowIntensity').addEventListener('input', (e) => {
        document.getElementById('softGlowIntensityVal').textContent = e.target.value;
        requestAnimationFrame(render);
    });

    initGL();
</script>
</body>
</html>
`;