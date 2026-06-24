# 组件代码库 · 法考速记卷宗

直接复制对应代码块到新页面里，改文字/数量即可。所有代码都假设页面 `:root` 里已经定义了 SKILL.md 中列出的配色 token，且已引入三种字体。

---

## 1. 顶部导航 `.topbar`

```html
<div class="topbar">
  <div class="crumb">法考速记卷 · <b>民法</b> · 总则编 / 诉讼时效</div>
  <div class="pager">
    <a href="index.html">🏠 首页</a>
    <a href="02-mindmap.html">下一主题 →</a>
  </div>
</div>
```

```css
.topbar{display:flex; justify-content:space-between; align-items:center; gap:16px; font-size:13px;
  color:var(--folder-2); opacity:.85; padding-bottom:14px; margin-bottom:26px;
  border-bottom:1px dashed rgba(239,228,200,.25); flex-wrap:wrap;}
.crumb b{color:var(--brass); font-weight:700;}
.pager{display:flex; gap:16px;}
.pager a{color:var(--folder); text-decoration:none; opacity:.75; border-bottom:1px solid transparent;}
.pager a:hover{opacity:1; border-color:var(--brass);}
```

---

## 2. 卷首叠纸卡 `.hero` + `.tab`

每页必备的标题区，"叠纸"靠两个旋转的 `::before/::after` 伪元素模拟。`--accent` 是这一页的主题色（刑法红/民法蓝/功能页brass）。

```html
<section class="hero">
  <div class="tab">卷 01</div>
  <h1>诉讼时效</h1>
  <div class="tags">
    <span class="subject-tag">民法典</span>
    <span class="cite-chip">§188 – §199</span>
    <span class="freq">🔥 几乎每年必考</span>
  </div>
  <p class="hero-desc">一句话说清这页要讲什么、核心抓哪几点。</p>
</section>
```

```css
.hero{position:relative; background:linear-gradient(180deg, var(--folder), var(--folder-2));
  border-radius:14px; padding:26px 28px 22px; margin-bottom:30px; box-shadow:var(--shadow); color:var(--ink);}
.hero::before,.hero::after{content:""; position:absolute; inset:0; border-radius:14px;
  background:var(--folder-2); border:1px solid var(--line); z-index:-1;}
.hero::before{transform:rotate(-1.3deg) translate(-7px,5px);}
.hero::after{transform:rotate(1.6deg) translate(9px,7px); opacity:.75;}
.tab{position:absolute; top:-16px; left:26px; background:var(--accent); color:var(--folder);
  font-family:'Noto Serif SC',serif; font-weight:900; font-size:13px; padding:5px 14px 6px;
  border-radius:6px 6px 2px 2px; letter-spacing:.08em; box-shadow:0 -2px 6px rgba(0,0,0,.18);}
.hero h1{font-family:'Noto Serif SC',serif; font-weight:900; font-size:clamp(26px,4.5vw,38px); margin:6px 0 10px;}
.hero-desc{font-size:14.5px; line-height:1.75; color:var(--ink-soft); max-width:600px;}
```

**用法提醒**：`.tab` 文字用"卷 NN"标识这是第几页；功能页（留言板/404）可以把 `.tab` 文字换成功能名（如"留言板"），`--accent` 设为 `var(--brass)`。

---

## 3. 法条引用标签 `.cite-chip` / 科目标签 `.subject-tag`

```html
<span class="subject-tag">民法典</span>
<span class="cite-chip">§188 – §199</span>
```

```css
.subject-tag{background:var(--accent); color:#fff; font-size:12px; font-weight:700;
  padding:4px 11px; border-radius:99px; letter-spacing:.05em;}
.cite-chip{font-family:'SF Mono',Consolas,'Noto Sans SC',monospace; font-size:12px;
  border:1px solid var(--ink-soft); color:var(--ink-soft); padding:3px 10px; border-radius:6px; letter-spacing:.02em;}
```

