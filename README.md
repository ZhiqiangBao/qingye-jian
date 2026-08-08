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
