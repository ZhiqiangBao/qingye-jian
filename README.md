<div align="center">

# 青叶笺

**手账风格 Markdown 编辑器**  
学习计划 · 日记 · 清单 —— 写成一页会呼吸的纸笺

<br/>

[![Online Demo](https://img.shields.io/badge/%F0%9F%8C%BF_在线_Demo-立即试用-7fafa0?style=for-the-badge&labelColor=3d4a45)](https://zhiqiangbao.github.io/qingye-jian/)
[![GitHub](https://img.shields.io/badge/GitHub-qingye--jian-8eb8c9?style=for-the-badge&logo=github&labelColor=3d4a45)](https://github.com/ZhiqiangBao/qingye-jian)

<br/>

<sub>浏览器免安装试用 · 皮肤 / 贴纸 / 翻页 / 导出 · 完整读写请用桌面版</sub>

</div>

---

## 为什么是青叶笺

不是冷冰冰的文档页，而是摊开在书桌上的一页纸：横线、边线、皮肤与贴纸都在。  
适合学习计划、考研日程、日常手账草稿——好看，也能认真写。

## 功能

- **书写预览**：Markdown 编辑 + 成品页；摊开 / 草稿 / 阅读；任务勾选与进度
- **手账氛围**：多套皮肤（纸张尺寸 / 横线 / 配色）、贴纸、笔迹字体；可导入皮肤 JSON
- **分页排版**：`<!-- pagebreak -->` 让大标题顶到页首
- **模板导出**：`templates/` 导入计划模板；导出打印 / PDF（可选贴纸）
- **桌面与 Demo**：打包版无黑色终端；GitHub Pages 在线试用

## 快速开始

**在线 Demo** → [zhiqiangbao.github.io/qingye-jian](https://zhiqiangbao.github.io/qingye-jian/)

更新静态资源后部署：

```bash
python packaging/sync_pages_demo.py
git add docs/ && git commit -m "Update Pages demo" && git push
```

**桌面完整版**

1. 打开 `release/qingye-jian/`（或 Release 压缩包）
2. 双击 **青叶笺.exe**，用完点顶部「退出」

**开发运行**

```bash
python server.py --open
```

访问 `http://127.0.0.1:8765/`（不要直接打开 `index.html`）。

## 帮助

详见 [`help/编辑技巧.md`](help/编辑技巧.md)，或启动后点「帮助」。

```md
<!-- pagebreak -->
## 大标题
```

## 目录

```text
qingye-jian/
  index.html / app.js / styles.css / server.py
  help/                 编辑技巧
  templates/            计划模板
  skins/                手账皮肤
  document/             默认工作区
  packaging/            打包脚本
  docs/                 Pages Demo
  promo/                推广文案
  release/              本地打包产物
```

## 重新打包

```bash
python packaging/build_release.py
```

## Git 规则

- 根目录私人 `.md` 不提交（除本 README）
- `document/`、`templates/`、`help/` 等可提交
- `workspace.json`、`dist/`、`build/`、`release/` 不提交

---

<div align="center">

<sub>青叶笺 · 让计划也有纸笺的温度</sub>

</div>
