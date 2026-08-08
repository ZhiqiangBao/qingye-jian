<div align="center">

# 青叶笺

**手账风格 Markdown 编辑器**  
学习计划 · 日记 · 清单 —— 写成一页会呼吸的纸笺

<br/>

[![Online Demo](https://img.shields.io/badge/%F0%9F%8C%BF_在线_Demo-立即试用-7fafa0?style=for-the-badge&labelColor=3d4a45)](https://zhiqiangbao.github.io/qingye-jian/)
[![GitHub](https://img.shields.io/badge/GitHub-qingye--jian-8eb8c9?style=for-the-badge&logo=github&labelColor=3d4a45)](https://github.com/ZhiqiangBao/qingye-jian)

<br/>

</div>

---

<table>
  <tr>
    <td width="100%" align="center" valign="top">

### 🌿 在线 Demo

免安装，浏览器打开即可体验手账皮肤、贴纸、翻页与导出  
内容保存在本机浏览器，也可下载为 `.md`

<br/>

**→ [https://zhiqiangbao.github.io/qingye-jian/](https://zhiqiangbao.github.io/qingye-jian/) ←**

<br/>

<sub>完整本地读写文件请使用桌面版「青叶笺.exe」</sub>

</td>
  </tr>
</table>

---

## 为什么是青叶笺

不是冷冰冰的文档页，而是摊开在书桌上的一页纸：横线、边线、皮肤与贴纸都在。  
适合学习计划、考研日程、日常手账草稿——好看，也能认真写。

| 手账感 | 能认真用 | 可带走 |
| :---: | :---: | :---: |
| 皮肤 · 横线 · 贴纸 · 笔迹字体 | 勾选进度 · 分页 · 模板 | 导出打印 / PDF · 下载 md |

---

## 功能一览

<table>
<tr>
<td width="50%" valign="top">

**书写与预览**
- Markdown 编辑 + 成品页预览
- 摊开 / 草稿 / 阅读三种视图
- 任务勾选与完成进度
- `<!-- pagebreak -->` 标题顶到页首

</td>
<td width="50%" valign="top">

**手账氛围**
- 多套皮肤（纸张尺寸 / 横线 / 配色）
- 可导入自定义皮肤 JSON
- 用户贴纸：形状、文字、拖动、按页保存
- 多种笔迹字体

</td>
</tr>
<tr>
<td width="50%" valign="top">

**模板与导出**
- `templates/` 一键导入计划模板
- 导出打印 / 另存 PDF
- 可选是否带贴纸

</td>
<td width="50%" valign="top">

**桌面与 Demo**
- 打包版无黑色终端窗口
- GitHub Pages 在线 Demo
- 本地 `server.py` 开发调试

</td>
</tr>
</table>

---

## 快速开始

### ① 先玩 Demo（推荐）

打开卡片里的链接即可：  
[https://zhiqiangbao.github.io/qingye-jian/](https://zhiqiangbao.github.io/qingye-jian/)

更新静态 Demo 资源：

```bash
python packaging/sync_pages_demo.py
git add docs/
git commit -m "Update Pages demo"
git push
```

推送到 `master` 后由 `.github/workflows/pages.yml` 自动部署。

### ② 桌面完整版

1. 打开 `release/qingye-jian/`（或 Release 压缩包）
2. 双击 **青叶笺.exe**
3. 浏览器自动打开，默认进入 `document/`
4. 用完点顶部「退出」

### ③ 开发运行

```bash
python server.py --open
```

访问 `http://127.0.0.1:8765/`  
请勿直接双击打开 `index.html`。

---

## 帮助速查

编辑技巧见 [`help/编辑技巧.md`](help/编辑技巧.md)，或启动后点顶部「帮助」。

强制分页（大标题顶到页首）：

```md
<!-- pagebreak -->
## 大标题
```

---

## 仓库结构

```text
qingye-jian/
  index.html / app.js / styles.css / server.py
  help/                 编辑技巧
  templates/            计划模板
  skins/                手账皮肤
  document/             默认工作区（示例）
  packaging/            图标与打包脚本
  docs/                 GitHub Pages 静态 Demo
  promo/                推广文案等
  release/qingye-jian/  打包成品（本地生成）
```

---

## 重新打包

```bash
python packaging/build_release.py
```

生成无控制台窗口的发布目录：`release/qingye-jian/`（含 `青叶笺.exe`）。

---

## Git 规则

- 仓库根目录的私人 `.md`：不提交（除本 `README.md`）
- 子文件夹内的 demo / 模板 `.md`（如 `document/`、`templates/`、`help/`）：可提交
- `workspace.json`、`dist/`、`build/`、`release/`：本机产物，不提交

---

<div align="center">

**青叶笺** · 让计划也有纸笺的温度  

[在线 Demo](https://zhiqiangbao.github.io/qingye-jian/) · [GitHub](https://github.com/ZhiqiangBao/qingye-jian)

</div>
