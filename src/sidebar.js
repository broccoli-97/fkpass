/*
  法考速记卷宗 · 卷宗目录侧栏（quick-jump drawer）
  --------------------------------------------------------------
  作用：在页面左缘挂一个"卷宗目录"把手，点开后从左侧滑出一个
  牛皮纸抽屉，按科目族分组列出全站知识点卷，当前页高亮，任意
  页面一键跳转其他考点，不必先回首页。

  复用方式（每个页面一行，无需写任何 HTML——把手和抽屉由本脚本注入）：
    <head> 里加  <script src="sidebar.js" defer></script>
  样式全部在 tokens.css（.sb-* 一节）；分组色标读取各科目族专属
  accent（见 SKILL.md 科目色映射），把手与站点级高亮用 --brass。

  SITE_MAP 是本脚本内置的"科目族 → 卷宗清单"，必须与 index.html
  的目录（.subj-group / .tcard）保持逐条一致——它是严格 JSON，
  test/design-system.test.js 会解析并与首页目录、各页 data-subject
  比对，新增页面漏改任何一处 npm test 都会失败。
*/
(function () {
  'use strict';

  /* SITE_MAP:BEGIN —— 严格 JSON（双引号、无尾逗号、无注释），测试要解析 */
  var SITE_MAP = [
    {
      "subject": "理论法",
      "accent": "#46506b",
      "pages": [
        { "href": "lilun-fazhi.html", "title": "中国特色社会主义法治理论" },
        { "href": "falixue.html", "title": "法理学" },
        { "href": "xianfa.html", "title": "宪法" },
        { "href": "fazhishi.html", "title": "中国法律史" },
        { "href": "zhiye-daode.html", "title": "司法制度与法律职业道德" },
        { "href": "lifa-fa.html", "title": "立法法与立法体制" }
      ]
    },
    {
      "subject": "民法",
      "accent": "#2b4960",
      "pages": [
        { "href": "minshi-falv-xingwei.html", "title": "民事法律行为" },
        { "href": "daili.html", "title": "代理" },
        { "href": "susong-shixiao.html", "title": "诉讼时效" },
        { "href": "xiaoli-santai.html", "title": "效力三态对比" },
        { "href": "wuquan-biandong.html", "title": "物权变动" },
        { "href": "shanyi-qude.html", "title": "善意取得" },
        { "href": "danbao-wuquan.html", "title": "担保物权" },
        { "href": "hetong-dingli.html", "title": "合同的订立与效力" },
        { "href": "weiyue-zeren.html", "title": "违约责任" },
        { "href": "qinquan-zeren.html", "title": "侵权责任" },
        { "href": "hunyin-jiacheng.html", "title": "婚姻家庭与继承" }
      ]
    },
    {
      "subject": "刑法",
      "accent": "#a52422",
      "pages": [
        { "href": "fanzui-goucheng.html", "title": "犯罪构成" },
        { "href": "fanzui-zhuguan.html", "title": "犯罪主观方面" },
        { "href": "fanzui-xingtai.html", "title": "犯罪未完成形态" },
        { "href": "gongtong-fanzui.html", "title": "共同犯罪" },
        { "href": "zhengdang-fangwei.html", "title": "正当防卫认定" },
        { "href": "zuishu-xingtai.html", "title": "罪数形态" },
        { "href": "xingfa-tixi.html", "title": "刑罚体系" },
        { "href": "liangxing-qingjie.html", "title": "量刑情节" },
        { "href": "caichan-fanzui.html", "title": "财产犯罪对比" }
      ]
    },
    {
      "subject": "刑事诉讼法",
      "accent": "#7a3b55",
      "pages": [
        { "href": "xingsu-yuanze.html", "title": "刑事诉讼基本原则" },
        { "href": "xingsu-guanxia.html", "title": "管辖" },
        { "href": "xingsu-huibi.html", "title": "回避" },
        { "href": "xingsu-bianhu.html", "title": "辩护与代理" },
        { "href": "xingsu-qiangzhi-cuoshi.html", "title": "强制措施" },
        { "href": "xingsu-zhengju.html", "title": "刑事证据" },
        { "href": "xingsu-feifa-zhengju-paichu.html", "title": "非法证据排除" },
        { "href": "xingsu-zhencha.html", "title": "侦查程序" },
        { "href": "xingsu-bu-qisu.html", "title": "提起公诉与不起诉" },
        { "href": "xingsu-shenpan.html", "title": "刑事审判程序" },
        { "href": "xingsu-ershen-zaishen.html", "title": "二审与再审程序" }
      ]
    },
    {
      "subject": "行政法",
      "accent": "#5d6b2f",
      "pages": [
        { "href": "xingzheng-yuanze.html", "title": "行政法基本原则" },
        { "href": "xingzheng-zhuti.html", "title": "行政主体与职权" },
        { "href": "xingzheng-xingwei-xiaoli.html", "title": "行政行为及效力" },
        { "href": "xingzheng-xuke.html", "title": "行政许可" },
        { "href": "xingzheng-chufa.html", "title": "行政处罚" },
        { "href": "xingzheng-qiangzhi.html", "title": "行政强制" },
        { "href": "xingzheng-fuyi.html", "title": "行政复议" },
        { "href": "xingzheng-susong-shouan.html", "title": "诉讼受案范围" },
        { "href": "xingzheng-susong.html", "title": "行政诉讼" },
        { "href": "xingzheng-peichang.html", "title": "行政赔偿" },
        { "href": "xingzheng-xinxi-gongkai.html", "title": "政府信息公开" }
      ]
    },
    {
      "subject": "民事诉讼法",
      "accent": "#2f6168",
      "pages": [
        { "href": "minshi-susong.html", "title": "民事诉讼法" },
        { "href": "minsu-guanxia.html", "title": "民诉管辖" }
      ]
    },
    {
      "subject": "商法",
      "accent": "#684a7a",
      "pages": [
        { "href": "shangfa.html", "title": "商法 · 公司法核心" },
        { "href": "pochanfa.html", "title": "企业破产法" }
      ]
    },
    {
      "subject": "经济法",
      "accent": "#9a5a38",
      "pages": [
        { "href": "jingjifa.html", "title": "经济法" },
        { "href": "laodong-hetong.html", "title": "劳动合同法" }
      ]
    },
    {
      "subject": "知识产权法",
      "accent": "#2c6e84",
      "pages": [
        { "href": "zhishichanquan.html", "title": "著作权 · 专利 · 商标" },
        { "href": "shangbiao.html", "title": "商标法" }
      ]
    },
    {
      "subject": "国际法",
      "accent": "#8f5066",
      "pages": [
        { "href": "guoji-gongfa.html", "title": "国际公法" },
        { "href": "guoji-sifa.html", "title": "国际私法" },
        { "href": "guoji-jingjifa.html", "title": "国际经济法" },
        { "href": "shewai-zhongcai.html", "title": "涉外仲裁与司法协助" }
      ]
    }
  ];
  /* SITE_MAP:END */

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var overlay, drawer, listWrap, tab, closeBtn;
  var lastFocus = null;

  function el(tag, cls) {
    var node = document.createElement(tag);
    if (cls) { node.className = cls; }
    return node;
  }

  // 当前页文件名（部署在站点根目录，file:// 下同样成立）
  function currentFile() {
    var f = window.location.pathname.split('/').pop();
    return f || 'index.html';
  }

  function buildGroup(group, file) {
    var det = el('details', 'sb-group');
    det.style.setProperty('--sb-accent', group.accent);

    var sum = el('summary', 'sb-subject');
    var swatch = el('span', 'sb-swatch');
    var name = el('span', 'sb-subj-name');
    name.textContent = group.subject;
    var count = el('span', 'sb-count');
    count.textContent = group.pages.length + ' 卷';
    sum.appendChild(swatch);
    sum.appendChild(name);
    sum.appendChild(count);
    det.appendChild(sum);

    var list = el('ul', 'sb-list');
    for (var i = 0; i < group.pages.length; i++) {
      var p = group.pages[i];
      var li = document.createElement('li');
      var a = el('a', 'sb-link');
      a.href = p.href;
      a.textContent = p.title;
      if (p.href === file) {
        a.classList.add('is-current');
        a.setAttribute('aria-current', 'page');
        det.open = true; // 当前页所在科目默认展开
      }
      li.appendChild(a);
      list.appendChild(li);
    }
    det.appendChild(list);
    return det;
  }

  function footLink(href, label) {
    var a = document.createElement('a');
    a.href = href;
    a.textContent = label;
    return a;
  }

  // 构建一次把手 + 抽屉骨架，全站复用
  function build() {
    var file = currentFile();

    tab = el('button', 'sb-tab');
    tab.type = 'button';
    tab.setAttribute('aria-haspopup', 'dialog');
    tab.setAttribute('aria-expanded', 'false');
    tab.setAttribute('aria-label', '打开卷宗目录');
    tab.textContent = '卷宗目录';

    overlay = el('div', 'sb-overlay');
    overlay.hidden = true;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', '卷宗目录');

    drawer = el('nav', 'sb-drawer');
    drawer.setAttribute('aria-label', '全站知识点');

    var head = el('div', 'sb-head');
    var kicker = el('div', 'sb-kicker');
    kicker.textContent = '法考速记卷宗';
    var title = el('div', 'sb-title');
    title.textContent = '卷宗目录';
    closeBtn = el('button', 'sb-close');
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', '关闭目录');
    closeBtn.textContent = '×';
    head.appendChild(kicker);
    head.appendChild(title);
    head.appendChild(closeBtn);

    listWrap = el('div', 'sb-body');
    for (var i = 0; i < SITE_MAP.length; i++) {
      listWrap.appendChild(buildGroup(SITE_MAP[i], file));
    }

    var foot = el('div', 'sb-foot');
    foot.appendChild(footLink('index.html', '🗂 目录首页'));
    foot.appendChild(footLink('feedback.html', '💬 留言反馈'));

    drawer.appendChild(head);
    drawer.appendChild(listWrap);
    drawer.appendChild(foot);
    overlay.appendChild(drawer);
    document.body.appendChild(tab);
    document.body.appendChild(overlay);

    tab.addEventListener('click', function () {
      if (overlay.hidden) { open(); }
    });
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

  // 简单焦点陷阱：Tab 只在抽屉内循环（跳过折叠分组里不可见的链接）
  function trapTab(e) {
    var all = drawer.querySelectorAll('summary, a[href], button, [tabindex]:not([tabindex="-1"])');
    var f = [].filter.call(all, function (n) { return n.offsetParent !== null; });
    if (!f.length) { return; }
    var first = f[0];
    var last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  // 把当前页条目滚到抽屉可视区中部（手动算 scrollTop，避免顺带滚动背后的页面）
  function revealCurrent() {
    var cur = drawer.querySelector('.sb-link.is-current');
    if (!cur) { return; }
    var b = listWrap.getBoundingClientRect();
    var c = cur.getBoundingClientRect();
    listWrap.scrollTop += c.top - b.top - b.height / 2 + c.height / 2;
  }

  function open() {
    lastFocus = document.activeElement;
    overlay.hidden = false;
    tab.setAttribute('aria-expanded', 'true');
    void overlay.offsetWidth; // 强制回流，让滑入过渡从初始态播放
    overlay.classList.add('open');
    revealCurrent();
    closeBtn.focus();
  }

  function finishClose() {
    overlay.hidden = true;
    if (lastFocus) { try { lastFocus.focus(); } catch {} }
  }

  function close() {
    overlay.classList.remove('open');
    tab.setAttribute('aria-expanded', 'false');
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
    window.setTimeout(onEnd, 420); // 兜底：transitionend 未触发也能收尾
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
