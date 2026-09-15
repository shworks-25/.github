const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const logoPath = path.join(rootDir, 'profile', 'logo.png');
const outputPath = path.join(rootDir, 'profile', 'banner.svg');

// 读取 logo 为 base64
const logoBuffer = fs.readFileSync(logoPath);
const logoBase64 = `data:image/jpeg;base64,${logoBuffer.toString('base64')}`;

// 星空坐标定义
const starCoords = [
  { x: 380, y: 55, r: 1.2, o: 0.8 },
  { x: 420, y: 110, r: 0.8, o: 0.5 },
  { x: 490, y: 45, r: 1.5, o: 0.9, cross: true },
  { x: 560, y: 90, r: 1.0, o: 0.6 },
  { x: 620, y: 35, r: 0.9, o: 0.7 },
  { x: 710, y: 80, r: 1.4, o: 0.85, cross: true },
  { x: 780, y: 40, r: 0.8, o: 0.4 },
  { x: 860, y: 95, r: 1.2, o: 0.75 },
  { x: 940, y: 50, r: 1.0, o: 0.6 },
  { x: 1020, y: 75, r: 1.6, o: 0.9, cross: true },
  { x: 1100, y: 35, r: 0.8, o: 0.5 },
  { x: 1180, y: 65, r: 1.2, o: 0.8 },
  { x: 1220, y: 120, r: 0.9, o: 0.6 },
  { x: 450, y: 360, r: 1.0, o: 0.5 },
  { x: 540, y: 380, r: 1.2, o: 0.7 },
  { x: 630, y: 350, r: 0.8, o: 0.4 },
  { x: 740, y: 375, r: 1.5, o: 0.85 },
  { x: 890, y: 360, r: 0.9, o: 0.6 },
  { x: 1050, y: 380, r: 1.2, o: 0.7 },
  { x: 1190, y: 350, r: 1.4, o: 0.8, cross: true },
  { x: 90, y: 45, r: 1.1, o: 0.6 },
  { x: 140, y: 80, r: 0.8, o: 0.5 },
  { x: 70, y: 370, r: 1.0, o: 0.5 },
  { x: 120, y: 395, r: 1.3, o: 0.7 },
];

let starsSvg = '';
for (const s of starCoords) {
  starsSvg += `<circle cx="${s.x}" cy="${s.y}" r="${s.r}" fill="#FFFFFF" opacity="${s.o}" />\n`;
  if (s.cross) {
    starsSvg += `
    <g transform="translate(${s.x}, ${s.y})" opacity="${s.o}">
      <line x1="-7" y1="0" x2="7" y2="0" stroke="#FFD13B" stroke-width="0.75" />
      <line x1="0" y1="-7" x2="0" y2="7" stroke="#FFD13B" stroke-width="0.75" />
      <circle cx="0" cy="0" r="1.5" fill="#FFFBEB" filter="url(#goldSmallGlow)" />
    </g>`;
  }
}

// 赛博电路走线定义
const circuitsSvg = `
  <!-- 电路走线 - 青蓝光系 -->
  <g stroke="#00D2FF" stroke-width="1.2" fill="none" opacity="0.65" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="370,160 410,160 435,135 490,135" />
    <circle cx="490" cy="135" r="2.5" fill="#00D2FF" />

    <polyline points="380,210 430,210 460,240 520,240" />
    <circle cx="520" cy="240" r="2.5" fill="#00D2FF" />

    <polyline points="370,260 410,260 440,290 500,290 520,310 560,310" />
    <circle cx="560" cy="310" r="2.5" fill="#00D2FF" />

    <polyline points="1060,140 1100,140 1130,170 1190,170" />
    <circle cx="1060" cy="140" r="2" fill="#00D2FF" />
    <circle cx="1190" cy="170" r="2.5" fill="#00D2FF" />

    <polyline points="1120,280 1160,280 1185,255 1230,255" />
    <circle cx="1120" cy="280" r="2" fill="#00D2FF" />
    <circle cx="1230" cy="255" r="2.5" fill="#00D2FF" />
  </g>

  <!-- 电路走线 - 金沙光系 -->
  <g stroke="#F59E0B" stroke-width="1.2" fill="none" opacity="0.55" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="360,185 395,185 415,165 460,165" />
    <circle cx="460" cy="165" r="2.5" fill="#FFD13B" />

    <polyline points="365,235 405,235 425,255 475,255" />
    <circle cx="475" cy="255" r="2.5" fill="#FFD13B" />

    <polyline points="980,90 1020,90 1045,65 1090,65" />
    <circle cx="1090" cy="65" r="2.5" fill="#FFD13B" />

    <polyline points="920,330 960,330 985,355 1040,355" />
    <circle cx="1040" cy="355" r="2.5" fill="#FFD13B" />
  </g>
`;

