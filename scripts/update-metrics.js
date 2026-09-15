const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ORG = process.env.GITHUB_ORG || 'shworks-25';
const TOKEN = process.env.GITHUB_TOKEN;
const API = 'https://api.github.com';
const outputPath = path.resolve(__dirname, '..', 'profile', 'metrics.svg');

const headers = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': `${ORG}-engineering-metrics`,
};

if (TOKEN) {
  headers.Authorization = `Bearer ${TOKEN}`;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function api(pathUrl) {
  const response = await fetch(`${API}${pathUrl}`, { headers });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${pathUrl}: ${text}`);
  }
  return response.json();
}

async function paged(pathUrl) {
  const all = [];
  for (let page = 1; ; page += 1) {
    const separator = pathUrl.includes('?') ? '&' : '?';
    const batch = await api(`${pathUrl}${separator}per_page=100&page=${page}`);
    if (!Array.isArray(batch)) return all;
    all.push(...batch);
    if (batch.length < 100) return all;
  }
}

/**
 * 动态拉取指定仓库的真实提交历史 (精准支持 since 参数，支持排除 merge commits)
 */
async function fetchRepoCommits(repoName, sinceIso) {
  const allCommits = [];
  for (let page = 1; ; page += 1) {
    try {
      const url = `/repos/${ORG}/${encodeURIComponent(repoName)}/commits?since=${sinceIso}&per_page=100&page=${page}`;
      const commits = await api(url);
      if (!Array.isArray(commits) || commits.length === 0) break;
      allCommits.push(...commits);
      if (commits.length < 100) break;
    } catch (err) {
      console.warn(`[Metrics] Note for repo ${repoName}: ${err.message}`);
      break;
    }
  }
  return allCommits;
}

/**
 * 本地 Git 动态读取模式 (作为无外网或本地多仓聚合的备选方案)
 */
function fetchLocalCommits() {
  const counts = new Map();
  try {
    const output = execSync('git log --since="365 days ago" --no-merges --format="%ad" --date=short', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    const lines = output.trim().split('\n').filter(Boolean);
    for (const date of lines) {
      counts.set(date, (counts.get(date) || 0) + 1);
    }
  } catch (err) {
    console.warn('[Metrics] Local git log reading skipped:', err.message);
  }
  return counts;
}

function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function streaks(days) {
  let current = 0;
  let longest = 0;
  let run = 0;
  for (const count of days) {
    if (count > 0) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 0;
    }
  }
  for (let i = days.length - 1; i >= 0 && days[i] > 0; i -= 1) current += 1;
  return { current, longest };
}

function level(count, max) {
  if (!count) return 0;
  if (!max || max <= 4) {
    if (count <= 1) return 1;
    if (count <= 2) return 2;
    if (count <= 4) return 3;
    return 4;
  }
  const ratio = count / max;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

function renderSvg({ days, dates, totalCommits, activeDays, totalRepos, totalStars, current, longest, max, isDynamic }) {
  const now = new Date();
  const width = 980;
  const height = 390;
  const cell = 11.5;
  const gap = 3.5;
  const gridX = 72;
  const gridY = 246;

  const firstDow = dates[0].getUTCDay();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const months = [];
  let lastMonth = -1;
  let lastCol = -10;

  const cells = days.map((count, i) => {
    const slot = firstDow + i;
    const col = Math.floor(slot / 7);
    const row = slot % 7;
    const x = gridX + col * (cell + gap);
    const y = gridY + row * (cell + gap);
    const date = dates[i].toISOString().slice(0, 10);
    const curMonth = dates[i].getUTCMonth();

    if (curMonth !== lastMonth && col - lastCol >= 3 && col <= 49) {
      months.push({ text: monthNames[curMonth], x });
      lastMonth = curMonth;
      lastCol = col;
    }

    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${cell}" height="${cell}" rx="2.5" class="l${level(count, max)}"><title>${date}: ${count} commit${count === 1 ? '' : 's'}</title></rect>`;
  }).join('');

  const monthSvg = months.map(m =>
    `<text x="${m.x.toFixed(1)}" y="${gridY - 9}" class="month">${m.text}</text>`
  ).join('');

  const cards = [
    ['COMMITS · 365D', totalCommits.toLocaleString('en-US')],
    ['ACTIVE DAYS', `${activeDays.toLocaleString('en-US')} / 365`],
    ['REPOSITORIES', totalRepos.toLocaleString('en-US')],
    ['STARS', totalStars.toLocaleString('en-US')],
    ['CURRENT STREAK', `${current}d`],
    ['LONGEST STREAK', `${longest}d`],
  ];

  const cardWidth = 138;
  const cardGap = 10;
  const cardsX = 50;
  const cardSvg = cards.map(([label, value], i) => {
    const x = cardsX + i * (cardWidth + cardGap);
    return `<g transform="translate(${x} 102)">
      <rect width="${cardWidth}" height="82" rx="12" class="card"/>
      <text x="14" y="28" class="label">${esc(label)}</text>
      <text x="14" y="60" class="value">${esc(value)}</text>
    </g>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="SHWORKS engineering activity for the last 365 days">
  <defs>
    <!-- 流光外边框渐变 -->
    <linearGradient id="metricBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B" stop-opacity="0.6" />
      <stop offset="45%" stop-color="#38BDF8" stop-opacity="0.35" />
      <stop offset="100%" stop-color="#00D2FF" stop-opacity="0.5" />
    </linearGradient>

    <!-- 卡片背景微渐变 -->
    <linearGradient id="metricCardBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#15213D" stop-opacity="0.7" />
    </linearGradient>

    <!-- 顶部标题金色渐变 -->
    <linearGradient id="metricTitleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="50%" stop-color="#FDE68A" />
      <stop offset="100%" stop-color="#F59E0B" />
    </linearGradient>
  </defs>

  <style>
    .bg { fill: #070B16; }
    .border { fill: none; stroke: url(#metricBorderGrad); stroke-width: 1.5; }
    .title { fill: url(#metricTitleGrad); font: 700 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'SF Pro Display', Roboto, sans-serif; letter-spacing: 0.5px; }
    .sub { fill: #94A3B8; font: 12.5px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .card { fill: url(#metricCardBg); stroke: #1E293B; stroke-width: 1; }
    .label { fill: #7DD3FC; font: 600 9.5px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; letter-spacing: 0.8px; }
    .value { fill: #F8FAFC; font: 700 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'SF Pro Display', Roboto, sans-serif; }
    .section { fill: #FBBF24; font: 700 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; letter-spacing: 1.2px; }
    .month { fill: #64748B; font: 500 10.5px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .day { fill: #64748B; font: 500 10px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .foot { fill: #64748B; font: 10px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }

    /* 热力图方块色彩层级 (暗空蓝黑底色 + 赛博绿洲翡翠) */
    .l0 { fill: #111A2E; stroke: #1E293B; stroke-width: 0.5; }
    .l1 { fill: #064E3B; }
    .l2 { fill: #047857; }
    .l3 { fill: #10B981; }
    .l4 { fill: #34D399; }

    @media (prefers-color-scheme: light) {
      .bg { fill: #FFFFFF; }
      .border { stroke: #CBD5E1; }
      .title { fill: #B45309; }
      .value { fill: #0F172A; }
      .sub, .day, .foot, .month { fill: #64748B; }
      .card { fill: #F8FAFC; stroke: #E2E8F0; }
      .label { fill: #0284C7; }
      .section { fill: #B45309; }
      .l0 { fill: #F1F5F9; stroke: #E2E8F0; }
      .l1 { fill: #A7F3D0; }
      .l2 { fill: #34D399; }
      .l3 { fill: #059669; }
      .l4 { fill: #065F46; }
    }
  </style>

  <!-- 背景底板与主边框 -->
  <rect class="bg" width="100%" height="100%" rx="18"/>
  <rect class="border" x="0.75" y="0.75" width="978.5" height="388.5" rx="17.25"/>

  <!-- 头部信息 -->
  <text x="50" y="48" class="title">SHWORKS · Engineering Pulse</text>
  <text x="50" y="74" class="sub">Dynamic telemetry &amp; code delivery · rolling 365 days · updated ${esc(now.toISOString().slice(0, 10))} UTC</text>

  <!-- 6 张统计指标卡片 -->
  ${cardSvg}

  <!-- 热力图标题与图例 -->
  <g transform="translate(50, 218)">
    <text x="0" y="0" class="section">365-DAY CODE COMMIT DENSITY</text>
    <g transform="translate(730, -11)">
      <text x="0" y="10" class="day">Less</text>
      <rect x="30" y="1" width="10.5" height="10.5" rx="2" class="l0" />
      <rect x="44" y="1" width="10.5" height="10.5" rx="2" class="l1" />
      <rect x="58" y="1" width="10.5" height="10.5" rx="2" class="l2" />
      <rect x="72" y="1" width="10.5" height="10.5" rx="2" class="l3" />
      <rect x="86" y="1" width="10.5" height="10.5" rx="2" class="l4" />
      <text x="102" y="10" class="day">More</text>
    </g>
  </g>

  <!-- 月份轴标 -->
  ${monthSvg}

  <!-- 星期纵坐标 (Mon, Wed, Fri) -->
  <text x="44" y="271" class="day">Mon</text>
  <text x="44" y="301" class="day">Wed</text>
  <text x="44" y="331" class="day">Fri</text>

  <!-- 热力图方格矩阵 (365天动态映射) -->
  <g id="heatmap-cells">
    ${cells}
  </g>

  <!-- 底部注脚信息 -->
  <text x="50" y="367" class="foot">GitHub API dynamic telemetry · merge commits excluded · organization: ${esc(ORG)}</text>
</svg>
`;
}

async function main() {
  console.log(`[Metrics] Dynamically fetching commit activity for organization: ${ORG}...`);

  const now = new Date();
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 364);
  const sinceIso = start.toISOString();

  const counts = new Map();
  let repos = [];
  let totalStars = 0;
  let isDynamic = true;

  try {
    // 1. 动态获取组织公开仓库
    repos = (await paged(`/orgs/${ORG}/repos?type=public&sort=updated`))
      .filter((repo) => !repo.archived);
    console.log(`[Metrics] Discovered ${repos.length} active public repositories.`);

    // 2. 遍历每个仓库拉取过去 365 天内的真实 commits
    for (const repo of repos) {
      totalStars += repo.stargazers_count || 0;
      console.log(`[Metrics] Dynamically reading commits from: ${repo.name}...`);
      const commits = await fetchRepoCommits(repo.name, sinceIso);

      let repoCommitCount = 0;
      for (const item of commits) {
        // 排除 Merge Commits
        if (item.parents && item.parents.length > 1) continue;

        const dateStr = (item.commit?.committer?.date || item.commit?.author?.date || '').slice(0, 10);
        if (dateStr) {
          counts.set(dateStr, (counts.get(dateStr) || 0) + 1);
          repoCommitCount += 1;
        }
      }
      console.log(`[Metrics] ${repo.name}: ${repoCommitCount} non-merge commits recorded.`);
    }
  } catch (err) {
    console.warn(`[Metrics] Remote API query failed (${err.message}). Falling back to local git history.`);
    isDynamic = false;
    const localCounts = fetchLocalCommits();
    for (const [k, v] of localCounts.entries()) {
      counts.set(k, (counts.get(k) || 0) + v);
    }
  }

  // 3. 构建过去 365 天的时间序列矩阵
  const dates = [];
  const days = [];
  for (let i = 0; i < 365; i += 1) {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + i);
    const key = date.toISOString().slice(0, 10);
    dates.push(date);
    days.push(counts.get(key) || 0);
  }

  const totalCommits = days.reduce((a, b) => a + b, 0);
  const activeDays = days.filter(Boolean).length;
  const { current, longest } = streaks(days);
  const max = Math.max(...days, 0);

  console.log(`[Metrics] Summary: Total Commits: ${totalCommits}, Active Days: ${activeDays}, Streak: ${current}d, Max Daily: ${max}`);

  // 4. 渲染 SVG
  const svg = renderSvg({
    days,
    dates,
    totalCommits,
    activeDays,
    totalRepos: repos.length || 1,
    totalStars,
    current,
    longest,
    max,
    isDynamic,
  });

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, svg.trim());
  console.log(`[Metrics] Successfully generated dynamic commit density heatmap at: ${outputPath}`);
}

main().catch((error) => {
  console.error('[Metrics] Execution error:', error);
  process.exit(1);
});