---

## 4. 高亮笔 `mark`

```html
<p>这是<mark>需要记住的关键词</mark>，其余正常排版。</p>
```

```css
mark{
  background:linear-gradient(100deg, transparent 0%, var(--brass) 6%, var(--brass) 94%, transparent 100%);
  background-size:100% 60%; background-repeat:no-repeat; background-position:0 70%;
  color:var(--ink); font-weight:700; padding:0 3px;
}
```

只用于**一句话里最关键的几个字**，不要整段加粗高亮，否则失去强调效果。

---

## 5. 印章 `.seal`（圆形）/ `.stamp-sq`（方形姓名章）

圆形印章用于"重点/易混淆/口诀"等浮动提示；方形印章用于把一个短口诀拆成单字展示（参考 05 页）。**两者都必须加 `mix-blend-mode:multiply`**。

```html
<div class="seal">易混<br>淆点</div>
```

```css
.seal{
  width:70px; height:70px; border-radius:50%; border:2.5px double var(--accent); color:var(--accent);
  display:flex; align-items:center; justify-content:center; font-family:'Ma Shan Zheng',cursive; font-size:15px;
  transform:rotate(-9deg); opacity:.88; mix-blend-mode:multiply; text-align:center; line-height:1.15;
}
```

```html
<div class="stamp-sq"><span>一</span><span>无</span></div>
```

```css
.stamp-sq{width:62px; height:62px; border:3px double var(--accent); color:var(--accent);
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  font-family:'Ma Shan Zheng',cursive; font-size:21px; line-height:1.05;
  background:rgba(0,0,0,.03); mix-blend-mode:multiply; opacity:.92;}
```

---

## 6. 网格卡片 `.card`（01 版式的最小单元）

```html
<article class="card">
  <span class="num">01</span>
  <h3><span class="ico">⏳</span>卡片标题</h3>
  <p>正文说明，<mark>关键词</mark>用高亮笔标出。</p>
  <div class="note">补充/例外说明，放在虚线分隔下面。</div>
</article>
```

```css
.grid{display:grid; grid-template-columns:repeat(3,1fr); gap:18px;}
.card{position:relative; background:var(--folder); border-radius:12px; padding:22px 20px 20px;
  box-shadow:0 8px 18px rgba(0,0,0,.28); color:var(--ink); border-top:4px solid var(--accent);}
.card .num{position:absolute; top:14px; right:16px; font-family:'Noto Serif SC',serif;
  font-size:12px; color:var(--ink-soft); opacity:.55;}
.card h3{font-family:'Noto Serif SC',serif; font-size:18px; font-weight:700; margin:0 0 12px;
  display:flex; align-items:center; gap:8px;}
.card p{font-size:13.5px; line-height:1.7; color:var(--ink-soft); margin:0 0 8px;}
.card .note{font-size:12.5px; color:var(--ink-soft); margin-top:10px; padding-top:10px;
  border-top:1px dashed var(--line); line-height:1.6;}
@media (max-width:760px){.grid{grid-template-columns:1fr;}}
```

---

## 7. 圆圈编号条件列表 `.cond-list .dot`

```html
<ul class="cond-list">
  <li><span class="dot">①</span>条件一……</li>
  <li><span class="dot">②</span>条件二……</li>
</ul>
```

```css
.cond-list{list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:8px;}
.cond-list li{display:flex; gap:9px; font-size:13.5px; line-height:1.6; color:var(--ink-soft);}
.cond-list .dot{flex:none; width:20px; height:20px; border-radius:50%; border:1.5px solid var(--brass);
  color:var(--brass); font-size:11px; font-weight:700; display:flex; align-items:center; justify-content:center;
  font-family:'Noto Serif SC',serif;}
```

---

## 8. 对比表

### 8a. 小型双列对比（卡片内嵌，参考 01）

