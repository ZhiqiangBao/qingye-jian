# 青叶笺

本地手账风格的 Markdown 阅读 / 编辑器。写学习计划、日记或小清单，预览像摊开一页纸笺：横线、皮肤、贴纸、翻页，都能直接导出打印。

GitHub 仓库名：**qingye-jian**

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

## 使用

### 打包版（推荐）

1. 打开 `release/qingye-jian/`
2. 双击 **青叶笺.exe**
3. 浏览器会自动打开；默认进入 `document/` 内容库
4. 用完点顶部「退出」，关闭后台服务

### 开发运行

```bash
python server.py --open
```

浏览器访问 `http://127.0.0.1:8765/`。不要直接双击打开 `index.html`。

### GitHub Pages 在线 Demo

仓库已带静态 Demo（无 Python 后端）：可试皮肤、贴纸、翻页、模板、导出；保存写入浏览器本地并可下载 `.md`。

1. 仓库 **Settings → Pages**
2. Source 选 **GitHub Actions**
3. 推送 `master`/`main` 后自动部署（工作流：`.github/workflows/pages.yml`）
4. 打开：`https://zhiqiangbao.github.io/qingye-jian/`

本地预览 Demo：

```bash
python packaging/sync_pages_demo.py
# 再用任意静态服务器打开 docs/，例如：
python -m http.server 8080 --directory docs
```

也可在 Settings → Pages 里改用 **Deploy from a branch**，文件夹选 `/docs`（需先运行上面的 sync 并提交 `docs/`）。

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
  docs/                 GitHub Pages 静态 Demo（可由脚本生成）
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
