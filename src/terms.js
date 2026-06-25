/*
  法考速记卷宗 · 词条释义浮层（frosted-glass term lightbox）
  --------------------------------------------------------------
  作用：把正文里的 <button class="term" data-term="X"> 变成可点词条。
  点击后：背景毛玻璃模糊 → 被点术语“飞”到左栏 → 右栏展开同名
  <template class="term-detail" data-term="X"> 里作者写好的详解 / 延伸知识。

  复用方式（每个页面）：
    1) <head> 里加  <script src="terms.js" defer></script>
    2) 正文写  ……<button class="term" type="button" data-term="抗辩权"
                       data-cite="民法典 §192">抗辩权</button>……
    3) 页面任意处放同名模板：
         <template class="term-detail" data-term="抗辩权"> …任意 HTML… </template>
  样式全部在 tokens.css，靠 var(--accent) 自动套用当前页主题色。

  无需写浮层结构——本脚本在页面加载时自动构建一份并复用。
  说明：模板内容是作者自己写的可信 HTML，用 cloneNode 注入；
  这与留言板“用户输入必须 textContent”的 XSS 规则是两回事。
*/
(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var overlay, spread, titleEl, citeEl, panel, aside, closeBtn;
  var lastFocus = null;
  var activeTerm = null;

  function el(tag, cls) {
    var node = document.createElement(tag);
    if (cls) { node.className = cls; }
    return node;
  }

  // 构建一次浮层骨架，全站复用
  function build() {
    overlay = el('div', 'term-overlay');
    overlay.hidden = true;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'term-overlay-title');

    spread = el('div', 'term-spread');

    aside = el('div', 'term-aside');
    var kicker = el('div', 'term-kicker');
    kicker.textContent = '词条释义';
    titleEl = el('h2', 'term-title');
    titleEl.id = 'term-overlay-title';
    citeEl = el('div', 'term-cite');
    aside.appendChild(kicker);
    aside.appendChild(titleEl);
    aside.appendChild(citeEl);

    panel = el('div', 'term-panel');

    closeBtn = el('button', 'term-close');
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', '关闭释义');
    closeBtn.textContent = '×';

    spread.appendChild(aside);
    spread.appendChild(panel);
    spread.appendChild(closeBtn);
    overlay.appendChild(spread);
    document.body.appendChild(overlay);

    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) { close(); }
    });
    document.addEventListener('keydown', function (e) {
      if (overlay.hidden) { return; }
      if (e.key === 'Escape') { close(); }
      else if (e.key === 'Tab') { trapTab(e); }
    });
  }

  // 简单焦点陷阱：Tab 只在浮层内循环
  function trapTab(e) {
    var f = spread.querySelectorAll('button, [href], input, textarea, [tabindex]:not([tabindex="-1"])');
    if (!f.length) { return; }
    var first = f[0];
    var last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function open(btn) {
    var key = btn.getAttribute('data-term');
    var safeKey = window.CSS && CSS.escape ? CSS.escape(key) : key;
    var tpl = document.querySelector('template.term-detail[data-term="' + safeKey + '"]');
    if (!tpl) { return; }

    lastFocus = btn;
    activeTerm = btn;
    btn.setAttribute('aria-expanded', 'true');

    titleEl.textContent = (btn.textContent || '').trim();
    var cite = btn.getAttribute('data-cite');
    citeEl.textContent = cite || '';
    citeEl.style.display = cite ? '' : 'none';

    panel.textContent = '';                            // 静态清空
    panel.appendChild(tpl.content.cloneNode(true));    // 作者可信 HTML
    panel.scrollTop = 0;

    // 让浮层套用被点术语所在页的主题色
    var accent = getComputedStyle(btn).getPropertyValue('--accent');
    if (accent) { overlay.style.setProperty('--accent', accent.trim()); }

    overlay.hidden = false;

    if (reduce) {                                      // 尊重“减少动态效果”：直接显示
      overlay.classList.add('open');
      closeBtn.focus();
      return;
    }

    // FLIP：测量术语在正文里的起点与左栏的终点，先反向位移再播放
    var from = btn.getBoundingClientRect();
    var to = aside.getBoundingClientRect();
    var dx = from.left - to.left;
    var dy = from.top - to.top;
    var sx = Math.max(0.25, Math.min(1, from.width / to.width));

    aside.style.transition = 'none';
    aside.style.transformOrigin = 'top left';
    aside.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ')';
    aside.style.opacity = '0';
    panel.style.transition = 'none';
    panel.style.opacity = '0';
    panel.style.transform = 'translateX(26px)';
    void spread.offsetWidth;                           // 强制回流，锁定起点

    requestAnimationFrame(function () {
      aside.style.transition = '';
      panel.style.transition = '';
      overlay.classList.add('open');
      aside.style.transform = '';
      aside.style.opacity = '';
      panel.style.opacity = '';
      panel.style.transform = '';
    });
    window.setTimeout(function () { closeBtn.focus(); }, 80);
  }

  function finishClose() {
    overlay.hidden = true;
    panel.textContent = '';
    if (activeTerm) { activeTerm.setAttribute('aria-expanded', 'false'); activeTerm = null; }
    if (lastFocus) { try { lastFocus.focus(); } catch {} }
  }

  function close() {
    overlay.classList.remove('open');
    if (reduce) { finishClose(); return; }
    var done = false;
    var onEnd = function (e) {
      if (e && e.target !== overlay) { return; }
      if (done) { return; }
      done = true;
      overlay.removeEventListener('transitionend', onEnd);
      finishClose();
    };
    overlay.addEventListener('transitionend', onEnd);
    window.setTimeout(onEnd, 480);                     // 兜底：transitionend 未触发也能收尾
  }

  function init() {
    build();
    var terms = document.querySelectorAll('.term');
    for (var i = 0; i < terms.length; i++) {
      terms[i].setAttribute('aria-haspopup', 'dialog');
      terms[i].setAttribute('aria-expanded', 'false');
    }
    document.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('.term') : null;
      if (btn) { e.preventDefault(); open(btn); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