```html
<table class="compare">
  <tr><th>对比项</th><th>A</th><th>B</th></tr>
  <tr><td class="k">发生时间</td><td>……</td><td>……</td></tr>
</table>
```

```css
.compare{width:100%; border-collapse:collapse; font-size:12.5px; margin-top:4px;}
.compare th,.compare td{border:1px solid var(--line); padding:7px 8px; text-align:left; vertical-align:top;}
.compare th{background:var(--accent); color:#fff; font-weight:700; font-family:'Noto Serif SC',serif;}
.compare td{color:var(--ink-soft); line-height:1.55;}
.compare td.k{color:var(--ink); font-weight:700; background:rgba(184,137,59,.12); white-space:nowrap;}
```

### 8b. 大型多行多列对比（独立版式，参考 04）

用 CSS Grid 模拟表格，每个单元格都是独立小卡片，可横向滚动适配移动端。

```html
<div class="table-scroll">
  <div class="cmp">
    <div class="lbl"></div>
    <div class="head c-void">无效<small>§144,146</small></div>
    <div class="head c-voidable">可撤销<small>§147-151</small></div>
    <div class="head c-pending">效力待定<small>§145,§171</small></div>

    <div class="lbl">概念</div>
    <div class="cell c-void">……</div>
    <div class="cell c-voidable">……</div>
    <div class="cell c-pending">……</div>
    <!-- 继续按行重复 -->
  </div>
</div>
```

```css
.table-scroll{overflow-x:auto; padding-bottom:6px;}
.cmp{display:grid; grid-template-columns:130px 1fr 1fr 1fr; gap:10px; min-width:760px;}
.cmp .lbl{display:flex; align-items:center; font-size:12.5px; font-weight:700; color:var(--folder-2); opacity:.8; padding:10px 4px;}
.cmp .head{font-family:'Noto Serif SC',serif; font-weight:900; font-size:16px; text-align:center; color:#fff;
  border-radius:10px 10px 4px 4px; padding:12px 8px 10px;}
.cmp .head small{display:block; font-family:'SF Mono',Consolas,monospace; font-weight:400; font-size:10.5px; opacity:.85; margin-top:3px;}
.cell{background:var(--folder); border-radius:10px; padding:12px 13px; font-size:12.8px; line-height:1.65;
  color:var(--ink-soft); box-shadow:0 6px 14px rgba(0,0,0,.22);}
.cell b{color:var(--ink); font-weight:700;}
/* 每一组对比对象给自己一个色：例如 .c-void{border-top:4px solid var(--seal);} .head.c-void{background:var(--seal);} */
```

列数 ≠ 3 时改 `grid-template-columns` 即可；移动端靠 `overflow-x:auto` + 提示文字"← 左右滑动查看 →"解决，不要硬挤成单列（会破坏"逐行对照"的核心价值）。

---

## 9. 思维导图：纯CSS堆叠树状结构（参考 02）

**关键技巧**：不用绝对定位算坐标，靠"竖线 → 横线 → 各分支竖线"三段简单 block 元素堆叠，天然对齐，换分支数量也不会错位。

```html
<div class="tree-stage">
  <div class="root-node">…中心主题…</div>
  <div class="stem"></div>
  <div class="bus-line"></div>
  <div class="branches">
    <div class="branch">
      <div class="branch-stem"></div>
      <div class="branch-card">…分支内容…</div>
    </div>
    <!-- 重复 N 个分支 -->
  </div>
</div>
```