const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1280" height="420" viewBox="0 0 1280 420" fill="none">
  <defs>
    <!-- 背景深邃渐变 -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#050811" />
      <stop offset="35%" stop-color="#080E1C" />
      <stop offset="70%" stop-color="#0B152B" />
      <stop offset="100%" stop-color="#060A14" />
    </linearGradient>

    <!-- 金色主光渐变 -->
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFBEB" />
      <stop offset="25%" stop-color="#FDE68A" />
      <stop offset="55%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>

    <!-- 赛博天蓝渐变 -->
    <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#E0F2FE" />
      <stop offset="40%" stop-color="#38BDF8" />
      <stop offset="100%" stop-color="#00D2FF" />
    </linearGradient>

    <!-- 文字金属金白渐变 -->
    <linearGradient id="titleGoldGrad" x1="0%" y1="0%" x2="70%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="30%" stop-color="#FFF3C4" />
      <stop offset="65%" stop-color="#FBBF24" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>

    <!-- 边框流光渐变 -->
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B" stop-opacity="0.6" />
      <stop offset="35%" stop-color="#38BDF8" stop-opacity="0.35" />
      <stop offset="70%" stop-color="#00D2FF" stop-opacity="0.5" />
      <stop offset="100%" stop-color="#F59E0B" stop-opacity="0.3" />
    </linearGradient>

    <!-- 胶囊微发光背景渐变 -->
    <linearGradient id="badgeBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A" stop-opacity="0.85" />
      <stop offset="100%" stop-color="#1E293B" stop-opacity="0.65" />
    </linearGradient>

    <!-- 高斯模糊滤镜 -->
    <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <filter id="cyanGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <filter id="goldSmallGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" />
    </filter>

    <filter id="ambientGold" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="70" />
    </filter>

    <filter id="ambientCyan" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="80" />
    </filter>

    <!-- 科技网格点阵 -->
    <pattern id="gridDots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
      <circle cx="14" cy="14" r="1.1" fill="#38BDF8" opacity="0.14" />
    </pattern>

    <!-- Logo圆形切片 -->
    <clipPath id="logoCircle">
      <circle cx="210" cy="210" r="142" />
    </clipPath>
  </defs>

  <!-- 整体主卡片与边框 -->
  <rect width="1280" height="420" rx="24" fill="url(#bgGrad)" />
  <rect width="1280" height="420" rx="24" fill="url(#gridDots)" />

  <!-- 环境漫射光晕 (Ambient Glows) -->
  <!-- 左下角沙金色光晕 -->
  <ellipse cx="220" cy="240" rx="200" ry="160" fill="#F59E0B" opacity="0.18" filter="url(#ambientGold)" />
  <!-- 右上角赛博天蓝色光晕 -->
  <ellipse cx="1080" cy="120" rx="260" ry="180" fill="#00D2FF" opacity="0.16" filter="url(#ambientCyan)" />
  <!-- 中间微弱金绿流光 -->
  <ellipse cx="720" cy="210" rx="280" ry="120" fill="#059669" opacity="0.08" filter="url(#ambientGold)" />

  <!-- 星空背景与高光星辰 -->
  ${starsSvg}

  <!-- 赛博电路纹理与节点 -->
  ${circuitsSvg}

  <!-- ==================== 左侧：品牌标志与共振流光环 ==================== -->
  <g id="brand-emblem">
    <!-- 外层雷达刻度光环 -->
    <circle cx="210" cy="210" r="168" stroke="#38BDF8" stroke-width="1.2" stroke-dasharray="3 9" opacity="0.4" />
    <circle cx="210" cy="210" r="182" stroke="#F59E0B" stroke-width="1" stroke-dasharray="14 36" opacity="0.45" />

    <!-- 几何准星装饰点 -->
    <line x1="210" y1="18" x2="210" y2="34" stroke="#00D2FF" stroke-width="2" opacity="0.8" />
    <line x1="210" y1="386" x2="210" y2="402" stroke="#00D2FF" stroke-width="2" opacity="0.8" />
    <line x1="18" y1="210" x2="34" y2="210" stroke="#F59E0B" stroke-width="2" opacity="0.8" />
    <line x1="386" y1="210" x2="402" y2="210" stroke="#F59E0B" stroke-width="2" opacity="0.8" />

    <!-- 金色主发光光环 (Glow Ring) -->
    <circle cx="210" cy="210" r="150" stroke="url(#goldGrad)" stroke-width="4.5" fill="none" filter="url(#goldGlow)" opacity="0.85" />
    <!-- 赛博青蓝内衬环 -->
    <circle cx="210" cy="210" r="144" stroke="#00D2FF" stroke-width="1.5" fill="none" opacity="0.75" />

    <!-- 核心圆形 Logo 呈现 -->
    <image xlink:href="${logoBase64}" x="68" y="68" width="284" height="284" clip-path="url(#logoCircle)" preserveAspectRatio="xMidYMid slice" />

    <!-- Logo 前景玻璃高光弧度 (Subtle Glass Sheen) -->
    <ellipse cx="210" cy="115" rx="105" ry="38" fill="#FFFFFF" opacity="0.08" clip-path="url(#logoCircle)" />
  </g>

  <!-- ==================== 右侧：品牌信息与排版矩阵 ==================== -->
  <g id="brand-content" transform="translate(420, 0)">

    <!-- 顶部状态栏小标 (Top Tag) -->
    <g transform="translate(0, 72)">
      <rect width="268" height="26" rx="13" fill="#131C31" stroke="#38BDF8" stroke-width="1" stroke-opacity="0.4" />
      <circle cx="14" cy="13" r="4.5" fill="#F59E0B" filter="url(#goldSmallGlow)" />
      <circle cx="14" cy="13" r="2.5" fill="#FFFBEB" />
      <text x="28" y="17" fill="#38BDF8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', 'SF Pro Display', Roboto, sans-serif" font-size="11" font-weight="700" letter-spacing="1.5">SHWORKS · ENGINEERING LAB</text>
    </g>

    <!-- 品牌大主标题 (Brand Name) -->
    <text x="0" y="152" fill="url(#titleGoldGrad)" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', 'SF Pro Display', Roboto, sans-serif" font-size="58" font-weight="900" letter-spacing="3.5">
      SHWORKS
    </text>

    <!-- 品牌口号 (Slogan) -->
    <text x="2" y="192" fill="#E2E8F0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', 'SF Pro Display', Roboto, sans-serif" font-size="19" font-weight="500" letter-spacing="0.4">
      Engineering software that turns ideas into useful products.
    </text>

    <!-- 技术愿景补充行 -->
    <text x="2" y="222" fill="#94A3B8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', 'SF Pro Display', Roboto, sans-serif" font-size="13.5" font-weight="400" letter-spacing="0.2">
      High-Performance Developer Tools · Cyber Security &amp; Reliability · Cloud &amp; AI Workflows
    </text>

    <!-- 业务矩阵胶囊卡片组 (Feature Badges) -->
    <g id="feature-badges" transform="translate(0, 252)">
      <!-- 胶囊 1: 开发者工具 -->
      <g transform="translate(0, 0)">
        <rect width="148" height="36" rx="10" fill="url(#badgeBgGrad)" stroke="#F59E0B" stroke-width="1" stroke-opacity="0.45" />
        <text x="14" y="22" fill="#FDE68A" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12" font-weight="600">⚡ Developer Tools</text>
      </g>

      <!-- 胶囊 2: 网络安全与可靠性 (契合 logo 中的锁与电路) -->
      <g transform="translate(158, 0)">
        <rect width="180" height="36" rx="10" fill="url(#badgeBgGrad)" stroke="#00D2FF" stroke-width="1" stroke-opacity="0.45" />
        <text x="14" y="22" fill="#7DD3FC" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12" font-weight="600">🛡️ Security &amp; Systems</text>
      </g>

      <!-- 胶囊 3: AI智能体 -->
      <g transform="translate(348, 0)">
        <rect width="144" height="36" rx="10" fill="url(#badgeBgGrad)" stroke="#F59E0B" stroke-width="1" stroke-opacity="0.45" />
        <text x="14" y="22" fill="#FDE68A" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12" font-weight="600">🤖 AI &amp; Agents</text>
      </g>

      <!-- 胶囊 4: 现代 Web & 移动 -->
      <g transform="translate(502, 0)">
        <rect width="170" height="36" rx="10" fill="url(#badgeBgGrad)" stroke="#00D2FF" stroke-width="1" stroke-opacity="0.45" />
        <text x="14" y="22" fill="#7DD3FC" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12" font-weight="600">🌐 Web &amp; Mobile Apps</text>
      </g>

      <!-- 胶囊 5: 开源生态 -->
      <g transform="translate(682, 0)">
        <rect width="134" height="36" rx="10" fill="url(#badgeBgGrad)" stroke="#10B981" stroke-width="1" stroke-opacity="0.4" />
        <text x="14" y="22" fill="#6EE7B7" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12" font-weight="600">📦 Open Source</text>
      </g>
    </g>

    <!-- 底部链接与微标栏 -->
    <g transform="translate(2, 332)">
      <circle cx="6" cy="14" r="3" fill="#10B981" />
      <text x="16" y="18" fill="#CBD5E1" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12" font-weight="500">
        shworks.cn
      </text>

      <text x="106" y="18" fill="#475569" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12">|</text>

      <text x="124" y="18" fill="#94A3B8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12" font-weight="500">
        github.com/shworks-25
      </text>

      <text x="290" y="18" fill="#475569" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12">|</text>

      <text x="308" y="18" fill="#FBBF24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12" font-weight="600">
        ✦ Built with Curiosity &amp; Engineering Discipline
      </text>
    </g>
  </g>

  <!-- 全局精细流光渐变外边框 (0.75px) -->
  <rect x="0.75" y="0.75" width="1278.5" height="418.5" rx="23.25" stroke="url(#borderGrad)" stroke-width="1.5" fill="none" />
</svg>
`;

fs.writeFileSync(outputPath, svgContent.trim());
console.log(`Successfully generated banner SVG at: ${outputPath}`);
