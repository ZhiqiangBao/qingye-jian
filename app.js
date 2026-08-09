(() => {
  const FALLBACK_SKINS = [
    {
      id: "qingye",
      name: "青叶",
      stamp: "今日",
      desc: "叶绿小清新",
      colors: {
        ink: "#3d4a45",
        inkSoft: "#6d7a74",
        paper: "#f8faf7",
        sage: "#7fafa0",
        sageDeep: "#5a8f7f",
        blush: "#e7a8b2",
        sky: "#8eb8c9",
        lemon: "#e6d39a",
      },
      paper: {
        size: "a5",
        minHeight: "68vh",
        radius: "18px",
        lines: { enabled: true, style: "solid", gap: "1.7rem", color: "rgba(120,150,140,0.22)", offsetTop: "2.6rem" },
        marginLine: { enabled: true, left: "2.1rem", color: "rgba(231,168,178,0.45)" },
      },
      layout: {
        sidebarWidth: "15.2rem",
        notebookMaxWidth: "1180px",
        showSpiral: true,
        showTape: true,
        showPetals: true,
        contentGap: "0.9rem",
      },
      stickers: [
        { emoji: "🌿", top: "7%", right: "3%", rotate: "12", size: "1.5rem" },
      ],
    },
  ];

  const COLOR_CSS = {
    ink: "--ink",
    inkSoft: "--ink-soft",
    paper: "--paper",
    sage: "--sage",
    sageDeep: "--sage-deep",
    blush: "--blush",
    sky: "--sky",
    lemon: "--lemon",
  };

  const editor = document.getElementById("editor");
  const preview = document.getElementById("preview");
  const pageStage = document.getElementById("pageStage");
  const pageNav = document.getElementById("pageNav");
  const pageIndicator = document.getElementById("pageIndicator");
  const btnPagePrev = document.getElementById("btnPagePrev");
  const btnPageNext = document.getElementById("btnPageNext");
  const workspaceEl = document.getElementById("workspace");
  const fileListEl = document.getElementById("fileList");
  const filesHint = document.getElementById("filesHint");
  const folderPathEl = document.getElementById("folderPath");
  const fileNameEl = document.getElementById("fileName");
  const saveStateEl = document.getElementById("saveState");
  const progressLabel = document.getElementById("progressLabel");
  const progressPct = document.getElementById("progressPct");
  const progressFill = document.getElementById("progressFill");
  const nowTitle = document.getElementById("nowTitle");
  const nowTime = document.getElementById("nowTime");
  const themeChips = document.getElementById("themeChips");
  const fontChips = document.getElementById("fontChips");
  const fontRail = document.getElementById("fontRail");
  const brandMark = document.getElementById("brandMark");
  const brandStamp = document.getElementById("brandStamp");
  const stickerLayer = document.getElementById("stickerLayer");
  const skinDecorLayer = document.getElementById("skinDecorLayer");
  const templateModal = document.getElementById("templateModal");
  const templateGrid = document.getElementById("templateGrid");
  const templateHint = document.getElementById("templateHint");
  const templateStatus = document.getElementById("templateStatus");
  const importNameInput = document.getElementById("importName");
  const skinModal = document.getElementById("skinModal");
  const skinJson = document.getElementById("skinJson");
  const skinFile = document.getElementById("skinFile");
  const skinStatus = document.getElementById("skinStatus");
  const skinOverwrite = document.getElementById("skinOverwrite");
  const stickerModal = document.getElementById("stickerModal");
  const stickerRail = document.getElementById("stickerRail");
  const chkStickersEnabled = document.getElementById("chkStickersEnabled");
  const chkSkinDecor = document.getElementById("chkSkinDecor");
  const stickerText = document.getElementById("stickerText");
  const stickerRotate = document.getElementById("stickerRotate");
  const stickerSize = document.getElementById("stickerSize");
  const stickerRotateVal = document.getElementById("stickerRotateVal");
  const stickerSizeVal = document.getElementById("stickerSizeVal");
  const stickerPreview = document.getElementById("stickerPreview");
  const stickerPreviewText = document.getElementById("stickerPreviewText");
  const shapeGrid = document.getElementById("shapeGrid");
  const stickerColorGrid = document.getElementById("stickerColorGrid");
  const stickerModalTitle = document.getElementById("stickerModalTitle");
  const stickerModalStatus = document.getElementById("stickerModalStatus");
  const btnStickerDelete = document.getElementById("btnStickerDelete");

  const STICKER_SHAPES = [
    { id: "note", label: "便签" },
    { id: "round", label: "圆形" },
    { id: "oval", label: "椭圆" },
    { id: "washi", label: "胶带" },
    { id: "ticket", label: "票根" },
    { id: "heart", label: "爱心" },
    { id: "cloud", label: "云朵" },
  ];
  const STICKER_COLORS = [
    { bg: "#fff8f4", ink: "#5a4540" },
    { bg: "#f3faf6", ink: "#3d4a45" },
    { bg: "#eef6fa", ink: "#3a4a55" },
    { bg: "#fff4f6", ink: "#6a4048" },
    { bg: "#fff9e9", ink: "#5a5238" },
    { bg: "#f4f1fb", ink: "#4a4560" },
    { bg: "#ffe8d8", ink: "#6a4030" },
    { bg: "#e8f5e9", ink: "#355040" },
  ];

  /** Handwriting-style packs — substitute for real pen ink on preview paper */
  const FONT_PRESETS = [
    {
      id: "qingye",
      name: "青叶手写",
      sample: "青叶",
      read: '"Gaegu", "Noto Sans SC", sans-serif',
      hand: '"Ma Shan Zheng", "Liu Jian Mao Cao", cursive',
      cute: '"Gaegu", "Noto Sans SC", sans-serif',
    },
    {
      id: "maobi",
      name: "毛笔行书",
      sample: "行书",
      read: '"Zhi Mang Xing", "Ma Shan Zheng", "Noto Sans SC", cursive',
      hand: '"Ma Shan Zheng", "Zhi Mang Xing", cursive',
      cute: '"Zhi Mang Xing", "Gaegu", sans-serif',
    },
    {
      id: "caoshu",
      name: "潦草速记",
      sample: "速记",
      read: '"Liu Jian Mao Cao", "Zhi Mang Xing", "Noto Sans SC", cursive',
      hand: '"Liu Jian Mao Cao", "Ma Shan Zheng", cursive',
      cute: '"Liu Jian Mao Cao", "Gaegu", cursive',
    },
    {
      id: "longcang",
      name: "龙藏笔锋",
      sample: "笔锋",
      read: '"Long Cang", "Ma Shan Zheng", "Noto Sans SC", cursive',
      hand: '"Long Cang", "Ma Shan Zheng", cursive',
      cute: '"Long Cang", "Gaegu", cursive',
    },
    {
      id: "xiaowei",
      name: "小薇标题",
      sample: "小薇",
      read: '"ZCOOL XiaoWei", "Noto Sans SC", serif',
      hand: '"ZCOOL XiaoWei", "Ma Shan Zheng", serif',
      cute: '"ZCOOL XiaoWei", "Gaegu", serif',
    },
    {
      id: "yinshua",
      name: "工整印刷",
      sample: "印刷",
      read: '"Noto Sans SC", "PingFang SC", sans-serif',
      hand: '"Noto Sans SC", "PingFang SC", sans-serif',
      cute: '"Noto Sans SC", "PingFang SC", sans-serif',
    },
  ];

  let skins = FALLBACK_SKINS.slice();
  let skinDecor = [];
  let userStickers = [];
  let editingStickerId = null;
  let draftShape = "note";
  let draftColor = STICKER_COLORS[0];
  let stickersEnabled = localStorage.getItem("journal-stickers-enabled") !== "0";
  let skinDecorEnabled = localStorage.getItem("journal-skin-decor") !== "0";

  /** GitHub Pages / static hosting: no Python API */
  const DEMO_FORCED =
    document.documentElement.dataset.demo === "1" ||
    new URLSearchParams(location.search).has("demo");
  let demoMode = DEMO_FORCED;
  const DEMO_FILES_KEY = "qingye-jian-demo-files-v1";
  const DEMO_CUSTOM_SKINS_KEY = "qingye-jian-demo-skins-v1";
  let demoFiles = {};
  let demoTemplateCache = null;

  /** Desktop mode (pywebview / Edge WebView2)：浏览器 API 不可用，改走 Python 桥 */
  let IS_PYWEBVIEW = false;
  function _checkPywebview() {
    try {
      IS_PYWEBVIEW = typeof window.pywebview !== "undefined" && !!window.pywebview && !!window.pywebview.api;
    } catch (_) {
      IS_PYWEBVIEW = false;
    }
    return IS_PYWEBVIEW;
  }
  _checkPywebview();
  window.addEventListener("pywebviewready", _checkPywebview);
  setTimeout(_checkPywebview, 300);
  setTimeout(_checkPywebview, 1500);

  /** Blob → base64（不含 data: 前缀） */
  function blobToB64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const r = reader.result || "";
        const i = r.indexOf(",");
        resolve(i >= 0 ? r.substring(i + 1) : r);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  function assetUrl(path) {
    const base = document.documentElement.dataset.assetBase || "./";
    const clean = String(path || "").replace(/^\.\//, "");
    return new URL(clean, new URL(base, location.href)).toString();
  }

  function downloadTextFile(filename, text) {
    const blob = new Blob([String(text ?? "")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "青叶笺.md";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function persistDemoFiles() {
    try {
      localStorage.setItem(DEMO_FILES_KEY, JSON.stringify(demoFiles));
    } catch (err) {
      console.warn(err);
    }
  }

  function loadPersistedDemoFiles() {
    try {
      const raw = localStorage.getItem(DEMO_FILES_KEY);
      if (!raw) return {};
      const data = JSON.parse(raw);
      return data && typeof data === "object" ? data : {};
    } catch {
      return {};
    }
  }

  function showDemoBanner() {
    let el = document.getElementById("demoBanner");
    if (!el) {
      el = document.createElement("div");
      el.id = "demoBanner";
      el.className = "demo-banner";
      document.body.prepend(el);
    }
    el.hidden = false;
    el.innerHTML =
      '🌿 <strong>青叶笺 · 在线 Demo</strong>：可试皮肤 / 贴纸 / 翻页 / 导出。' +
      '保存仅存本机浏览器，完整读写请下载桌面版。' +
      ' <a href="https://github.com/ZhiqiangBao/qingye-jian" target="_blank" rel="noopener">青叶笺-GitHub仓库</a>';
    document.body.classList.add("is-demo");
    const quit = document.getElementById("btnQuitApp");
    if (quit) {
      quit.textContent = "关于";
      quit.title = "关于在线 Demo";
    }
    const saveBtn = document.getElementById("btnSave");
    if (saveBtn) {
      saveBtn.textContent = "保存/下载";
      saveBtn.title = "保存到浏览器，并下载一份 .md";
    }
  }

  function parseTemplateMetaClient(raw) {
    const text = String(raw || "");
    const m = text.match(/<!--\s*journal-template\s*([\s\S]*?)\s*-->/i);
    if (!m) return { meta: {}, body: text };
    const meta = {};
    for (const line of m[1].split(/\r?\n/)) {
      const kv = line.match(/^\s*([a-zA-Z0-9_-]+)\s*:\s*(.*?)\s*$/);
      if (kv) meta[kv[1]] = kv[2];
    }
    const body = text.replace(m[0], "").replace(/^\s+/, "");
    return { meta, body };
  }

  async function fetchTextAsset(path) {
    const res = await fetch(assetUrl(path), { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
  }

  async function fetchJsonAsset(path) {
    const res = await fetch(assetUrl(path), { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async function initDemoMode() {
    showDemoBanner();
    demoFiles = loadPersistedDemoFiles();
    workspaceRoot = "demo";

    // Seed sample page if missing
    if (!demoFiles["示例学习计划.md"]) {
      try {
        const sample = await fetchTextAsset("document/示例学习计划.md");
        demoFiles["示例学习计划.md"] = {
          name: "示例学习计划.md",
          content: sample,
        };
      } catch (err) {
        console.warn(err);
        demoFiles["示例学习计划.md"] = {
          name: "示例学习计划.md",
          content: "# 青叶笺 Demo\n\n- [ ] 试试勾选\n- [ ] 换一套皮肤\n",
        };
      }
    }
    persistDemoFiles();

    browse = {
      workspace: "在线 Demo",
      path: "",
      parent: "",
      dirs: [],
      files: Object.keys(demoFiles)
        .sort((a, b) => a.localeCompare(b, "zh"))
        .map((path) => ({
          name: demoFiles[path].name || path,
          path,
        })),
      breadcrumbs: [{ name: "Demo", path: "" }],
    };
    currentDir = "";
    folderPathEl.textContent = "在线 Demo（浏览器本地）";
    filesHint.textContent = "Demo 模式：文件保存在本机浏览器，可下载 .md";
    paintBrowse();
    const preferred =
      browse.files.find((f) => f.name.includes("示例")) || browse.files[0];
    if (preferred) await openFile(preferred.path);
    else {
      editor.value = "# 青叶笺 Demo\n";
      setCurrentFile("", "未命名.md");
      render();
    }
    setStatus("Demo 已就绪");
  }
  let pageHtmls = [""];
  let currentPage = 0;
  let latestPreviewHtml = "";
  let paginateTimer = null;
  let flipLock = false;
  let currentPath = "";
  let currentDir = "";
  let dirty = false;
  let saveTimer = null;
  let browse = { dirs: [], files: [], breadcrumbs: [], parent: "", path: "", workspace: "" };
  let selectedTemplate = "";
  let workspaceRoot = "";
  let markedReady = typeof marked !== "undefined" && typeof marked.parse === "function";
  let renderer = null;

  if (markedReady) {
    try {
      marked.setOptions({ gfm: true, breaks: false });
      renderer = new marked.Renderer();
      const originalListitem = renderer.listitem.bind(renderer);
      renderer.listitem = function (item) {
        if (typeof item === "object" && item !== null && "task" in item) {
          const checked = !!item.checked;
          const text = marked.parseInline(item.text || "");
          return `<li class="task-item${checked ? " done" : ""}"><input type="checkbox" ${
            checked ? "checked" : ""
          } /><span class="task-text">${text}</span></li>\n`;
        }
        return originalListitem(item);
      };
    } catch (err) {
      console.warn(err);
      markedReady = false;
    }
  } else if (saveStateEl) {
    saveStateEl.textContent = "预览引擎未加载，已用简易模式（换皮肤/导入仍可用）";
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function simpleMarkdown(md) {
    const lines = String(md || "").split(/\r?\n/);
    const out = [];
    for (const line of lines) {
      const task = line.match(/^\s*[-*]\s+\[([ xX])\]\s*(.*)$/);
      if (task) {
        const checked = task[1].toLowerCase() === "x";
        out.push(
          `<li class="task-item${checked ? " done" : ""}"><input type="checkbox" ${
            checked ? "checked" : ""
          } /><span class="task-text">${escapeHtml(task[2])}</span></li>`
        );
        continue;
      }
      if (line.startsWith("### ")) {
        out.push(`<h3>${escapeHtml(line.slice(4))}</h3>`);
        continue;
      }
      if (line.startsWith("## ")) {
        out.push(`<h2>${escapeHtml(line.slice(3))}</h2>`);
        continue;
      }
      if (line.startsWith("# ")) {
        out.push(`<h1>${escapeHtml(line.slice(2))}</h1>`);
        continue;
      }
      if (line.startsWith("> ")) {
        out.push(`<blockquote>${escapeHtml(line.slice(2))}</blockquote>`);
        continue;
      }
      if (/^\s*[-*]\s+/.test(line)) {
        out.push(`<li>${escapeHtml(line.replace(/^\s*[-*]\s+/, ""))}</li>`);
        continue;
      }
      if (!line.trim()) {
        out.push("<br>");
        continue;
      }
      out.push(`<p>${escapeHtml(line)}</p>`);
    }
    return out.join("\n");
  }

  function setStatus(text) {
    saveStateEl.textContent = text;
  }

  function setCurrentFile(path, name) {
    currentPath = path || "";
    fileNameEl.textContent = currentPath || name || "还没有抽出一页";
  }

  function countTasks(md) {
    const all = md.match(/^\s*[-*]\s+\[[ xX]\]/gm) || [];
    const done = md.match(/^\s*[-*]\s+\[[xX]\]/gm) || [];
    return { total: all.length, done: done.length };
  }

  function updateProgress(md) {
    const { total, done } = countTasks(md);
    const pct = total ? Math.round((done / total) * 100) : 0;
    progressLabel.textContent = `${done} / ${total}`;
    progressPct.textContent = `${pct}%`;
    progressFill.style.width = `${pct}%`;
  }

  function parseTimeToMinutes(hhmm) {
    const m = String(hhmm).match(/(\d{1,2}):(\d{2})/);
    return m ? Number(m[1]) * 60 + Number(m[2]) : null;
  }

  function extractBlocks(md) {
    const blocks = [];
    const re =
      /^(#{2,3})\s+(\d{1,2}:\d{2})\s*[-–—~至到]+\s*(\d{1,2}:\d{2})\s*[｜|]?\s*(.+)$/gm;
    let match;
    while ((match = re.exec(md))) {
      const start = parseTimeToMinutes(match[2]);
      const end = parseTimeToMinutes(match[3]);
      if (start == null || end == null) continue;
      blocks.push({
        start,
        end,
        title: match[4].replace(/\s+/g, " ").trim(),
        label: `${match[2]} – ${match[3]}`,
        startToken: match[2],
      });
    }
    return blocks;
  }

  function updateNowBar(md) {
    const now = new Date();
    const mins = now.getHours() * 60 + now.getMinutes();
    nowTime.textContent = now.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const current = extractBlocks(md).find((b) => mins >= b.start && mins < b.end);
    nowTitle.textContent = current
      ? `${current.label}　${current.title}`
      : "当前不在计划时间块内（可继续编辑或复盘）";
  }

  function stampTaskIndexes(root) {
    if (!root) return;
    let i = 0;
    root.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      cb.dataset.taskIndex = String(i++);
    });
  }

  function highlightCurrentHeading(md) {
    const now = new Date();
    const mins = now.getHours() * 60 + now.getMinutes();
    const current = extractBlocks(md).find((b) => mins >= b.start && mins < b.end);
    if (!current) return;
    for (const h of preview.querySelectorAll("h2, h3")) {
      if ((h.textContent || "").includes(current.startToken)) {
        h.classList.add("block-now");
        break;
      }
    }
  }

  function updatePageNav() {
    const total = Math.max(1, pageHtmls.length);
    const idx = Math.min(currentPage, total - 1) + 1;
    if (pageIndicator) pageIndicator.textContent = `${idx} / ${total}`;
    if (btnPagePrev) btnPagePrev.disabled = currentPage <= 0;
    if (btnPageNext) btnPageNext.disabled = currentPage >= total - 1;
    pageNav?.classList.toggle("is-single", total <= 1);
  }

  function showPage(index, { animate } = {}) {
    if (!preview) return;
    const total = Math.max(1, pageHtmls.length);
    const next = Math.max(0, Math.min(index, total - 1));
    const dir = next > currentPage ? "next" : next < currentPage ? "prev" : "";
    currentPage = next;
    preview.innerHTML = pageHtmls[currentPage] || "";
    stampTaskIndexes(preview);
    updatePageNav();
    highlightCurrentHeading(editor.value);
    renderUserStickers();
    if (animate && dir) {
      preview.classList.remove("flip-next", "flip-prev");
      // restart animation
      void preview.offsetWidth;
      preview.classList.add(dir === "next" ? "flip-next" : "flip-prev");
      flipLock = true;
      setTimeout(() => {
        preview.classList.remove("flip-next", "flip-prev");
        flipLock = false;
      }, 380);
    }
  }

  function normalizeStickerPage(s) {
    const n = Number(s.page);
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
  }

  function clampStickersToPageCount() {
    const max = Math.max(0, pageHtmls.length - 1);
    let changed = false;
    for (const s of userStickers) {
      const p = normalizeStickerPage(s);
      if (s.page !== p) {
        s.page = p;
        changed = true;
      }
      if (s.page > max) {
        s.page = max;
        changed = true;
      }
    }
    if (changed) saveUserStickers();
  }

  function getPageContentHeight() {
    const h = preview?.clientHeight || pageStage?.clientHeight || 0;
    if (h > 40) return h;
    const fixed = document.body.dataset.paperFixed === "1";
    return fixed ? 560 : Math.max(320, window.innerHeight * 0.55);
  }

  /** Turn md comments into real DOM markers (HTML comments are often dropped). */
  function preprocessPageBreaks(md) {
    return String(md || "")
      .replace(
        /<!--\s*journal\s*:\s*(pagebreak|page-break|page-top)\s*-->/gi,
        '\n\n<div class="journal-pagebreak" data-pagebreak></div>\n\n'
      )
      .replace(
        /<!--\s*(pagebreak|page-break|page-top)\s*-->/gi,
        '\n\n<div class="journal-pagebreak" data-pagebreak></div>\n\n'
      );
  }

  function isPageBreakMarker(n) {
    if (!n || n.nodeType !== Node.ELEMENT_NODE) return false;
    if (n.hasAttribute?.("data-pagebreak")) return true;
    if (n.classList?.contains("journal-pagebreak")) return true;
    const t = (n.textContent || "").trim().toLowerCase();
    return n.tagName === "P" && (t === "pagebreak" || t === "page-break" || t === "page-top");
  }

  function buildPreviewHtml(md) {
    const source = preprocessPageBreaks(md);
    let html;
    try {
      html = markedReady ? marked.parse(source, { renderer }) : simpleMarkdown(source);
    } catch (err) {
      console.warn(err);
      html = simpleMarkdown(source);
    }
    const wrap = document.createElement("div");
    wrap.innerHTML = html;
    stampTaskIndexes(wrap);
    return wrap.innerHTML;
  }

  function paginateHtml(html) {
    if (!preview || !pageStage) {
      pageHtmls = [html];
      showPage(0);
      return;
    }
    const width = Math.max(200, preview.clientWidth || pageStage.clientWidth || 360);
    const maxH = getPageContentHeight();
    const measure = document.createElement("div");
    measure.className = "preview markdown-body page-measure";
    measure.style.width = `${width}px`;
    measure.style.padding = getComputedStyle(preview).padding;
    measure.style.boxSizing = "border-box";
    measure.style.fontFamily = getComputedStyle(preview).fontFamily;
    measure.style.fontSize = getComputedStyle(preview).fontSize;
    measure.style.lineHeight = getComputedStyle(preview).lineHeight;
    document.body.appendChild(measure);

    const source = document.createElement("div");
    source.innerHTML = html;
    const blocks = [...source.childNodes].filter((n) => {
      if (n.nodeType === Node.TEXT_NODE) return String(n.textContent || "").trim();
      if (n.nodeType === Node.ELEMENT_NODE) return true;
      return false;
    });

    if (!blocks.length) {
      pageHtmls = [""];
      document.body.removeChild(measure);
      showPage(0);
      return;
    }

    const pages = [];
    let pageNodes = [];

    const measureHeight = (nodes) => {
      measure.innerHTML = "";
      for (const n of nodes) {
        if (isPageBreakMarker(n)) continue;
        measure.appendChild(n.cloneNode(true));
      }
      return measure.scrollHeight;
    };

    const fitsNodes = (nodes) => measureHeight(nodes) <= maxH + 1;

    const isTable = (n) => n && n.nodeType === Node.ELEMENT_NODE && n.tagName === "TABLE";

    const sealPage = () => {
      if (!pageNodes.length) return;
      pages.push(pageNodes);
      pageNodes = [];
    };

    const extractTableParts = (table) => {
      const thead = table.querySelector("thead");
      const tbody = table.querySelector("tbody");
      let header = thead ? thead.cloneNode(true) : null;
      let rows = tbody
        ? [...tbody.querySelectorAll(":scope > tr")].map((r) => r.cloneNode(true))
        : [...table.querySelectorAll(":scope > tr")].map((r) => r.cloneNode(true));
      // Some renderers put header row as first tr without thead
      if (!header && rows.length && rows[0].querySelector("th")) {
        header = document.createElement("thead");
        header.appendChild(rows.shift());
      }
      return { header, rows, attrs: [...table.attributes] };
    };

    const buildTable = (parts, rowSlice) => {
      const t = document.createElement("table");
      for (const attr of parts.attrs) t.setAttribute(attr.name, attr.value);
      if (parts.header) t.appendChild(parts.header.cloneNode(true));
      const tb = document.createElement("tbody");
      for (const r of rowSlice) tb.appendChild(r.cloneNode(true));
      t.appendChild(tb);
      return t;
    };

    /** Split a tall table across pages; continue header on each chunk. */
    const appendTable = (table) => {
      const parts = extractTableParts(table);
      if (!parts.rows.length) {
        pageNodes.push(table);
        if (!fitsNodes(pageNodes)) {
          pageNodes.pop();
          if (pageNodes.length) pages.push(pageNodes);
          pages.push([table]);
          pageNodes = [];
        }
        return;
      }

      let i = 0;
      while (i < parts.rows.length) {
        let took = 0;
        // Greedily pack as many rows as fit on the current page
        while (i + took < parts.rows.length) {
          const trial = buildTable(parts, parts.rows.slice(i, i + took + 1));
          if (!fitsNodes([...pageNodes, trial])) break;
          took += 1;
        }

        if (took > 0) {
          pageNodes.push(buildTable(parts, parts.rows.slice(i, i + took)));
          i += took;
          // Page is full (or table finished): if more rows remain, seal this page
          if (i < parts.rows.length) {
            pages.push(pageNodes);
            pageNodes = [];
          }
          continue;
        }

        // Nothing fit: current page already has content → new page and retry
        if (pageNodes.length) {
          pages.push(pageNodes);
          pageNodes = [];
          continue;
        }

        // Empty page but a single row still overflows → force one row (avoid infinite loop)
        pageNodes.push(buildTable(parts, [parts.rows[i]]));
        pages.push(pageNodes);
        pageNodes = [];
        i += 1;
      }
    };

    for (const block of blocks) {
      const node = block.cloneNode(true);

      // <!-- pagebreak --> / <!-- page-top --> → force following content onto a new page
      if (isPageBreakMarker(node)) {
        sealPage();
        continue;
      }

      if (isTable(node)) {
        // Try whole table first (keeps short tables intact)
        pageNodes.push(node);
        if (fitsNodes(pageNodes)) continue;
        pageNodes.pop();
        appendTable(node);
        continue;
      }

      pageNodes.push(node);
      if (fitsNodes(pageNodes)) continue;
      pageNodes.pop();
      if (pageNodes.length) {
        pages.push(pageNodes);
        pageNodes = [node];
        if (!fitsNodes(pageNodes)) {
          pages.push(pageNodes);
          pageNodes = [];
        }
      } else {
        pages.push([node]);
        pageNodes = [];
      }
    }
    if (pageNodes.length) pages.push(pageNodes);

    pageHtmls = pages.map((nodes) => {
      measure.innerHTML = "";
      for (const n of nodes) {
        if (isPageBreakMarker(n)) continue;
        measure.appendChild(n);
      }
      return measure.innerHTML;
    });
    if (!pageHtmls.length) pageHtmls = [""];

    document.body.removeChild(measure);
    clampStickersToPageCount();
    const keep = Math.min(currentPage, pageHtmls.length - 1);
    showPage(keep);
  }

  function schedulePaginate(html) {
    latestPreviewHtml = html;
    clearTimeout(paginateTimer);
    paginateTimer = setTimeout(() => {
      requestAnimationFrame(() => paginateHtml(latestPreviewHtml));
    }, 60);
  }

  function render() {
    const md = editor.value;
    const html = buildPreviewHtml(md);
    schedulePaginate(html);
    updateProgress(md);
    updateNowBar(md);
  }

  function goPage(delta) {
    if (flipLock) return;
    const next = currentPage + delta;
    if (next < 0 || next >= pageHtmls.length) return;
    showPage(next, { animate: true });
  }

  /** Skin paper.size / orientation / aspect control preview ratio only — not ISO trays. */
  const PAPER_SIZE_META = {
    a4: {
      label: "A4比例",
      chip: "A4比例",
      chipLandscape: "A4横",
      w: 210,
      h: 297,
      paneMax: "42rem",
      paneMaxLandscape: "52rem",
      hint: "预览竖页比例（非打印机 A4）。可用 orientation/aspect 改横页或自定义比。",
    },
    a5: {
      label: "A5比例",
      chip: "A5比例",
      chipLandscape: "A5横",
      w: 148,
      h: 210,
      paneMax: "30rem",
      paneMaxLandscape: "44rem",
      hint: "预览竖页比例（非打印机 A5）。可用 orientation/aspect 改横页或自定义比。",
    },
    b6: {
      label: "B6比例",
      chip: "B6比例",
      chipLandscape: "B6横",
      w: 125,
      h: 176,
      paneMax: "24rem",
      paneMaxLandscape: "38rem",
      hint: "预览小竖页比例（非打印机 B6）。可用 orientation/aspect 改横页或自定义比。",
    },
    square: {
      label: "方形比例",
      chip: "方形",
      chipLandscape: "方形",
      w: 1,
      h: 1,
      paneMax: "28rem",
      paneMaxLandscape: "28rem",
      hint: "预览 1:1 比例。也可用 paper.aspect 自定义。",
    },
    wide: {
      label: "横宽铺满",
      chip: "横宽",
      chipLandscape: "横宽",
      w: 297,
      h: 210,
      paneMax: "none",
      paneMaxLandscape: "none",
      hint: "预览铺满工作区（偏横向）。写 paper.aspect 时可改为固定比例页。",
    },
    full: {
      label: "铺满",
      chip: "铺满",
      chipLandscape: "铺满",
      w: 210,
      h: 297,
      paneMax: "none",
      paneMaxLandscape: "none",
      hint: "预览铺满工作区。写 paper.aspect 时可改为固定比例页。",
    },
  };

  function paperSizeMeta(size) {
    return PAPER_SIZE_META[size] || PAPER_SIZE_META.a4;
  }

  /** Parse paper.aspect → CSS aspect-ratio value, or null if invalid. */
  function parsePaperAspect(raw) {
    if (raw == null) return null;
    const s = String(raw).trim();
    if (!s) return null;
    const ratio = s.match(/^(\d+(?:\.\d+)?)\s*[\/:]\s*(\d+(?:\.\d+)?)$/);
    if (ratio) {
      const a = Number(ratio[1]);
      const b = Number(ratio[2]);
      if (!(a > 0 && b > 0)) return null;
      return `${a} / ${b}`;
    }
    const n = Number(s);
    if (Number.isFinite(n) && n > 0) return String(n);
    return null;
  }

  function resolvePaperGeometry(paper) {
    const p = paper || {};
    const size = p.size || "full";
    const meta = paperSizeMeta(size);
    const orientRaw = String(p.orientation || "portrait").toLowerCase();
    const landscape = orientRaw === "landscape" || orientRaw === "horizontal" || orientRaw === "横";
    const customAspect = parsePaperAspect(p.aspect);
    const presetFixed = ["a4", "a5", "b6", "square"].includes(size);

    let aspectCss = null;
    let fixed = false;
    let chip = meta.chip;
    let hint = meta.hint;
    let paneMax = meta.paneMax;
    let orient = "portrait";

    if (customAspect) {
      fixed = true;
      aspectCss = customAspect;
      chip = "自定义比";
      hint = `自定义预览比例 ${customAspect}（非打印机纸型）。导出 PDF 按屏幕成品页。`;
      const m = customAspect.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
      if (m) {
        const aw = Number(m[1]);
        const ah = Number(m[2]);
        orient = aw >= ah ? "landscape" : "portrait";
        paneMax = orient === "landscape" ? "48rem" : "36rem";
      } else {
        orient = Number(customAspect) >= 1 ? "landscape" : "portrait";
        paneMax = orient === "landscape" ? "48rem" : "36rem";
      }
    } else if (presetFixed) {
      fixed = true;
      let w = meta.w;
      let h = meta.h;
      if (landscape && size !== "square") {
        const t = w;
        w = h;
        h = t;
        orient = "landscape";
        chip = meta.chipLandscape || `${meta.chip.replace(/比例$/, "")}横`;
        paneMax = meta.paneMaxLandscape || meta.paneMax;
        hint = `预览横页比例（基于 ${size}，非打印机纸型）。导出 PDF 按屏幕成品页。`;
      } else {
        orient = "portrait";
        chip = meta.chip;
        paneMax = meta.paneMax;
      }
      aspectCss = `${w} / ${h}`;
    } else {
      // full / wide: fluid unless custom aspect already handled
      fixed = false;
      aspectCss = null;
      orient = size === "wide" || landscape ? "landscape" : "portrait";
      chip = meta.chip;
      paneMax = "none";
    }

    return {
      size,
      fixed,
      aspectCss,
      orient,
      chip,
      hint,
      paneMax,
      landscape: orient === "landscape",
      custom: !!customAspect,
    };
  }

  function paperSizeChipLabel(paperOrSize) {
    if (paperOrSize && typeof paperOrSize === "object") {
      return resolvePaperGeometry(paperOrSize).chip;
    }
    return resolvePaperGeometry({ size: paperOrSize || "a4" }).chip;
  }

  function printPaperSpec() {
    const size = document.body.dataset.paperSize || "a4";
    const meta = paperSizeMeta(size);
    const geo = resolvePaperGeometry({
      size,
      orientation: document.body.dataset.paperOrient || "portrait",
      aspect: document.body.dataset.paperAspect || undefined,
    });
    return {
      label: geo.chip,
      cssSize: geo.aspectCss ? undefined : `${meta.w}mm ${meta.h}mm`,
      width: `${meta.w}mm`,
      height: `${meta.h}mm`,
      hint: geo.hint,
    };
  }

  function cssVar(name, fallback) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }

  /** Mix a CSS color with white; amount = weight of the base color (0–1). Returns #rrggbb. */
  function mixCssColorWithWhite(cssColor, amount = 0.7) {
    const t = Math.min(1, Math.max(0, Number(amount) || 0));
    const probe = document.createElement("div");
    probe.style.color = cssColor || "#e7a8b2";
    probe.style.position = "absolute";
    probe.style.visibility = "hidden";
    document.body.appendChild(probe);
    const resolved = getComputedStyle(probe).color;
    probe.remove();
    const m = String(resolved).match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
    let r = 231;
    let g = 168;
    let b = 178;
    if (m) {
      r = Number(m[1]);
      g = Number(m[2]);
      b = Number(m[3]);
    } else {
      // Chrome may return color(srgb …); normalize via canvas
      try {
        const ctx = document.createElement("canvas").getContext("2d");
        ctx.fillStyle = "#000";
        ctx.fillStyle = cssColor || "#e7a8b2";
        const hex = String(ctx.fillStyle);
        const hm = hex.match(/^#([0-9a-f]{6})$/i);
        if (hm) {
          r = parseInt(hm[1].slice(0, 2), 16);
          g = parseInt(hm[1].slice(2, 4), 16);
          b = parseInt(hm[1].slice(4, 6), 16);
        }
      } catch (_) {
        /* keep defaults */
      }
    }
    const mix = (c) => Math.round(c * t + 255 * (1 - t));
    const toHex = (n) => Math.min(255, Math.max(0, n)).toString(16).padStart(2, "0");
    return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
  }

  function stickerPrintMarkup(s) {
    const shape = escapeHtml(s.shape || "note");
    const text = escapeHtml(s.text || "贴纸");
    const x = Number(s.x);
    const y = Number(s.y);
    const width = Number(s.width) || 128;
    const rotate = Number(s.rotate) || 0;
    const bg = escapeHtml(s.bg || "#fff8f4");
    const ink = escapeHtml(s.ink || "#4a3d42");
    return `<div class="user-sticker shape-${shape}" style="left:${Number.isFinite(x) ? x : 70}%;top:${
      Number.isFinite(y) ? y : 22
    }%;--sticker-w:${width}px;--sticker-rot:${rotate}deg;--sticker-bg:${bg};--sticker-ink:${ink}"><div class="sticker-face"><div class="sticker-text">${text}</div></div></div>`;
  }

  function buildPrintableDocument({ includeStickers = false } = {}) {
    const html = latestPreviewHtml || buildPreviewHtml(editor.value);
    let sheets = pageHtmls.filter((s) => s != null);
    if (!sheets.length || (sheets.length === 1 && !String(sheets[0]).trim() && html)) {
      sheets = [html];
    }
    if (!sheets.some((s) => String(s).trim())) {
      sheets = ["<p>（当前没有可导出的内容）</p>"];
    }

    // Capture the live 成品页 box so export is a uniform scale of the same canvas.
    const stageW = Math.max(280, Math.round(pageStage?.clientWidth || preview?.clientWidth || 480));
    const stageH = Math.max(360, Math.round(pageStage?.clientHeight || preview?.clientHeight || 680));
    const previewCs = preview ? getComputedStyle(preview) : null;
    const pad = previewCs
      ? `${previewCs.paddingTop} ${previewCs.paddingRight} ${previewCs.paddingBottom} ${previewCs.paddingLeft}`
      : "0.7rem 1.25rem 1.2rem 2.6rem";
    const fontSize = previewCs?.fontSize || "1.12rem";
    const lineHeight = previewCs?.lineHeight || cssVar("--line-gap", "1.7rem");
    const fontFamily = previewCs?.fontFamily || cssVar("--font-read", '"Gaegu", sans-serif');

    const paper = printPaperSpec();
    const title = (currentPath && currentPath.split("/").pop()) || "青叶笺-成品页";
    const ink = cssVar("--ink", "#3d4a45");
    const paperBg = cssVar("--paper", "#f8faf7");
    const sage = cssVar("--sage-deep", "#5a8f7f");
    const blush = cssVar("--blush", "#e7a8b2");
    // Match screen: color-mix(in srgb, var(--blush) 70%, white)
    const blushSoft = mixCssColorWithWhite(blush, 0.7);
    const lineColor = cssVar("--line-color", "rgba(120,150,140,0.22)");
    const lineGap = cssVar("--line-gap", "1.7rem");
    const lineOffset = cssVar("--line-offset", "2.6rem");
    const marginLeft = cssVar("--margin-left", "2.1rem");
    const marginColor = cssVar("--margin-color", "rgba(231,168,178,0.45)");
    const fontHand = cssVar("--font-hand", '"Ma Shan Zheng", cursive');
    const radius = cssVar("--paper-radius", "18px");
    const linesOn = document.body.dataset.lines !== "off";
    const lineStyle = document.body.dataset.lineStyle || "solid";
    const marginOn = document.body.dataset.margin !== "off";

    const bgImages = [];
    const bgSizes = [];
    const bgPositions = [];
    const bgRepeats = [];
    if (linesOn && lineStyle === "solid") {
      bgImages.push(`linear-gradient(${lineColor} 1px, transparent 1px)`);
      bgSizes.push(`100% ${lineGap}`);
      bgPositions.push(`0 ${lineOffset}`);
      bgRepeats.push("repeat");
    } else if (linesOn && lineStyle === "grid") {
      bgImages.push(
        `linear-gradient(${lineColor} 1px, transparent 1px)`,
        `linear-gradient(90deg, ${lineColor} 1px, transparent 1px)`
      );
      bgSizes.push(`${lineGap} ${lineGap}`, `${lineGap} ${lineGap}`);
      bgPositions.push(`0 ${lineOffset}`, `0 ${lineOffset}`);
      bgRepeats.push("repeat", "repeat");
    } else if (linesOn && lineStyle === "dotted") {
      bgImages.push(`radial-gradient(circle, ${lineColor} 1.1px, transparent 1.25px)`);
      bgSizes.push(`${lineGap} ${lineGap}`);
      bgPositions.push(`0.4rem ${lineOffset}`);
      bgRepeats.push("repeat");
    } else if (linesOn && lineStyle === "dashed") {
      bgImages.push(
        `repeating-linear-gradient(to bottom, transparent 0, transparent calc(${lineGap} - 1px), ${lineColor} calc(${lineGap} - 1px), ${lineColor} ${lineGap})`
      );
      bgSizes.push("100% 100%");
      bgPositions.push(`0 ${lineOffset}`);
      bgRepeats.push("no-repeat");
    }
    if (marginOn) {
      bgImages.push(
        `linear-gradient(90deg, transparent ${marginLeft}, ${marginColor} ${marginLeft}, ${marginColor} calc(${marginLeft} + 1px), transparent calc(${marginLeft} + 1px))`
      );
      bgSizes.push("100% 100%");
      bgPositions.push("0 0");
      bgRepeats.push("no-repeat");
    }
    const sheetBgImage = bgImages.length ? bgImages.join(", ") : "none";
    const sheetBgSize = bgSizes.length ? bgSizes.join(", ") : "auto";
    const sheetBgPosition = bgPositions.length ? bgPositions.join(", ") : "0 0";
    const sheetBgRepeat = bgRepeats.length ? bgRepeats.join(", ") : "no-repeat";

    // Path B: PDF page size === 成品页 canvas size (no reflow, no fit-to-A4).
    const pageWmm = ((stageW * 25.4) / 96).toFixed(3);
    const pageHmm = ((stageH * 25.4) / 96).toFixed(3);
    const pageSizeCss = `${pageWmm}mm ${pageHmm}mm`;

    const pagesHtml = sheets
      .map((body, i) => {
        const stickersHtml = includeStickers
          ? userStickers
              .filter((s) => normalizeStickerPage(s) === i)
              .map(stickerPrintMarkup)
              .join("")
          : "";
        return `
      <section class="sheet" aria-label="第 ${i + 1} 页">
        <div class="sheet-frame">
          <div class="sheet-canvas">
            <div class="sheet-inner markdown-body preview">${body}</div>
            ${stickersHtml ? `<div class="sheet-stickers">${stickersHtml}</div>` : ""}
            <div class="sheet-folio">${i + 1} / ${sheets.length}</div>
          </div>
        </div>
      </section>`;
      })
      .join("\n");

    const fileBase =
      (title.replace(/\.md$/i, "").replace(/[\\/:*?"<>|]+/g, "_") || "journal-export") +
      (includeStickers ? "-贴纸" : "");
    // Absolute lib URLs so blob: print window can still load them.
    const libBase = new URL("./", window.location.href).href;

    return {
      title,
      fileBase,
      paper,
      includeStickers,
      stageW,
      stageH,
      pageWmm: Number(pageWmm),
      pageHmm: Number(pageHmm),
      html: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(title)} · 导出</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Gaegu:wght@400;700&family=Liu+Jian+Mao+Cao&family=Long+Cang&family=Ma+Shan+Zheng&family=Noto+Sans+SC:wght@400;500;700&family=ZCOOL+XiaoWei&family=Zhi+Mang+Xing&display=swap" rel="stylesheet" />
  <style>
    :root {
      --ink: ${ink};
      --paper: ${paperBg};
      --sage-deep: ${sage};
      --blush: ${blush};
      --font-read: ${fontFamily};
      --font-hand: ${fontHand};
      --stage-w: ${stageW}px;
      --stage-h: ${stageH}px;
      --page-w-mm: ${pageWmm}mm;
      --page-h-mm: ${pageHmm}mm;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      color: var(--ink);
      background: #fff;
      font-family: var(--font-read);
    }
    .toolbar {
      position: sticky;
      top: 0;
      z-index: 10;
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
      padding: 0.75rem 1rem;
      background: rgba(255,255,255,0.92);
      border-bottom: 1px solid rgba(90,120,110,0.2);
      font-family: "Noto Sans SC", sans-serif;
      font-size: 0.9rem;
    }
    .toolbar button, .toolbar a.btn {
      border: 1px solid rgba(90,120,110,0.25);
      background: #fff;
      border-radius: 999px;
      padding: 0.4rem 0.9rem;
      cursor: pointer;
      font: inherit;
      color: inherit;
      text-decoration: none;
    }
    .toolbar .primary {
      background: ${sage};
      color: #fff;
      border-color: transparent;
    }
    .toolbar .hint { color: #66756e; }
    .pages {
      padding: 1rem;
      display: grid;
      gap: 1rem;
      justify-items: center;
      background: #fff;
    }
    /* Screen: same canvas as 成品页 (no reflow) */
    .sheet {
      width: var(--stage-w);
      height: var(--stage-h);
      max-width: 100%;
      position: relative;
      overflow: hidden;
      border-radius: ${radius};
      box-shadow: 0 8px 24px rgba(60,80,70,0.12);
      background: var(--paper);
      page-break-after: always;
      break-after: page;
      page-break-inside: avoid;
      break-inside: avoid;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .sheet:last-child { page-break-after: auto; break-after: auto; }
    .sheet-frame {
      width: var(--stage-w);
      height: var(--stage-h);
      flex: 0 0 auto;
      position: relative;
      transform-origin: center center;
    }
    .sheet-canvas {
      position: relative;
      width: var(--stage-w);
      height: var(--stage-h);
      background-color: var(--paper);
      background-image: ${sheetBgImage};
      background-size: ${sheetBgSize};
      background-position: ${sheetBgPosition};
      background-repeat: ${sheetBgRepeat};
      overflow: hidden;
    }
    .sheet-inner {
      width: 100%;
      height: 100%;
      overflow: hidden;
      padding: ${pad};
      font-family: ${fontFamily};
      font-size: ${fontSize};
      line-height: ${lineHeight};
      color: var(--ink);
    }
    .sheet-stickers {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 4;
    }
    .user-sticker {
      position: absolute;
      width: var(--sticker-w, 128px);
      transform: translate(-50%, -50%) rotate(var(--sticker-rot, 0deg));
      transform-origin: center center;
    }
    .user-sticker .sticker-face {
      min-height: 3.2rem;
      padding: 0.7rem 0.8rem;
      display: grid;
      place-items: center;
      text-align: center;
      background: var(--sticker-bg, #fff8f4);
      color: var(--sticker-ink, #4a3d42);
      border: 2px solid rgba(255,255,255,0.92);
      box-shadow: 0 6px 14px rgba(55,70,65,0.16);
      font-family: var(--font-read);
      font-size: 0.98rem;
      line-height: 1.25;
      word-break: break-word;
    }
    .user-sticker.shape-note .sticker-face { border-radius: 14px; }
    .user-sticker.shape-round .sticker-face { border-radius: 50%; aspect-ratio: 1; }
    .user-sticker.shape-oval .sticker-face { border-radius: 50%; aspect-ratio: 1.45 / 1; }
    .user-sticker.shape-washi .sticker-face { border-radius: 3px; border-style: dashed; opacity: 0.95; }
    .user-sticker.shape-ticket .sticker-face { border-radius: 6px; border: 1.5px dashed rgba(0,0,0,0.15); }
    .user-sticker.shape-heart .sticker-face { border-radius: 55% 55% 48% 48% / 48% 48% 62% 62%; border: 0; }
    .user-sticker.shape-cloud .sticker-face { border-radius: 40% 45% 40% 42% / 55% 50% 55% 48%; }
    .sheet-folio {
      position: absolute;
      right: 0.75rem;
      bottom: 0.45rem;
      font-size: 0.75rem;
      color: #8a9690;
      font-family: "Noto Sans SC", sans-serif;
      z-index: 5;
    }
    .markdown-body h1, .markdown-body h2, .markdown-body h3 {
      font-family: var(--font-hand);
      font-weight: 400;
      color: var(--sage-deep);
      margin: 1.25rem 0 0.55rem;
      line-height: 1.25;
    }
    .markdown-body h1 { font-size: 2rem; border-bottom: 2px dashed ${blushSoft}; padding-bottom: 0.4rem; }
    .markdown-body h2 { font-size: 1.55rem; }
    .markdown-body h3 { font-size: 1.28rem; }
    .markdown-body table { width: 100%; border-collapse: collapse; margin: 0.6em 0; font-size: 0.95em; }
    .markdown-body th, .markdown-body td { border: 1px dashed rgba(90,120,110,0.35); padding: 0.35em 0.5em; }
    .markdown-body blockquote {
      margin: 0.7em 0; padding: 0.5em 0.8em;
      border-left: 4px solid var(--blush);
      background: rgba(231,168,178,0.12);
    }
    .markdown-body ul { padding-left: 1.2em; }
    .task-item { list-style: none; margin-left: -0.6em; }
    .task-item input { margin-right: 0.4em; }
    .task-item.done .task-text { text-decoration: line-through; opacity: 0.7; }
    /* PDF page size = 成品页画布尺寸（与屏幕分页同一套宽高，不重排、不缩进 A4） */
    @page { size: ${pageSizeCss}; margin: 0; }
    @media print {
      html, body {
        background: var(--paper) !important;
        margin: 0 !important;
        width: ${stageW}px !important;
        height: auto !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .toolbar { display: none !important; }
      .pages {
        padding: 0 !important;
        gap: 0 !important;
        background: var(--paper) !important;
        width: ${stageW}px !important;
      }
      .sheet {
        box-shadow: none !important;
        border-radius: 0 !important;
        width: ${stageW}px !important;
        height: ${stageH}px !important;
        max-width: none !important;
        margin: 0 !important;
        background: var(--paper) !important;
        overflow: hidden !important;
        display: block !important;
        break-after: page;
        page-break-after: always;
      }
      .sheet:last-child {
        break-after: auto;
        page-break-after: auto;
      }
      .sheet-frame,
      .sheet-canvas {
        width: ${stageW}px !important;
        height: ${stageH}px !important;
        transform: none !important;
      }
      .sheet-canvas {
        background-color: var(--paper) !important;
      }
    }
  </style>
</head>
<body>
  <div class="toolbar no-print">
    <strong>成品页导出</strong>
    <span class="hint" id="exportHint">${sheets.length} 页 · ${
      includeStickers ? "含贴纸" : "不含贴纸"
    } · 画布 ${stageW}×${stageH}px（约 ${pageWmm}×${pageHmm}mm）· PDF 请回主界面导出</span>
    <a class="btn primary" id="dlHtml" href="#" download="${escapeHtml(fileBase)}.html">下载 HTML</a>
    <button type="button" class="btn" id="btnDoPrint" title="系统打印往往无法使用自定义页面尺寸">系统打印…</button>
    <button type="button" onclick="window.close()">关闭</button>
  </div>
  <div class="pages">${pagesHtml}</div>
  <script>
    (function () {
      var a = document.getElementById("dlHtml");
      if (a) {
        var blob = new Blob([document.documentElement.outerHTML], { type: "text/html;charset=utf-8" });
        a.href = URL.createObjectURL(blob);
      }
      function waitFonts() {
        if (document.fonts && document.fonts.ready) return document.fonts.ready.catch(function () {});
        return Promise.resolve();
      }
      var printBtn = document.getElementById("btnDoPrint");
      if (printBtn) {
        printBtn.addEventListener("click", function () {
          waitFonts().then(function () { window.print(); });
        });
      }
    })();
  <\/script>
</body>
</html>`,
    };
  }

  function downloadTextFile(filename, text, mime) {
    const blob = new Blob([text], { type: mime || "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  const exportModal = document.getElementById("exportModal");
  const exportStatus = document.getElementById("exportStatus");

  function setExportStatus(text, isError = false) {
    if (!exportStatus) return;
    exportStatus.textContent = text || "";
    exportStatus.classList.toggle("is-error", !!isError);
  }

  function closeExportModal() {
    if (!exportModal) return;
    if (exportModal.close) exportModal.close();
    else exportModal.removeAttribute("open");
  }

  async function openExportModal() {
    const n = userStickers.length;
    const pages = Math.max(1, pageHtmls.length);
    const pdfBtns = [
      document.getElementById("btnExportWithStickers"),
      document.getElementById("btnExportPlain"),
    ].filter(Boolean);
    const qualityInputs = [...document.querySelectorAll('input[name="pdfQuality"]')];

    if (exportModal.showModal) exportModal.showModal();
    else exportModal.setAttribute("open", "open");

    if (demoMode) {
      pdfBtns.forEach((b) => {
        b.disabled = true;
        b.title = "在线 Demo 不提供 PDF，请下载桌面版";
      });
      qualityInputs.forEach((el) => {
        el.disabled = true;
      });
      setExportStatus(
        "在线 Demo 不提供 PDF 导出。可「打开导出页」下载 HTML，或使用桌面版导出 PDF。"
      );
      return;
    }

    pdfBtns.forEach((b) => {
      b.disabled = false;
      b.title = "";
    });
    qualityInputs.forEach((el) => {
      el.disabled = false;
    });

    setExportStatus(n ? `准备导出 · ${pages} 页 · 贴纸 ${n} 张` : `准备导出 · ${pages} 页`);
    const caps = await probeVectorPdfSupport();
    const vectorRadio = document.querySelector('input[name="pdfQuality"][value="vector"]');
    if (vectorRadio) {
      vectorRadio.disabled = !caps.vector;
      if (!caps.vector) {
        const hd = document.querySelector('input[name="pdfQuality"][value="hd"]');
        if (hd) hd.checked = true;
        setExportStatus(
          (n ? `准备导出 · ${pages} 页 · 贴纸 ${n} 张` : `准备导出 · ${pages} 页`) +
            " · 未检测到 Edge/Chrome，已改用位图"
        );
      } else {
        setExportStatus(
          (n ? `准备导出 · ${pages} 页 · 贴纸 ${n} 张` : `准备导出 · ${pages} 页`) +
            " · 可用矢量（无头打印）"
        );
      }
    }
  }

  function loadScriptOnce(src) {
    const abs = new URL(src, window.location.href).href;
    if ([...document.scripts].some((s) => s.src === abs)) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`脚本加载失败：${src}`));
      document.head.appendChild(s);
    });
  }

  async function ensurePdfLibs() {
    if (!window.html2canvas) await loadScriptOnce("html2canvas.min.js");
    if (!((window.jspdf && window.jspdf.jsPDF) || window.jsPDF)) {
      await loadScriptOnce("jspdf.umd.min.js");
    }
    if (!window.html2canvas) throw new Error("未加载 html2canvas");
    const jsPDF = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
    if (!jsPDF) throw new Error("未加载 jsPDF");
    return jsPDF;
  }

  function cssColorToRgb(value) {
    if (!value || value === "transparent" || value === "none" || value === "currentcolor") {
      return value;
    }
    if (!/color\(|lab\(|lch\(|oklab\(|oklch\(|color-mix\(/i.test(value)) return value;
    try {
      const ctx =
        cssColorToRgb._ctx || (cssColorToRgb._ctx = document.createElement("canvas").getContext("2d"));
      ctx.fillStyle = "#000000";
      ctx.fillStyle = value;
      return ctx.fillStyle || value;
    } catch (_) {
      return value;
    }
  }

  function sanitizeCloneColors(clonedDoc) {
    const win = clonedDoc.defaultView || window;
    const props = [
      "color",
      "backgroundColor",
      "borderTopColor",
      "borderRightColor",
      "borderBottomColor",
      "borderLeftColor",
      "outlineColor",
      "textDecorationColor",
      "columnRuleColor",
      "caretColor",
    ];
    const cssProps = [
      "color",
      "background-color",
      "border-top-color",
      "border-right-color",
      "border-bottom-color",
      "border-left-color",
      "outline-color",
      "text-decoration-color",
      "column-rule-color",
      "caret-color",
    ];
    clonedDoc.querySelectorAll("*").forEach((el) => {
      let cs;
      try {
        cs = win.getComputedStyle(el);
      } catch (_) {
        return;
      }
      props.forEach((prop, i) => {
        const raw = cs[prop];
        const fixed = cssColorToRgb(raw);
        if (fixed && fixed !== raw) el.style.setProperty(cssProps[i], fixed, "important");
      });
    });
  }

  function buildCaptureHtml(fullHtml) {
    // Capture in a same-origin iframe; drop export-page scripts (libs live in the app).
    return String(fullHtml || "").replace(/<script\b[\s\S]*?<\/script>/gi, "");
  }

  function triggerBlobDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  /** PDF quality: vector (headless Chromium) or raster fallbacks. */
  function getPdfQualityPreset() {
    const picked =
      document.querySelector('input[name="pdfQuality"]:checked')?.value || "vector";
    if (picked === "standard") {
      return {
        id: "standard",
        scaleCap: 2,
        mime: "image/jpeg",
        imageType: "JPEG",
        jpegQuality: 0.93,
        compress: "MEDIUM",
        label: "标准位图",
      };
    }
    if (picked === "hd") {
      return {
        id: "hd",
        scaleCap: 3,
        mime: "image/png",
        imageType: "PNG",
        jpegQuality: undefined,
        compress: "NONE",
        label: "高清位图",
      };
    }
    return {
      id: "vector",
      label: "矢量",
    };
  }

  async function probeVectorPdfSupport() {
    if (demoMode) return { vector: false, browser: null };
    try {
      const res = await fetch("/api/export-pdf/capabilities", { cache: "no-store" });
      if (!res.ok) return { vector: false, browser: null };
      return await res.json();
    } catch (_) {
      return { vector: false, browser: null };
    }
  }

  async function exportPdfVector({ doc, filename, fileHandle }) {
    setExportStatus("正在无头矢量打印（Edge/Chrome）…");
    setStatus("正在无头矢量打印…");
    const res = await fetch("/api/export-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html: doc.html, filename }),
    });
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const data = await res.json();
        if (data && data.error) msg = data.error;
      } catch (_) {
        /* ignore */
      }
      throw new Error(msg);
    }
    const blob = await res.blob();
    if (!blob || blob.size < 64) throw new Error("矢量 PDF 为空");
    if (fileHandle) {
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
    } else {
      triggerBlobDownload(blob, filename);
    }
    const msg = `已保存矢量 PDF · ${Math.max(1, pageHtmls.length)} 页 · ${doc.stageW}×${doc.stageH}px（约 ${doc.pageWmm}×${doc.pageHmm}mm）· ${(
      blob.size / 1024
    ).toFixed(0)} KB`;
    setExportStatus(msg);
    setStatus(msg);
  }

  function pdfCaptureScale(scaleCap) {
    const dpr = Number(window.devicePixelRatio) || 1;
    const cap = Math.max(1, Number(scaleCap) || 2);
    return Math.min(cap, Math.max(2, dpr * 2));
  }

  function canvasToPdfImage(canvas, preset) {
    if (preset.imageType === "JPEG") {
      return canvas.toDataURL("image/jpeg", preset.jpegQuality ?? 0.92);
    }
    return canvas.toDataURL("image/png");
  }

  async function exportPdfDirect({ includeStickers = false } = {}) {
    if (demoMode) {
      setExportStatus("在线 Demo 不提供 PDF 导出，请下载桌面版。", true);
      alert("在线 Demo 不提供 PDF 导出，请下载桌面版。");
      return;
    }
    const btns = [
      document.getElementById("btnExportWithStickers"),
      document.getElementById("btnExportPlain"),
      document.getElementById("btnExportOpenPage"),
    ].filter(Boolean);
    btns.forEach((b) => {
      b.disabled = true;
    });
    let host = null;
    let fileHandle = null;
    try {
      const quality = getPdfQualityPreset();
      setExportStatus(`正在准备${quality.label} PDF…`);
      const html = buildPreviewHtml(editor.value);
      latestPreviewHtml = html;
      paginateHtml(html);
      const doc = buildPrintableDocument({ includeStickers });
      const filename = `${doc.fileBase}.pdf`;
      const stageW = doc.stageW;
      const stageH = doc.stageH;
      const pageWmm = doc.pageWmm;
      const pageHmm = doc.pageHmm;

      // Ask for save path immediately (user-gesture window) before long render.
      // 桌面模式（pywebview）跳过 showSaveFilePicker，改由 Python 端弹保存对话框
      if (!IS_PYWEBVIEW && window.showSaveFilePicker) {
        try {
          fileHandle = await window.showSaveFilePicker({
            suggestedName: filename,
            types: [
              {
                description: "PDF",
                accept: { "application/pdf": [".pdf"] },
              },
            ],
          });
        } catch (err) {
          if (err && err.name === "AbortError") {
            setExportStatus("已取消保存");
            setStatus("已取消 PDF 保存");
            return;
          }
          fileHandle = null;
        }
      }

      if (quality.id === "vector") {
        if (demoMode) {
          throw new Error("网页 Demo 不支持矢量导出，请改用「高清位图」或本地程序");
        }
        if (IS_PYWEBVIEW) {
          // 桌面模式：直接调 Python 生成矢量 PDF + 弹保存对话框
          setExportStatus("正在无头矢量打印…");
          setStatus("正在无头矢量打印…");
          const result = await window.pywebview.api.save_pdf_vector(doc.html, filename);
          if (result && result.startsWith("ERROR:")) {
            throw new Error(result.substring(6).trim());
          }
          if (!result) {
            setExportStatus("已取消保存");
            setStatus("已取消 PDF 保存");
            return;
          }
          const msg = `已保存矢量 PDF · ${Math.max(1, pageHtmls.length)} 页 · ${doc.stageW}×${doc.stageH}px（约 ${doc.pageWmm}×${doc.pageHmm}mm）`;
          setExportStatus(msg);
          setStatus(msg);
          closeExportModal();
          return;
        }
        const caps = await probeVectorPdfSupport();
        if (!caps.vector) {
          throw new Error(
            "未检测到 Edge/Chrome，无法矢量导出。请安装 Edge，或改选「高清位图」"
          );
        }
        await exportPdfVector({ doc, filename, fileHandle });
        closeExportModal();
        return;
      }

      const jsPDF = await ensurePdfLibs();
      host = document.createElement("div");
      host.id = "pdf-capture-host";
      host.setAttribute("aria-hidden", "true");
      host.style.cssText =
        "position:fixed;left:-14000px;top:0;width:0;height:0;overflow:hidden;pointer-events:none;opacity:0;";
      const iframe = document.createElement("iframe");
      iframe.setAttribute("title", "pdf-capture");
      iframe.style.cssText = `width:${stageW}px;height:${Math.max(stageH, 400)}px;border:0;background:#fff;`;
      host.appendChild(iframe);
      document.body.appendChild(host);

      const idoc = iframe.contentDocument;
      if (!idoc) throw new Error("无法创建导出画布");
      idoc.open();
      idoc.write(buildCaptureHtml(doc.html));
      idoc.close();

      if (idoc.fonts && idoc.fonts.ready) {
        await idoc.fonts.ready.catch(() => {});
      }
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      const frames = Array.prototype.slice.call(idoc.querySelectorAll(".sheet-frame"));
      if (!frames.length) throw new Error("没有可导出的页面");

      const scale = pdfCaptureScale(quality.scaleCap);
      const orient = stageW >= stageH ? "l" : "p";
      const pdf = new jsPDF({
        orientation: orient,
        unit: "mm",
        format: [pageWmm, pageHmm],
        compress: true,
      });

      for (let i = 0; i < frames.length; i++) {
        setExportStatus(`正在生成${quality.label} PDF… ${i + 1} / ${frames.length}`);
        setStatus(`正在生成${quality.label} PDF… ${i + 1} / ${frames.length}`);
        iframe.style.height = `${stageH}px`;
        const canvas = await window.html2canvas(frames[i], {
          scale,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          width: stageW,
          height: stageH,
          windowWidth: stageW,
          windowHeight: stageH,
          onclone: (clonedDoc) => sanitizeCloneColors(clonedDoc),
        });
        const img = canvasToPdfImage(canvas, quality);
        if (i > 0) pdf.addPage([pageWmm, pageHmm], orient);
        pdf.addImage(img, quality.imageType, 0, 0, pageWmm, pageHmm, undefined, quality.compress);
        canvas.width = 0;
        canvas.height = 0;
      }

      const blob = pdf.output("blob");
      if (IS_PYWEBVIEW) {
        // 桌面模式：转 base64 调 Python 保存
        const b64 = await blobToB64(blob);
        const result = await window.pywebview.api.save_blob(b64, filename);
        if (result && result.startsWith("ERROR:")) {
          throw new Error(result.substring(6).trim());
        }
        if (!result) {
          setExportStatus("已取消保存");
          setStatus("已取消 PDF 保存");
          return;
        }
      } else if (fileHandle) {
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
      } else {
        triggerBlobDownload(blob, filename);
      }

      const msg = `已保存${quality.label} PDF · ${frames.length} 页 · 截图 ${Math.round(stageW * scale)}×${Math.round(
        stageH * scale
      )}px（版式仍为 ${stageW}×${stageH}）`;
      setExportStatus(msg);
      setStatus(msg);
      closeExportModal();
    } catch (err) {
      console.error(err);
      if (err && err.name === "AbortError") {
        setExportStatus("已取消保存");
        setStatus("已取消 PDF 保存");
        return;
      }
      const msg = `PDF 生成失败：${err && err.message ? err.message : err}`;
      setExportStatus(msg, true);
      setStatus(msg);
      alert(msg);
    } finally {
      if (host) host.remove();
      btns.forEach((b) => {
        b.disabled = false;
      });
    }
  }

  async function exportPrintable({ includeStickers = false } = {}) {
    try {
      // Ensure latest markdown + live page-stage size are current
      const html = buildPreviewHtml(editor.value);
      latestPreviewHtml = html;
      paginateHtml(html);
      const doc = buildPrintableDocument({ includeStickers });
      const filename = `${doc.fileBase}-打印.html`;

      if (IS_PYWEBVIEW) {
        // 桌面模式：转 base64 调 Python，用系统浏览器打开导出页
        // 系统浏览器支持 window.print() 和 <a download>，完美适配打印和下载
        setExportStatus("正在打开导出页…");
        const b64 = await blobToB64(new Blob([doc.html], { type: "text/html;charset=utf-8" }));
        const result = await window.pywebview.api.open_html_in_browser(b64);
        if (result && result.startsWith("ERROR:")) {
          throw new Error(result.substring(6).trim());
        }
        setStatus(
          `已打开导出页（${pageHtmls.length} 页 · ${
            includeStickers ? "含贴纸" : "不含贴纸"
          } · 可下载 HTML / 系统打印；PDF 请用主界面「下载 PDF」）`
        );
        closeExportModal();
        return;
      }

      const blob = new Blob([doc.html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      // Do NOT use "noopener" in window.open features: it makes the return value null
      // in Chromium, so the old code always thought the popup was blocked.
      const win = window.open(url, "_blank");
      if (!win) {
        downloadTextFile(filename, doc.html, "text/html;charset=utf-8");
        setStatus("弹窗被拦截，已下载可打印 HTML，用浏览器打开后即可打印 / 另存 PDF");
        URL.revokeObjectURL(url);
        closeExportModal();
        return;
      }
      setTimeout(() => URL.revokeObjectURL(url), 120_000);
      setStatus(
        `已打开导出页（${pageHtmls.length} 页 · ${
          includeStickers ? "含贴纸" : "不含贴纸"
        } · 可下载 HTML / 系统打印；PDF 请用主界面「下载 PDF」）`
      );
      closeExportModal();
    } catch (err) {
      console.error(err);
      setExportStatus(`导出失败：${err.message || err}`, true);
      setStatus(`导出失败：${err.message || err}`);
    }
  }

  function markDirty() {
    dirty = true;
    setStatus("未保存…");
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      if (dirty) setStatus("有未保存更改");
    }, 500);
  }

  function toggleCheckboxAtIndex(index, checked) {
    const lines = editor.value.split(/\r?\n/);
    let seen = -1;
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(/^(\s*[-*]\s+)\[([ xX])\](.*)$/);
      if (!m) continue;
      seen += 1;
      if (seen === index) {
        lines[i] = `${m[1]}[${checked ? "x" : " "}]${m[3]}`;
        break;
      }
    }
    editor.value = lines.join("\n");
    markDirty();
    render();
  }

  function checkboxIndexFromEventTarget(target) {
    if (!target || !preview?.contains(target)) return -1;
    let el = target;
    if (el instanceof HTMLInputElement && el.type === "checkbox") {
      const raw = el.dataset.taskIndex;
      return raw != null ? Number(raw) : -1;
    }
    const item = el.closest?.("li.task-item");
    if (!item || !preview.contains(item)) return -1;
    const cb = item.querySelector('input[type="checkbox"]');
    if (!cb) return -1;
    const raw = cb.dataset.taskIndex;
    return raw != null ? Number(raw) : -1;
  }

  // 成品页打勾：点方框或任务文字行均可（说明文案「点方框」；点行更易点中）
  preview?.addEventListener("click", (e) => {
    const target = e.target;
    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      const index = checkboxIndexFromEventTarget(target);
      if (index >= 0) toggleCheckboxAtIndex(index, target.checked);
      return;
    }
    const item = target instanceof Element ? target.closest("li.task-item") : null;
    if (!item || !preview.contains(item)) return;
    const cb = item.querySelector('input[type="checkbox"]');
    if (!cb) return;
    e.preventDefault();
    const index = checkboxIndexFromEventTarget(cb);
    if (index >= 0) toggleCheckboxAtIndex(index, !cb.checked);
  });

  btnPagePrev?.addEventListener("click", () => goPage(-1));
  btnPageNext?.addEventListener("click", () => goPage(1));

  editor.addEventListener("input", () => {
    markDirty();
    render();
  });

  document.querySelectorAll(".seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".seg-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      workspaceEl.classList.remove("view-split", "view-edit", "view-preview");
      workspaceEl.classList.add(`view-${btn.dataset.view}`);
      requestAnimationFrame(() => {
        if (latestPreviewHtml) schedulePaginate(latestPreviewHtml);
      });
    });
  });

  function setSkinStatus(text, isError = false) {
    if (!skinStatus) return;
    skinStatus.textContent = text || "";
    skinStatus.classList.toggle("is-error", !!isError);
  }

  function applyFont(id) {
    const font = FONT_PRESETS.find((f) => f.id === id) || FONT_PRESETS[0];
    const root = document.documentElement;
    root.style.setProperty("--font-read", font.read);
    root.style.setProperty("--font-hand", font.hand);
    root.style.setProperty("--font-cute", font.cute);
    document.body.dataset.font = font.id;
    localStorage.setItem("journal-font", font.id);
    if (fontChips) {
      fontChips.querySelectorAll(".font-chip").forEach((el) => {
        el.classList.toggle("active", el.dataset.font === font.id);
      });
    }
    // Line metrics change with font — reflow preview pages
    requestAnimationFrame(() => {
      if (latestPreviewHtml) schedulePaginate(latestPreviewHtml);
    });
    setStatus(`笔迹字体：${font.name}`);
  }

  function paintFonts() {
    if (!fontChips) return;
    fontChips.innerHTML = "";
    for (const font of FONT_PRESETS) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "theme-chip font-chip";
      btn.dataset.font = font.id;
      btn.title = font.name;
      btn.innerHTML = `<span class="font-sample" style="font-family:${font.read}">${font.sample}</span><span>${font.name}</span>`;
      btn.addEventListener("click", () => applyFont(font.id));
      fontChips.appendChild(btn);
    }
    const saved = localStorage.getItem("journal-font") || "qingye";
    applyFont(FONT_PRESETS.some((f) => f.id === saved) ? saved : "qingye");
  }

  function applyColors(skin) {
    const root = document.documentElement;
    const colors = skin.colors || {};
    const cssVars = skin.cssVars || {};
    for (const [key, cssName] of Object.entries(COLOR_CSS)) {
      const val = cssVars[cssName] || colors[key];
      if (val) root.style.setProperty(cssName, val);
    }
  }

  function applyPaper(paper) {
    const root = document.documentElement;
    const body = document.body;
    const p = paper || {};
    const lines = p.lines || {};
    const margin = p.marginLine || {};
    const geo = resolvePaperGeometry(p);

    body.dataset.paperSize = geo.size;
    body.dataset.paperFixed = geo.fixed ? "1" : "0";
    body.dataset.paperOrient = geo.orient;
    if (geo.custom) body.dataset.paperAspect = String(p.aspect).trim();
    else body.removeAttribute("data-paper-aspect");
    body.dataset.lines = lines.enabled === false ? "off" : "on";
    body.dataset.lineStyle = lines.style || "solid";
    body.dataset.margin = margin.enabled === false ? "off" : "on";

    root.style.setProperty("--paper-min-h", p.minHeight || "62vh");
    // Aspect vars must live on body: CSS presets also set them on body[data-paper-size].
    if (geo.fixed) {
      body.style.setProperty("--page-aspect", geo.aspectCss);
      body.style.setProperty(
        "--paper-pane-max",
        geo.paneMax && geo.paneMax !== "none" ? geo.paneMax : "42rem"
      );
      body.style.setProperty(
        "--page-max-h",
        geo.landscape ? "min(70vh, 720px)" : "min(78vh, 900px)"
      );
    } else {
      body.style.removeProperty("--page-aspect");
      body.style.removeProperty("--paper-pane-max");
      body.style.removeProperty("--page-max-h");
    }
    root.style.setProperty("--paper-radius", p.radius || "22px");
    if (p.shadow) root.style.setProperty("--paper-shadow", p.shadow);
    else root.style.removeProperty("--paper-shadow");

    root.style.setProperty("--line-gap", lines.gap || "1.7rem");
    root.style.setProperty("--line-offset", lines.offsetTop || "2.6rem");
    root.style.setProperty("--line-color", lines.color || "var(--paper-line)");
    root.style.setProperty("--margin-left", margin.left || "2.1rem");
    root.style.setProperty("--margin-color", margin.color || "rgba(231,168,178,0.45)");

    requestAnimationFrame(() => {
      if (latestPreviewHtml) schedulePaginate(latestPreviewHtml);
      else render();
    });
  }

  function applyLayout(layout) {
    const root = document.documentElement;
    const body = document.body;
    const L = layout || {};
    root.style.setProperty("--sidebar-width", L.sidebarWidth || "15.2rem");
    root.style.setProperty("--notebook-max", L.notebookMaxWidth || "1180px");
    root.style.setProperty("--content-gap", L.contentGap || "0.9rem");
    body.classList.toggle("skin-hide-spiral", L.showSpiral === false);
    body.classList.toggle("skin-hide-tape", L.showTape === false);
    body.classList.toggle("skin-hide-petals", L.showPetals === false);
  }

  function stickerStorageKey(path) {
    return `journal-user-stickers:${path || "__blank__"}`;
  }

  function loadUserStickers() {
    try {
      const raw = localStorage.getItem(stickerStorageKey(currentPath));
      userStickers = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(userStickers)) userStickers = [];
      userStickers = userStickers.map((s) => ({
        ...s,
        page: normalizeStickerPage(s),
      }));
    } catch {
      userStickers = [];
    }
  }

  function saveUserStickers() {
    localStorage.setItem(stickerStorageKey(currentPath), JSON.stringify(userStickers));
  }

  function setStickersEnabled(on) {
    stickersEnabled = !!on;
    localStorage.setItem("journal-stickers-enabled", stickersEnabled ? "1" : "0");
    document.body.classList.toggle("stickers-off", !stickersEnabled);
    if (chkStickersEnabled) chkStickersEnabled.checked = stickersEnabled;
    stickerLayer?.classList.toggle("is-active", stickersEnabled);
    stickerLayer?.setAttribute("aria-hidden", stickersEnabled ? "false" : "true");
  }

  function setSkinDecorEnabled(on) {
    skinDecorEnabled = !!on;
    localStorage.setItem("journal-skin-decor", skinDecorEnabled ? "1" : "0");
    document.body.classList.toggle("skin-decor-off", !skinDecorEnabled);
    if (chkSkinDecor) chkSkinDecor.checked = skinDecorEnabled;
  }

  function paintSkinDecor(list) {
    skinDecor = Array.isArray(list) ? list : [];
    if (!skinDecorLayer) return;
    skinDecorLayer.innerHTML = "";
    skinDecor.forEach((s, i) => {
      const el = document.createElement("span");
      el.className = "skin-decor";
      el.textContent = s.emoji || s.text || "";
      el.style.fontSize = s.size || "1.35rem";
      el.style.setProperty("--sticker-rot", `${s.rotate || 0}deg`);
      el.style.setProperty("--sticker-opacity", s.opacity || "0.9");
      el.style.animationDelay = `${0.05 * i}s`;
      if (s.top) el.style.top = s.top;
      if (s.left) el.style.left = s.left;
      if (s.right) el.style.right = s.right;
      if (s.bottom) el.style.bottom = s.bottom;
      if (!s.top && !s.bottom) el.style.top = "10%";
      if (!s.left && !s.right) el.style.right = "4%";
      skinDecorLayer.appendChild(el);
    });
  }

  function applyStickerElStyle(el, s) {
    el.className = `user-sticker shape-${s.shape || "note"}`;
    el.style.left = `${s.x ?? 70}%`;
    el.style.top = `${s.y ?? 22}%`;
    el.style.setProperty("--sticker-w", `${s.width || 128}px`);
    el.style.setProperty("--sticker-rot", `${s.rotate ?? -4}deg`);
    el.style.setProperty("--sticker-bg", s.bg || "#fff8f4");
    el.style.setProperty("--sticker-ink", s.ink || "#4a3d42");
    const textEl = el.querySelector(".sticker-text");
    if (textEl) textEl.textContent = s.text || "贴纸";
  }

  function bindStickerDrag(el, sticker) {
    let dragging = false;
    let moved = false;
    const onPointerDown = (e) => {
      if (!stickersEnabled) return;
      if (e.target.closest(".sticker-peel")) return;
      dragging = true;
      moved = false;
      el.classList.add("is-dragging", "is-selected");
      el.setPointerCapture?.(e.pointerId);
      e.preventDefault();
    };
    const onPointerMove = (e) => {
      if (!dragging) return;
      const stage = pageStage || document.getElementById("pageStage");
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      moved = true;
      sticker.x = Math.min(96, Math.max(4, ((e.clientX - rect.left) / rect.width) * 100));
      sticker.y = Math.min(96, Math.max(6, ((e.clientY - rect.top) / rect.height) * 100));
      sticker.page = currentPage;
      el.style.left = `${sticker.x}%`;
      el.style.top = `${sticker.y}%`;
    };
    const onPointerUp = (e) => {
      if (!dragging) return;
      dragging = false;
      el.classList.remove("is-dragging");
      el.releasePointerCapture?.(e.pointerId);
      if (moved) {
        saveUserStickers();
        setStatus("贴纸已挪好位置");
      }
    };
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);
    el.addEventListener("dblclick", (e) => {
      if (e.target.closest(".sticker-peel")) return;
      openStickerModal(sticker.id);
    });
  }

  function renderUserStickers() {
    if (!stickerLayer) return;
    stickerLayer.innerHTML = "";
    const onPage = userStickers.filter((s) => normalizeStickerPage(s) === currentPage);
    onPage.forEach((s) => {
      const el = document.createElement("div");
      el.dataset.id = s.id;
      el.innerHTML = `<div class="sticker-face"><div class="sticker-text"></div></div><button type="button" class="sticker-peel" aria-label="撕掉贴纸" title="点翘边撕掉"><span class="sticker-peel-fold" aria-hidden="true"></span></button>`;
      applyStickerElStyle(el, s);
      el.querySelector(".sticker-peel")?.addEventListener("click", (e) => {
        e.stopPropagation();
        userStickers = userStickers.filter((x) => x.id !== s.id);
        saveUserStickers();
        renderUserStickers();
        setStatus("已撕掉一张贴纸");
      });
      bindStickerDrag(el, s);
      stickerLayer.appendChild(el);
    });
    const hint = document.getElementById("stickerHint");
    if (hint) {
      hint.textContent = onPage.length
        ? `成品第 ${currentPage + 1} 页 · ${onPage.length} 张贴纸（全书 ${userStickers.length}）`
        : `成品第 ${currentPage + 1} 页 · 还没贴纸 · 点「＋ 贴一张」`;
    }
  }

  function syncStickerPreview() {
    if (!stickerPreview) return;
    const text = (stickerText?.value || "").trim() || "贴纸";
    const rotate = Number(stickerRotate?.value ?? -4);
    const width = Number(stickerSize?.value ?? 128);
    if (stickerPreviewText) stickerPreviewText.textContent = text;
    if (stickerRotateVal) stickerRotateVal.textContent = `${rotate}°`;
    if (stickerSizeVal) stickerSizeVal.textContent = String(width);
    stickerPreview.className = `user-sticker shape-${draftShape}`;
    stickerPreview.style.setProperty("--sticker-w", `${width}px`);
    stickerPreview.style.setProperty("--sticker-rot", `${rotate}deg`);
    stickerPreview.style.setProperty("--sticker-bg", draftColor.bg);
    stickerPreview.style.setProperty("--sticker-ink", draftColor.ink);
    shapeGrid?.querySelectorAll(".shape-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.shape === draftShape);
    });
    stickerColorGrid?.querySelectorAll(".color-dot").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.bg === draftColor.bg);
    });
  }

  function paintStickerFormControls() {
    if (shapeGrid && !shapeGrid.childElementCount) {
      for (const shape of STICKER_SHAPES) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "shape-btn";
        btn.dataset.shape = shape.id;
        btn.textContent = shape.label;
        btn.addEventListener("click", () => {
          draftShape = shape.id;
          syncStickerPreview();
        });
        shapeGrid.appendChild(btn);
      }
    }
    if (stickerColorGrid && !stickerColorGrid.childElementCount) {
      for (const c of STICKER_COLORS) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "color-dot";
        btn.dataset.bg = c.bg;
        btn.style.background = c.bg;
        btn.title = c.bg;
        btn.addEventListener("click", () => {
          draftColor = c;
          syncStickerPreview();
        });
        stickerColorGrid.appendChild(btn);
      }
    }
  }

  function setStickerModalStatus(text, isError = false) {
    if (!stickerModalStatus) return;
    stickerModalStatus.textContent = text || "";
    stickerModalStatus.classList.toggle("is-error", !!isError);
  }

  function closeStickerModal() {
    if (!stickerModal) return;
    editingStickerId = null;
    if (stickerModal.close) stickerModal.close();
    else stickerModal.removeAttribute("open");
  }

  function openStickerModal(id = null) {
    if (!stickersEnabled) {
      setStickersEnabled(true);
    }
    paintStickerFormControls();
    editingStickerId = id;
    const existing = id ? userStickers.find((s) => s.id === id) : null;
    if (stickerModalTitle) {
      stickerModalTitle.textContent = existing ? "编辑贴纸" : "贴一张贴纸";
    }
    if (btnStickerDelete) btnStickerDelete.hidden = !existing;
    if (existing) {
      draftShape = existing.shape || "note";
      draftColor = { bg: existing.bg, ink: existing.ink };
      if (stickerText) stickerText.value = existing.text || "";
      if (stickerRotate) stickerRotate.value = String(existing.rotate ?? -4);
      if (stickerSize) stickerSize.value = String(existing.width || 128);
    } else {
      draftShape = "note";
      draftColor = STICKER_COLORS[Math.floor(Math.random() * STICKER_COLORS.length)];
      if (stickerText) stickerText.value = "";
      if (stickerRotate) stickerRotate.value = String(-8 + Math.floor(Math.random() * 13));
      if (stickerSize) stickerSize.value = "128";
    }
    syncStickerPreview();
    setStickerModalStatus(
      existing
        ? `改完后点「贴上去」（成品第 ${(normalizeStickerPage(existing) || 0) + 1} 页）`
        : `将贴到成品第 ${currentPage + 1} 页 · 写点什么再贴`
    );
    if (stickerModal.showModal) stickerModal.showModal();
    else stickerModal.setAttribute("open", "open");
    stickerText?.focus();
  }

  function saveStickerFromModal() {
    const text = (stickerText?.value || "").trim();
    if (!text) {
      setStickerModalStatus("先写一点贴纸内容吧", true);
      return;
    }
    const rotate = Number(stickerRotate?.value ?? -4);
    const width = Number(stickerSize?.value ?? 128);
    if (editingStickerId) {
      const target = userStickers.find((s) => s.id === editingStickerId);
      if (target) {
        target.text = text;
        target.shape = draftShape;
        target.bg = draftColor.bg;
        target.ink = draftColor.ink;
        target.rotate = rotate;
        target.width = width;
        if (target.page == null) target.page = currentPage;
      }
      setStatus("贴纸已更新");
    } else {
      userStickers.push({
        id: `st_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        text,
        shape: draftShape,
        bg: draftColor.bg,
        ink: draftColor.ink,
        rotate,
        width,
        page: currentPage,
        x: 58 + Math.random() * 22,
        y: 18 + Math.random() * 28,
      });
      setStatus(`贴纸已贴到成品第 ${currentPage + 1} 页`);
    }
    saveUserStickers();
    renderUserStickers();
    closeStickerModal();
  }

  function applyTheme(id) {
    const theme = skins.find((t) => t.id === id && !t.error) || skins.find((t) => !t.error) || FALLBACK_SKINS[0];
    document.body.dataset.theme = theme.id;
    document.documentElement.dataset.theme = theme.id;
    const notebook = document.querySelector(".notebook");
    if (notebook) notebook.dataset.theme = theme.id;

    applyColors(theme);
    applyPaper(theme.paper);
    applyLayout(theme.layout);
    paintSkinDecor(theme.stickers);

    const wash = document.querySelector(".desk-wash");
    if (wash) {
      if (theme.deskWash) wash.style.background = theme.deskWash;
      else wash.style.removeProperty("background");
    }

    brandMark.textContent = `${theme.name}笺`;
    brandStamp.textContent = theme.stamp || "自订";
    localStorage.setItem("journal-theme", theme.id);
    if (themeChips) {
      themeChips.querySelectorAll(".theme-chip").forEach((el) => {
        el.classList.toggle("active", el.dataset.theme === theme.id);
      });
    }
    const rail = document.getElementById("themeRail");
    rail?.classList.add("pulse");
    setTimeout(() => rail?.classList.remove("pulse"), 700);
    const bits = [];
    const geo = resolvePaperGeometry(theme.paper || {});
    if (geo.chip) bits.push(geo.chip);
    if (theme.paper?.lines?.style) bits.push(`${theme.paper.lines.style} 线`);
    setStatus(
      `已切换皮肤：${theme.name}${bits.length ? " · " + bits.join(" · ") : ""} · 超出翻页（比例≠打印机纸型）`
    );
  }

  function paintThemes() {
    if (!themeChips) return;
    themeChips.innerHTML = "";
    const usable = skins.filter((t) => !t.error);
    for (const theme of usable) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "theme-chip";
      btn.dataset.theme = theme.id;
      const geo = resolvePaperGeometry(theme.paper || {});
      btn.title = [theme.desc || theme.name, geo.hint].filter(Boolean).join(" · ");
      const swatch = theme.colors?.sage || theme.colors?.sageDeep || "#7fafa0";
      const meta = [
        geo.chip,
        theme.paper?.lines?.enabled === false ? "素纸" : theme.paper?.lines?.style,
      ]
        .filter(Boolean)
        .join(" · ");
      btn.innerHTML = `<span class="swatch" style="--chip-swatch:${swatch}"></span><span>${theme.name}</span>${
        meta ? `<span class="chip-meta">${meta}</span>` : ""
      }`;
      btn.addEventListener("click", () => applyTheme(theme.id));
      themeChips.appendChild(btn);
    }
    const saved = localStorage.getItem("journal-theme") || "qingye";
    applyTheme(usable.some((t) => t.id === saved) ? saved : usable[0]?.id || "qingye");
  }

  async function loadSkins() {
    if (demoMode) {
      try {
        const manifest = await fetchJsonAsset("skins/manifest.json");
        const names = manifest.skins || [];
        const loaded = [];
        for (const name of names) {
          try {
            const skin = await fetchJsonAsset(`skins/${name}`);
            if (skin && skin.id) loaded.push(skin);
          } catch (err) {
            console.warn("demo skin skip", name, err);
          }
        }
        try {
          const custom = JSON.parse(localStorage.getItem(DEMO_CUSTOM_SKINS_KEY) || "[]");
          if (Array.isArray(custom)) {
            for (const skin of custom) {
              if (!skin?.id) continue;
              const idx = loaded.findIndex((s) => s.id === skin.id);
              if (idx >= 0) loaded[idx] = skin;
              else loaded.push(skin);
            }
          }
        } catch {}
        if (loaded.length) skins = loaded;
      } catch (err) {
        console.warn("demo skins failed, using fallback", err);
      }
      paintThemes();
      return;
    }
    try {
      const res = await fetch("/api/skins", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      const list = data.skins || [];
      if (list.length) skins = list;
    } catch (err) {
      console.warn("load skins failed, using fallback", err);
    }
    paintThemes();
  }

  function closeSkinModal() {
    if (!skinModal) return;
    if (skinModal.close) skinModal.close();
    else skinModal.removeAttribute("open");
  }

  function openSkinModal() {
    setSkinStatus("可粘贴 JSON，或选择 skins 里的示例文件");
    if (skinModal.showModal) skinModal.showModal();
    else skinModal.setAttribute("open", "open");
  }

  async function importSkin() {
    let payload;
    try {
      payload = JSON.parse((skinJson?.value || "").trim());
    } catch {
      setSkinStatus("JSON 解析失败，请检查格式", true);
      return;
    }
    if (!payload?.id) {
      setSkinStatus("皮肤 JSON 需要 id 字段", true);
      return;
    }
    setSkinStatus("正在保存皮肤…");
    if (demoMode) {
      try {
        let custom = [];
        try {
          custom = JSON.parse(localStorage.getItem(DEMO_CUSTOM_SKINS_KEY) || "[]");
        } catch {
          custom = [];
        }
        if (!Array.isArray(custom)) custom = [];
        const idx = custom.findIndex((s) => s.id === payload.id);
        if (idx >= 0) {
          if (!skinOverwrite?.checked) {
            setSkinStatus("已有同名皮肤，请勾选覆盖或改 id", true);
            return;
          }
          custom[idx] = payload;
        } else custom.push(payload);
        localStorage.setItem(DEMO_CUSTOM_SKINS_KEY, JSON.stringify(custom));
        setSkinStatus(`Demo 已保存到本机：${payload.name || payload.id}`);
        await loadSkins();
        applyTheme(payload.id);
        closeSkinModal();
      } catch (err) {
        setSkinStatus(`导入失败：${err.message || err}`, true);
      }
      return;
    }
    try {
      const res = await fetch("/api/skins/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skin: payload,
          overwrite: !!skinOverwrite?.checked,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setSkinStatus(`已保存：${data.skin?.name || data.skin?.id}`);
      await loadSkins();
      if (data.skin?.id) applyTheme(data.skin.id);
      closeSkinModal();
    } catch (err) {
      setSkinStatus(`导入失败：${err.message || err}`, true);
    }
  }

  function paintBrowse() {
    fileListEl.innerHTML = "";

    const crumb = document.createElement("li");
    crumb.className = "crumb-row";
    const crumbWrap = document.createElement("div");
    crumbWrap.className = "crumbs";
    for (const c of browse.breadcrumbs || []) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "crumb";
      b.textContent = c.name;
      b.addEventListener("click", () => refreshList(c.path || "", false));
      crumbWrap.appendChild(b);
    }
    crumb.appendChild(crumbWrap);
    fileListEl.appendChild(crumb);

    if (browse.path) {
      const up = document.createElement("li");
      const upBtn = document.createElement("button");
      upBtn.type = "button";
      upBtn.className = "file-item dir-item";
      upBtn.textContent = "⤴ 上级文件夹";
      upBtn.addEventListener("click", () => refreshList(browse.parent || "", false));
      up.appendChild(upBtn);
      fileListEl.appendChild(up);
    }

    for (const d of browse.dirs || []) {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "file-item dir-item";
      btn.textContent = `📁 ${d.name}`;
      btn.title = d.path;
      btn.addEventListener("click", () => refreshList(d.path, false));
      li.appendChild(btn);
      fileListEl.appendChild(li);
    }

    const files = browse.files || [];
    if (!files.length && !(browse.dirs || []).length) {
      const empty = document.createElement("li");
      empty.className = "file-empty";
      empty.textContent = "这里没有子文件夹或 .md";
      fileListEl.appendChild(empty);
    }

    for (const f of files) {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "file-item" + (f.path === currentPath ? " active" : "");
      btn.textContent = `📝 ${f.name}`;
      btn.title = f.path;
      btn.addEventListener("click", () => openFile(f.path));
      li.appendChild(btn);
      fileListEl.appendChild(li);
    }
  }

  async function refreshList(dirPath = currentDir, autoOpen = false) {
    if (demoMode) {
      browse = {
        workspace: "在线 Demo",
        path: "",
        parent: "",
        dirs: [],
        files: Object.keys(demoFiles)
          .sort((a, b) => a.localeCompare(b, "zh"))
          .map((path) => ({
            name: demoFiles[path].name || path,
            path,
          })),
        breadcrumbs: [{ name: "Demo", path: "" }],
      };
      currentDir = "";
      folderPathEl.textContent = "在线 Demo（浏览器本地）";
      filesHint.textContent = `Demo · ${browse.files.length} 个 md（可保存/下载）`;
      paintBrowse();
      setStatus("已刷新 Demo 文件");
      if (autoOpen) {
        const preferred =
          browse.files.find((f) => f.name.includes("示例") || f.name.includes("学习计划")) ||
          browse.files[0];
        if (preferred) await openFile(preferred.path);
      }
      return true;
    }
    try {
      const res = await fetch(`/api/browse?path=${encodeURIComponent(dirPath || "")}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      browse = data;
      currentDir = data.path || "";
      workspaceRoot = data.workspace || workspaceRoot;
      folderPathEl.textContent = data.workspace
        ? `${data.workspace}${data.path ? "\\" + data.path.replaceAll("/", "\\") : ""}`
        : "workspace";
      filesHint.textContent = `工作区可读 · ${data.dirs.length} 个文件夹 · ${data.files.length} 个 md`;
      paintBrowse();
      setStatus("已刷新目录");

      if (autoOpen) {
        const preferred =
          data.files.find((f) => f.name.includes("示例") || f.name.includes("学习计划")) ||
          data.files[0];
        if (preferred) await openFile(preferred.path);
      }
      return true;
    } catch (err) {
      // Static host / Pages: fall into demo instead of dead UI
      if (!demoMode) {
        demoMode = true;
        await loadSkins();
        await initDemoMode();
        return true;
      }
      browse = { dirs: [], files: [], breadcrumbs: [], parent: "", path: "" };
      paintBrowse();
      filesHint.textContent = "无法连接本地服务。请双击「青叶笺」程序启动。";
      setStatus("未连接到服务");
      console.warn(err);
      return false;
    }
  }

  async function openFile(path) {
    if (!path) return;
    if (dirty && currentPath && currentPath !== path) {
      const ok = confirm("当前页有未保存更改，切换将丢弃。继续？");
      if (!ok) return;
    }
    if (demoMode) {
      const file = demoFiles[path];
      if (!file) {
        setStatus("Demo 中找不到该文件");
        return;
      }
      editor.value = file.content || "";
      setCurrentFile(path, file.name || path);
      dirty = false;
      paintBrowse();
      loadUserStickers();
      renderUserStickers();
      render();
      setStatus("已打开（Demo）");
      return;
    }
    try {
      const res = await fetch(`/api/file?path=${encodeURIComponent(path)}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      editor.value = data.content || "";
      setCurrentFile(data.path || path, data.name);
      dirty = false;
      // navigate list to file's folder
      const dir = (data.path || path).includes("/")
        ? (data.path || path).split("/").slice(0, -1).join("/")
        : "";
      if (dir !== currentDir) await refreshList(dir, false);
      else paintBrowse();
      loadUserStickers();
      renderUserStickers();
      render();
      setStatus("已打开");
    } catch (err) {
      setStatus(`打开失败：${err.message || err}`);
    }
  }

  async function saveFile() {
    if (demoMode) {
      let path = currentPath;
      let name = (path && path.split("/").pop()) || "青叶笺.md";
      if (!path) {
        const typed = prompt("Demo 保存文件名", name.endsWith(".md") ? name : `${name}.md`);
        if (!typed) return;
        name = typed.trim().endsWith(".md") ? typed.trim() : `${typed.trim()}.md`;
        path = name;
      }
      demoFiles[path] = { name: name.split("/").pop(), content: editor.value };
      persistDemoFiles();
      setCurrentFile(path, demoFiles[path].name);
      dirty = false;
      downloadTextFile(demoFiles[path].name, editor.value);
      await refreshList("", false);
      setStatus("Demo 已保存到浏览器，并已下载");
      return;
    }
    if (!currentPath) {
      setStatus("请先打开一个 md 文件");
      return;
    }
    try {
      const res = await fetch(`/api/file?path=${encodeURIComponent(currentPath)}`, {
        method: "PUT",
        headers: { "Content-Type": "text/plain; charset=utf-8" },
        body: editor.value,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      dirty = false;
      setStatus("已保存");
      await refreshList(currentDir, false);
    } catch (err) {
      setStatus(`保存失败：${err.message || err}`);
    }
  }

  const workspaceModal = document.getElementById("workspaceModal");
  const workspaceGrid = document.getElementById("workspaceGrid");
  const workspaceStatus = document.getElementById("workspaceStatus");
  const workspaceCurrentPath = document.getElementById("workspaceCurrentPath");
  const workspaceManual = document.getElementById("workspaceManual");

  function setWorkspaceStatus(text, isError = false) {
    if (!workspaceStatus) return;
    workspaceStatus.textContent = text || "";
    workspaceStatus.classList.toggle("is-error", !!isError);
  }

  function closeWorkspaceModal() {
    if (!workspaceModal) return;
    if (workspaceModal.close) workspaceModal.close();
    else workspaceModal.removeAttribute("open");
  }

  async function applyWorkspaceRoot(root) {
    if (demoMode) {
      throw new Error("在线 Demo 不能切换工作区，请使用桌面版");
    }
    const res = await fetch("/api/workspace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ root }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    workspaceRoot = data.workspace;
    if (workspaceCurrentPath) workspaceCurrentPath.textContent = workspaceRoot;
    if (workspaceManual) workspaceManual.value = workspaceRoot;
    setWorkspaceStatus(`已切换到：${workspaceRoot}`);
    setStatus(`工作区：${workspaceRoot}`);
    currentPath = "";
    dirty = false;
    loadUserStickers();
    renderUserStickers();
    await refreshList("", true);
    closeWorkspaceModal();
  }

  function paintWorkspaceSuggestions(suggestions) {
    if (!workspaceGrid) return;
    workspaceGrid.innerHTML = "";
    if (!suggestions.length) {
      workspaceGrid.innerHTML = `<div class="template-empty">没有可用的快捷位置</div>`;
      return;
    }
    for (const item of suggestions) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "workspace-card";
      if (item.path === workspaceRoot) btn.classList.add("active");
      btn.innerHTML = `<strong>${item.label}</strong><span>${item.path}</span>`;
      btn.addEventListener("click", async () => {
        setWorkspaceStatus(`正在切换到 ${item.label}…`);
        try {
          await applyWorkspaceRoot(item.path);
        } catch (err) {
          setWorkspaceStatus(`切换失败：${err.message || err}`, true);
        }
      });
      workspaceGrid.appendChild(btn);
    }
  }

  async function openWorkspaceModal() {
    if (demoMode) {
      setWorkspaceStatus("在线 Demo 不能切换工作区。完整功能请下载桌面版「青叶笺」。", true);
      if (workspaceCurrentPath) workspaceCurrentPath.textContent = "在线 Demo";
      paintWorkspaceSuggestions([]);
      if (workspaceModal.showModal) workspaceModal.showModal();
      else workspaceModal.setAttribute("open", "open");
      return;
    }
    setWorkspaceStatus("正在加载常用位置…");
    if (workspaceCurrentPath) workspaceCurrentPath.textContent = workspaceRoot || "未设置";
    if (workspaceManual) workspaceManual.value = workspaceRoot || "";
    try {
      const res = await fetch("/api/workspace", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      workspaceRoot = data.workspace || workspaceRoot;
      if (workspaceCurrentPath) workspaceCurrentPath.textContent = workspaceRoot;
      if (workspaceManual) workspaceManual.value = workspaceRoot;
      paintWorkspaceSuggestions(data.suggestions || []);
      setWorkspaceStatus("点选常用位置，或点「浏览文件夹…」");
    } catch (err) {
      paintWorkspaceSuggestions([]);
      setWorkspaceStatus(`加载失败：${err.message || err}`, true);
    }
    if (workspaceModal.showModal) workspaceModal.showModal();
    else workspaceModal.setAttribute("open", "open");
  }

  async function browseWorkspaceFolder() {
    if (demoMode) {
      setWorkspaceStatus("在线 Demo 不支持浏览本机文件夹", true);
      return;
    }
    setWorkspaceStatus("请在弹出的系统窗口里选择文件夹…");
    try {
      const res = await fetch("/api/workspace/pick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initial: workspaceRoot || "" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      if (data.cancelled) {
        setWorkspaceStatus("已取消选择");
        return;
      }
      workspaceRoot = data.workspace;
      if (workspaceCurrentPath) workspaceCurrentPath.textContent = workspaceRoot;
      if (workspaceManual) workspaceManual.value = workspaceRoot;
      setWorkspaceStatus(`已切换到：${workspaceRoot}`);
      setStatus(`工作区：${workspaceRoot}`);
      currentPath = "";
      dirty = false;
      await refreshList("", true);
      // refresh suggestion highlights
      try {
        const ws = await fetch("/api/workspace", { cache: "no-store" });
        const info = await ws.json();
        if (ws.ok) paintWorkspaceSuggestions(info.suggestions || []);
      } catch {}
      closeWorkspaceModal();
    } catch (err) {
      setWorkspaceStatus(`浏览失败：${err.message || err}`, true);
    }
  }

  async function changeWorkspace() {
    await openWorkspaceModal();
  }

  function setTemplateStatus(text, isError = false) {
    if (!templateStatus) return;
    templateStatus.textContent = text || "";
    templateStatus.classList.toggle("is-error", !!isError);
  }

  function closeTemplateModal() {
    if (!templateModal) return;
    if (templateModal.close) templateModal.close();
    else templateModal.removeAttribute("open");
  }

  function paintTemplateCards(list, hintText) {
    templateHint.textContent = hintText;
    templateGrid.innerHTML = "";
    if (!list.length) {
      templateGrid.innerHTML =
        `<div class="template-empty">templates 里还没有模板。</div>`;
      setTemplateStatus("没有可用模板", true);
      return;
    }
    setTemplateStatus(`找到 ${list.length} 个模板，请先点选一个`);
    for (const t of list) {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "template-card";
      card.innerHTML = `<strong>${t.title}</strong><span>${t.desc || t.name}</span>`;
      card.addEventListener("click", () => {
        selectedTemplate = t.name;
        templateGrid.querySelectorAll(".template-card").forEach((el) => {
          el.classList.toggle("active", el === card);
        });
        const today = new Date();
        const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
          today.getDate()
        ).padStart(2, "0")}`;
        importNameInput.value = `${t.title}-${iso}.md`;
        setTemplateStatus(`已选择：${t.title}`);
      });
      templateGrid.appendChild(card);
    }
  }

  async function openTemplateModal() {
    selectedTemplate = "";
    importNameInput.value = "";
    setTemplateStatus("正在读取 templates …");
    if (demoMode) {
      try {
        if (!demoTemplateCache) {
          const manifest = await fetchJsonAsset("templates/manifest.json");
          const names = manifest.templates || [];
          const list = [];
          for (const name of names) {
            try {
              const raw = await fetchTextAsset(`templates/${name}`);
              const { meta, body } = parseTemplateMetaClient(raw);
              list.push({
                name,
                title: meta.title || name.replace(/\.md$/i, ""),
                desc: meta.desc || "",
                body,
              });
            } catch (err) {
              console.warn("demo template skip", name, err);
            }
          }
          demoTemplateCache = list;
        }
        paintTemplateCards(
          demoTemplateCache,
          "Demo：导入会写入浏览器本地文件列表，可再下载"
        );
        if (templateModal.showModal) templateModal.showModal();
        else templateModal.setAttribute("open", "open");
      } catch (err) {
        setTemplateStatus(`读取失败：${err.message || err}`, true);
        if (templateModal.showModal) templateModal.showModal();
        else templateModal.setAttribute("open", "open");
      }
      return;
    }
    try {
      const res = await fetch("/api/templates", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      paintTemplateCards(
        data.templates || [],
        `模板目录：${data.folder || "templates"} · 当前会导入到：${
          currentDir ? currentDir : "工作区根目录"
        }`
      );
      if (templateModal.showModal) templateModal.showModal();
      else templateModal.setAttribute("open", "open");
    } catch (err) {
      const msg = `读取失败：${err.message || err}（请用「青叶笺」程序启动，不要直接打开 html）`;
      setTemplateStatus(msg, true);
      setStatus(msg);
      if (templateModal.showModal) templateModal.showModal();
      else templateModal.setAttribute("open", "open");
    }
  }

  async function importTemplate() {
    if (!selectedTemplate) {
      setTemplateStatus("请先点选上面的一个模板卡片", true);
      return;
    }
    const asName = importNameInput.value.trim();
    if (!asName) {
      setTemplateStatus("请填写保存文件名", true);
      return;
    }
    const destName = asName.endsWith(".md") ? asName : `${asName}.md`;
    if (demoMode) {
      const tpl = (demoTemplateCache || []).find((t) => t.name === selectedTemplate);
      if (!tpl) {
        setTemplateStatus("找不到模板内容", true);
        return;
      }
      const today = new Date();
      const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
        today.getDate()
      ).padStart(2, "0")}`;
      const body = String(tpl.body || "").replaceAll("{{date}}", iso);
      demoFiles[destName] = { name: destName, content: body };
      persistDemoFiles();
      setTemplateStatus(`Demo 已导入：${destName}`);
      setStatus(`已导入：${destName}`);
      closeTemplateModal();
      dirty = false;
      await refreshList("", false);
      await openFile(destName);
      return;
    }
    const destDir = currentDir || "";
    setTemplateStatus(`正在导入到 ${destDir || "工作区根目录"} …`);
    try {
      const res = await fetch("/api/templates/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template: selectedTemplate,
          as: asName,
          dir: destDir,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setTemplateStatus(`导入成功：${data.path}`);
      setStatus(`已导入：${data.path}`);
      closeTemplateModal();
      const dir = data.path.includes("/")
        ? data.path.split("/").slice(0, -1).join("/")
        : "";
      dirty = false;
      await refreshList(dir, false);
      await openFile(data.path);
    } catch (err) {
      setTemplateStatus(`导入失败：${err.message || err}`, true);
      setStatus(`导入失败：${err.message || err}`);
    }
  }

  document.getElementById("btnReloadList").addEventListener("click", () =>
    refreshList(currentDir, false)
  );
  document.getElementById("btnReloadFile").addEventListener("click", () => {
    if (!currentPath) return setStatus("尚未打开文件");
    dirty = false;
    openFile(currentPath);
  });
  document.getElementById("btnSave").addEventListener("click", saveFile);
  document.getElementById("btnThemes")?.addEventListener("click", () => {
    const rail = document.getElementById("themeRail");
    rail?.classList.add("pulse");
    rail?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => rail?.classList.remove("pulse"), 1200);
    setStatus("点皮肤可换预览比例、横线与框架（JSON 可设横页/自定义比；a4/a5≠打印机纸型）");
  });
  document.getElementById("btnStickers")?.addEventListener("click", () => {
    stickerRail?.classList.add("pulse");
    stickerRail?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => stickerRail?.classList.remove("pulse"), 1200);
    setStatus("打开贴纸开关后，可「＋ 贴一张」写内容");
  });
  document.getElementById("btnFonts")?.addEventListener("click", () => {
    fontRail?.classList.add("pulse");
    fontRail?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => fontRail?.classList.remove("pulse"), 1200);
    setStatus("点「笔迹字体」可换成手写感或印刷体");
  });
  document.getElementById("btnExportPrint")?.addEventListener("click", openExportModal);
  document.getElementById("btnExportClose")?.addEventListener("click", closeExportModal);
  document.getElementById("btnExportWithStickers")?.addEventListener("click", () =>
    exportPdfDirect({ includeStickers: true })
  );
  document.getElementById("btnExportPlain")?.addEventListener("click", () =>
    exportPdfDirect({ includeStickers: false })
  );
  document.getElementById("btnExportOpenPage")?.addEventListener("click", () =>
    exportPrintable({ includeStickers: true })
  );
  exportModal?.addEventListener("click", (e) => {
    if (e.target === exportModal) closeExportModal();
  });
  document.getElementById("btnAddSticker")?.addEventListener("click", () => openStickerModal());
  document.getElementById("btnClearStickers")?.addEventListener("click", () => {
    const onPage = userStickers.filter((s) => normalizeStickerPage(s) === currentPage);
    if (!onPage.length) {
      setStatus("当前成品页还没有贴纸");
      return;
    }
    if (!confirm(`清空成品第 ${currentPage + 1} 页的 ${onPage.length} 张贴纸？`)) return;
    userStickers = userStickers.filter((s) => normalizeStickerPage(s) !== currentPage);
    saveUserStickers();
    renderUserStickers();
    setStatus(`已清空成品第 ${currentPage + 1} 页贴纸`);
  });
  chkStickersEnabled?.addEventListener("change", () => {
    setStickersEnabled(!!chkStickersEnabled.checked);
    setStatus(stickersEnabled ? "贴纸已显示" : "贴纸已隐藏");
  });
  chkSkinDecor?.addEventListener("change", () => {
    setSkinDecorEnabled(!!chkSkinDecor.checked);
    setStatus(skinDecorEnabled ? "皮肤小装饰已显示" : "皮肤小装饰已隐藏");
  });
  stickerText?.addEventListener("input", syncStickerPreview);
  stickerRotate?.addEventListener("input", syncStickerPreview);
  stickerSize?.addEventListener("input", syncStickerPreview);
  document.getElementById("btnStickerClose")?.addEventListener("click", closeStickerModal);
  document.getElementById("btnStickerSave")?.addEventListener("click", saveStickerFromModal);
  btnStickerDelete?.addEventListener("click", () => {
    if (!editingStickerId) return;
    userStickers = userStickers.filter((s) => s.id !== editingStickerId);
    saveUserStickers();
    renderUserStickers();
    closeStickerModal();
    setStatus("已撕掉这张贴纸");
  });
  stickerModal?.addEventListener("click", (e) => {
    if (e.target === stickerModal) closeStickerModal();
  });
  document.getElementById("btnImportSkin")?.addEventListener("click", openSkinModal);
  document.getElementById("btnSkinClose")?.addEventListener("click", closeSkinModal);
  document.getElementById("btnSkinImport")?.addEventListener("click", importSkin);
  document.getElementById("btnSkinLoadExample")?.addEventListener("click", async () => {
    try {
      let data;
      if (demoMode) {
        data = await fetchJsonAsset("skins/example-user-skin.json");
      } else {
        const res = await fetch("/api/skin?id=example-user-skin", { cache: "no-store" });
        data = await res.json();
        if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      }
      const clean = {
        id: `${data.id || "my-skin"}-copy`,
        name: `${data.name || "自订"}（副本）`,
        stamp: data.stamp,
        desc: data.desc,
        colors: data.colors,
        deskWash: data.deskWash,
        paper: data.paper,
        layout: data.layout,
        stickers: data.stickers,
      };
      if (skinJson) skinJson.value = JSON.stringify(clean, null, 2);
      setSkinStatus("已填入示例，可改 id / 贴纸后再保存");
    } catch (err) {
      setSkinStatus(`读取示例失败：${err.message || err}`, true);
    }
  });
  skinFile?.addEventListener("change", async () => {
    const file = skinFile.files && skinFile.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      JSON.parse(text);
      if (skinJson) skinJson.value = text;
      setSkinStatus(`已读取文件：${file.name}`);
    } catch (err) {
      setSkinStatus(`文件不是合法 JSON：${err.message || err}`, true);
    }
  });
  const helpModal = document.getElementById("helpModal");
  const helpBody = document.getElementById("helpBody");
  const helpStatus = document.getElementById("helpStatus");

  function setHelpStatus(msg, isError = false) {
    if (!helpStatus) return;
    helpStatus.textContent = msg || "";
    helpStatus.classList.toggle("is-error", !!isError);
  }

  function renderHelpMarkdown(md) {
    try {
      return markedReady ? marked.parse(String(md || ""), { renderer }) : simpleMarkdown(md);
    } catch (err) {
      console.warn(err);
      return simpleMarkdown(md);
    }
  }

  function closeHelpModal() {
    helpModal?.close();
  }

  async function openHelpModal() {
    if (!helpModal) return;
    setHelpStatus("");
    if (helpBody) helpBody.innerHTML = `<p class="help-loading">正在打开帮助…</p>`;
    helpModal.showModal();
    try {
      if (demoMode) {
        const content = await fetchTextAsset("help/编辑技巧.md");
        if (helpBody) helpBody.innerHTML = renderHelpMarkdown(content);
        setHelpStatus("来自 help/编辑技巧.md（Demo）");
        helpBody?.scrollTo?.(0, 0);
        return;
      }
      const res = await fetch("/api/help", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      if (helpBody) helpBody.innerHTML = renderHelpMarkdown(data.content || "");
      setHelpStatus(`来自 help/${data.name || "编辑技巧.md"}`);
      helpBody?.scrollTo?.(0, 0);
    } catch (err) {
      if (helpBody) {
        helpBody.innerHTML = `<p class="help-loading">没能打开帮助文档。</p>`;
      }
      setHelpStatus(`读取失败：${err.message || err}`, true);
    }
  }

  document.getElementById("btnHelp")?.addEventListener("click", openHelpModal);
  document.getElementById("btnQuitApp")?.addEventListener("click", async () => {
    if (demoMode) {
      alert(
        "这是青叶笺的在线 Demo。\n\n" +
          "可试用皮肤、贴纸、翻页与导出。\n" +
          "完整本地读写请到 GitHub 下载桌面版。\n\n" +
          "https://github.com/ZhiqiangBao/qingye-jian"
      );
      return;
    }
    if (!confirm("退出青叶笺？未保存的修改会丢失，本地服务也会关闭。")) return;
    try {
      await fetch("/api/shutdown", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    } catch {}
    setStatus("已退出本地服务，可以关闭此标签页");
    setTimeout(() => {
      try {
        window.close();
      } catch {}
    }, 300);
  });
  document.getElementById("btnHelpClose")?.addEventListener("click", closeHelpModal);
  helpModal?.addEventListener("click", (e) => {
    if (e.target === helpModal) closeHelpModal();
  });

  document.getElementById("btnTemplates")?.addEventListener("click", openTemplateModal);
  document.getElementById("btnImportConfirm")?.addEventListener("click", importTemplate);
  document.getElementById("btnTemplateClose")?.addEventListener("click", closeTemplateModal);
  document.getElementById("btnWorkspace")?.addEventListener("click", changeWorkspace);
  document.getElementById("btnWorkspaceClose")?.addEventListener("click", closeWorkspaceModal);
  document.getElementById("btnWorkspaceBrowse")?.addEventListener("click", browseWorkspaceFolder);
  document.getElementById("btnWorkspaceRefresh")?.addEventListener("click", openWorkspaceModal);
  document.getElementById("btnWorkspaceManual")?.addEventListener("click", async () => {
    const next = (workspaceManual?.value || "").trim();
    if (!next) {
      setWorkspaceStatus("请先填写路径，或改用浏览选择", true);
      return;
    }
    try {
      await applyWorkspaceRoot(next);
    } catch (err) {
      setWorkspaceStatus(`切换失败：${err.message || err}`, true);
    }
  });
  workspaceModal?.addEventListener("click", (e) => {
    if (e.target === workspaceModal) closeWorkspaceModal();
  });
  templateModal?.addEventListener("click", (e) => {
    if (e.target === templateModal) closeTemplateModal();
  });
  skinModal?.addEventListener("click", (e) => {
    if (e.target === skinModal) closeSkinModal();
  });

  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      saveFile();
      return;
    }
    const tag = e.target && e.target.tagName;
    if (tag === "TEXTAREA" || tag === "INPUT") return;
    if (e.key === "ArrowLeft") goPage(-1);
    if (e.key === "ArrowRight") goPage(1);
  });

  setInterval(() => updateNowBar(editor.value), 30_000);

  if (pageStage && typeof ResizeObserver !== "undefined") {
    let resizeTick = null;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTick);
      resizeTick = setTimeout(() => {
        if (latestPreviewHtml) schedulePaginate(latestPreviewHtml);
      }, 120);
    });
    ro.observe(pageStage);
  }

  (async () => {
    setStickersEnabled(stickersEnabled);
    setSkinDecorEnabled(skinDecorEnabled);
    paintStickerFormControls();
    paintFonts();
    loadUserStickers();
    renderUserStickers();

    if (!DEMO_FORCED) {
      try {
        const res = await fetch("/api/workspace", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          workspaceRoot = data.workspace || "";
          demoMode = false;
        } else {
          demoMode = true;
        }
      } catch {
        demoMode = true;
      }
    } else {
      demoMode = true;
    }

    await loadSkins();
    if (demoMode) await initDemoMode();
    else await refreshList("", true);
  })();
})();