```css
.tree-stage{display:flex; flex-direction:column; align-items:center;}
.stem{width:2px; height:26px; background:var(--brass);}
.bus-line{width:92%; max-width:820px; height:2px; background:var(--brass);}
.branches{display:flex; width:92%; max-width:820px; justify-content:space-between; gap:16px;}
.branch{flex:1; display:flex; flex-direction:column; align-items:center; min-width:0;}
.branch-stem{width:2px; height:22px; background:var(--brass);}
.branch-card{width:100%; background:var(--folder); border-radius:12px; padding:18px 16px 16px;
  box-shadow:0 8px 18px rgba(0,0,0,.28); color:var(--ink); border-top:4px solid var(--accent);}

/* 移动端：去掉横线/竖线，改成左边框引导层级 */
@media (max-width:760px){
  .branches{flex-direction:column; width:100%;}
  .branch-stem,.bus-line{display:none;}
  .branch-card{border-left:4px solid var(--accent); border-top:none;}
}
```

`.root-node` 复用第2节 `.hero` 的"叠纸"写法（`position:relative` + 两个旋转伪元素），但 `width:fit-content` 居中显示。

---

## 10. 流程图：地铁线式判断链（参考 03）

**核心隐喻**：一条会"流动"的主轴线（动画虚线）贯穿所有判断站点；每一步只展示"哪个答案让你岔出去"，"继续往下走"的那个答案只用一个小文字标签表示，不单独画框——这样视觉重心自然落在"结论/岔路"上。

```html
<div class="flow-track">
  <div class="step">
    <div class="marker">1</div>
    <div class="step-main">
      <div class="q-card"><span class="qn">起因条件</span><div class="qtext">是否存在现实的不法侵害？</div></div>
      <div class="path-line">
        <span class="continue-tag">是 → 下一步</span>
        <div class="exit-link tone-warn">
          <span class="conn">↳</span><span class="exit-tag">否</span>
          <div class="exit-card"><span class="ic">⚠️</span><div><b>结论标题</b><span>结论说明</span></div></div>
        </div>
      </div>
    </div>
  </div>
  <!-- 重复 N 个 step；最后一步如果两个答案都是终点，用 .dual-exit 包两个 .exit-link，不放 .continue-tag -->
</div>
```

```css
.flow-track{position:relative;}
.flow-track::before{
  content:""; position:absolute; left:19.5px; top:21px; bottom:21px; width:3px; z-index:0;
  background-image:repeating-linear-gradient(to bottom, var(--brass) 0 9px, transparent 9px 18px);
  background-size:3px 18px; animation:flow-move .9s linear infinite;
}
@keyframes flow-move{from{background-position:0 0;} to{background-position:0 18px;}}

.step{position:relative; z-index:1; display:flex; gap:16px; margin-bottom:24px;}
.marker{flex:none; width:42px; height:42px; border-radius:50%; background:var(--folder);
  border:3px solid var(--accent); color:var(--accent); font-family:'Noto Serif SC',serif; font-weight:900;
  font-size:15px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 10px rgba(0,0,0,.35);}
.step-main{flex:1; min-width:0; display:flex; flex-direction:column; gap:10px;}

.q-card{background:var(--folder); border-radius:12px; padding:14px 18px; box-shadow:0 8px 18px rgba(0,0,0,.28); color:var(--ink);}
.qn{font-family:'Noto Serif SC',serif; font-weight:900; font-size:11px; color:var(--accent);}
.q-card .qtext{font-size:14.5px; font-weight:700; line-height:1.5; margin-top:3px;}

.path-line{display:flex; align-items:stretch; gap:12px; flex-wrap:wrap;}
.continue-tag{align-self:center; flex:none; font-size:12px; font-weight:700; color:var(--jade);
  display:flex; align-items:center; gap:5px; background:rgba(63,107,79,.12);
  border:1px solid var(--jade); border-radius:999px; padding:5px 13px; white-space:nowrap;}

.exit-link{display:flex; align-items:center; gap:8px; flex:1; min-width:230px;}
.exit-link .conn{flex:none; font-size:15px; color:var(--folder-2); opacity:.65;}
.exit-tag{flex:none; font-size:11.5px; font-weight:900; border-radius:999px; padding:4px 11px; color:#fff;}
.exit-card{flex:1; min-width:0; background:var(--folder); border-radius:10px; padding:10px 13px;
  font-size:12.3px; line-height:1.55; display:flex; gap:8px; box-shadow:0 6px 14px rgba(0,0,0,.24);}

/* 三种结论色：好/警示/否定，类名加在 .exit-link 上，同时染色 tag 和 card 边 */
.exit-link.tone-good .exit-tag{background:var(--jade);}
.exit-link.tone-good .exit-card{border-left:4px solid var(--jade);}
.exit-link.tone-warn .exit-tag{background:var(--warn);}
.exit-link.tone-warn .exit-card{border-left:4px solid var(--warn);}
.exit-link.tone-no .exit-tag{background:var(--accent);}
.exit-link.tone-no .exit-card{border-left:4px solid var(--accent);}

.dual-exit{display:flex; gap:14px; flex-wrap:wrap;}
```

