手账皮肤说明（skins/*.json）
============================

皮肤可以设计：
1) 配色 colors + 桌面氛围 deskWash
2) 预览比例 / 横竖 / 自定义比 / 圆角 / 高度 paper
3) 横线样式与间距 paper.lines
4) 左侧红线（手账边线）paper.marginLine
5) 框架布局 layout（侧栏宽、螺旋圈、胶带、花瓣）
6) stickers：皮肤自带的小装饰 emoji（可选，界面可关）

预览比例与翻页（重要）：
- paper.size = a4 / a5 / b6 / square 时，预览按对应 ISO **长宽比**显示
- 名称沿用 a4/a5 只为好记；**不等于**打印机托盘里的 A4/A5 物理纸张
- 导出 PDF 按屏幕上成品页画布像素折算 mm，随窗口与布局变化
- 内容超出一页时，在预览底部「上一页 / 下一页」翻页（仅 UI，不改 md 文件）
- 编辑区（草稿纸）仍连续滚动，不分页
- full / wide：预览铺满工作区，仍可按高度分页翻页

横页与自定义比例（写在皮肤 JSON，无界面快捷开关）：
- paper.orientation = "portrait"（默认）| "landscape"
  → 在 a4/a5/b6 上对调宽高比（square 不变）
- paper.aspect = "16 / 9" 或 "3/2" 或 "1.414"
  → 自定义 CSS 长宽比；**优先于** size + orientation
  → 一旦设置 aspect，预览变为固定比例页（即使 size 是 full/wide）
- 芯片文案：竖页「A5比例」、横页「A5横」、自定义「自定义比」

注意：能写文字、选形状的「用户贴纸」是编辑器里的功能，
不写在皮肤 JSON 里；按每个 md 页面保存在浏览器本地。

把 JSON 放进本文件夹，或在软件里点「导入皮肤」。
也可复制 example-user-skin.json 改一改。

-------- 字段示例 --------
{
  "id": "my-skin",
  "name": "我的皮肤",
  "stamp": "自订",
  "desc": "一句话说明",
  "preset": false,
  "colors": {
    "ink": "#3d4a45",
    "inkSoft": "#6d7a74",
    "paper": "#f8faf7",
    "sage": "#7fafa0",
    "sageDeep": "#5a8f7f",
    "blush": "#e7a8b2",
    "sky": "#8eb8c9",
    "lemon": "#e6d39a"
  },
  "deskWash": "linear-gradient(...)",
  "paper": {
    "size": "a5",
    "orientation": "landscape",
    "aspect": "16 / 9",
    "minHeight": "68vh",
    "radius": "18px",
    "shadow": "0 12px 30px rgba(70,95,85,0.12)",
    "lines": {
      "enabled": true,
      "style": "solid",
      "gap": "1.7rem",
      "color": "rgba(120,150,140,0.22)",
      "offsetTop": "2.6rem"
    },
    "marginLine": {
      "enabled": true,
      "left": "2.1rem",
      "color": "rgba(231,168,178,0.45)"
    }
  },
  "layout": {
    "sidebarWidth": "15.2rem",
    "notebookMaxWidth": "1180px",
    "showSpiral": true,
    "showTape": true,
    "showPetals": true,
    "contentGap": "0.9rem"
  },
  "stickers": [
    { "emoji": "🌿", "top": "7%", "right": "3%", "rotate": "12", "size": "1.5rem" }
  ]
}

paper.size: full | wide | a4 | a5 | b6 | square
  → 界面显示为「A4比例 / A5比例 …」；只定预览长宽比
  a4 ≈ 210:297 · a5 ≈ 148:210 · b6 ≈ 125:176 · square = 1:1
paper.orientation: portrait | landscape（可选）
paper.aspect: "宽 / 高" 或小数（可选，优先）
paper.lines.style: solid | dashed | dotted | grid | none
stickers 最多 24 个；位置用 top/left/right/bottom（如 "8%"）
