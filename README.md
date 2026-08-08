# 青叶笺

手账风格的 Markdown 编辑器：学习计划、日记、清单都能写成一页纸笺——横线本、皮肤、贴纸、翻页，预览即可导出打印。

🌿 **在线 Demo（免安装）：** [https://zhiqiangbao.github.io/qingye-jian/](https://zhiqiangbao.github.io/qingye-jian/)

> 浏览器里直接试用手账皮肤、贴纸、字体、翻页与导出。Demo 将内容保存在本机浏览器，也可下载 `.md`；完整读写文件请用桌面版。

关键词：手账 · Markdown · 学习计划 · 日记 · 贴纸 · 皮肤 · 笔记

仓库：[qingye-jian](https://github.com/ZhiqiangBao/qingye-jian)

## 功能

- Markdown 编辑 + 成品页预览（摊开 / 草稿 / 阅读）
- 任务勾选与完成进度
- 多套手账皮肤（纸张尺寸、横线、配色）；可导入自定义皮肤
- 用户贴纸（形状、文字、拖动、按页保存）
- 多种笔迹字体
- 强制分页：`<!-- pagebreak -->` 让标题顶到页首
- 模板导入（`templates/`）
- 导出打印 / 另存 PDF（可选是否带贴纸）
- 打包版无黑色终端窗口
- GitHub Pages 在线 Demo

## 使用

### 在线 Demo

打开：[https://zhiqiangbao.github.io/qingye-jian/](https://zhiqiangbao.github.io/qingye-jian/)

适合快速体验手账界面。更新 Demo 资源时：

```bash
python packaging/sync_pages_demo.py
git add docs/
git commit -m "Update Pages demo"
git push
```

推送到 `master` 后由 `.github/workflows/pages.yml` 自动部署。

### 打包版（完整功能）

1. 打开 `release/qingye-jian/`（或 Release 压缩包）
2. 双击 **青叶笺.exe**
3. 浏览器会自动打开；默认进入 `document/` 内容库
4. 用完点顶部「退出」，关闭后台服务

### 开发运行

```bash
python server.py --open
```

浏览器访问 `http://127.0.0.1:8765/`。不要直接双击打开 `index.html`。

## 帮助

编辑技巧见 `help/编辑技巧.md`，或启动后点顶部「帮助」。

常用分页写法：

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
  document/             默认工作区（示例内容）
  packaging/            图标与打包脚本
  docs/                 GitHub Pages 静态 Demo
  release/qingye-jian/  打包成品（本地生成）
```

## 重新打包

```bash
python packaging/build_release.py
```

生成无控制台窗口的发布目录：`release/qingye-jian/`（含 `青叶笺.exe`）。

## Git 规则

- 仓库根目录的私人 `.md`：不提交（除本 `README.md`）
- 子文件夹内的 demo / 模板 `.md`（如 `document/`、`templates/`、`help/`）：可提交
- `workspace.json`、`dist/`、`build/`、`release/`：本机产物，不提交