`.flow-track::before` 的 `left:19.5px` 对应 `.marker` 宽度 42px 居中的圆心位置（42/2 - 线宽3/2 = 19.5）；如果改了 marker 尺寸，要同步改这个偏移量，否则线不会穿过圆心。

---

## 11. 提示横幅（说明性 / 警示性文字条，参考 06）

```html
<div class="privacy"><span class="ic">📢</span><span>说明性文字……</span></div>
<div class="fallback-banner show"><span class="ic">⚠️</span><span>警示性文字……</span></div>
```

```css
.privacy{display:flex; gap:10px; align-items:flex-start; background:rgba(184,137,59,.14);
  border:1px dashed var(--brass); border-radius:10px; padding:10px 14px; font-size:12.5px;
  color:var(--folder-2); line-height:1.7;}
.fallback-banner{display:flex; gap:10px; align-items:flex-start; background:rgba(165,36,34,.16);
  border:1px dashed var(--seal); border-radius:10px; padding:10px 14px; font-size:12.5px;
  color:var(--folder); line-height:1.7;}
```

说明性用 brass（中性），警示/降级提示用 seal（醒目）。

---

## 12. 悬浮反馈按钮 `.fab-feedback`

整站统一，固定在右下角，直接粘贴在 `</body>` 前即可（行内 style，避免每页都要单独维护一段 CSS 规则）：

```html
<a class="fab-feedback" href="06-feedback.html" title="留言反馈"
   style="position:fixed; bottom:22px; right:22px; display:flex; align-items:center; gap:8px;
   background:var(--brass); color:#2a2420; text-decoration:none; padding:12px 16px; border-radius:999px;
   box-shadow:0 10px 24px rgba(0,0,0,.4); font-size:13px; font-weight:700; z-index:50;
   border:2px solid rgba(255,255,255,.25);">💬 留言反馈</a>
```

留言板页面自身把这个按钮换成指回首页（图标🏠 + `var(--seal)` 背景），避免"在留言板里链接到留言板"。

---

## 13. 翻页指示 `.dots` + `.footnav`

```html
<div class="pagefoot">
  <div class="footnav">
    <a href="01-grid-overview.html">上一主题：诉讼时效</a>
    <a href="03-flowchart.html">下一主题：正当防卫</a>
  </div>
  <div class="dots">
    <span></span><span class="active"></span><span></span><span></span><span></span>
  </div>
</div>
```

```css
.pagefoot{display:flex; flex-direction:column; align-items:center; gap:12px; margin-top:36px;}
.dots{display:flex; gap:8px;}
.dots span{width:7px; height:7px; border-radius:50%; background:rgba(239,228,200,.3);}
.dots span.active{background:var(--brass); width:20px; border-radius:4px;}
.footnav{display:flex; gap:26px; font-size:13px;}
.footnav a{color:var(--folder); opacity:.8; text-decoration:none; border-bottom:1px solid var(--brass);}
```

`.dots` 的圆点总数 = 知识点系列总页数（目前是5个主题页，不含首页/404/留言板），新增主题页时要同步在**所有**主题页里补一个 `<span>`。
