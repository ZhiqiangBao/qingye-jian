<div align="center">

# 青叶笺

### 把计划，写成一页会呼吸的纸笺

手账风格的 Markdown 编辑器  
**学习计划 · 日记 · 清单 · 复盘**

<br/>

[![在线 Demo](https://img.shields.io/badge/%F0%9F%8C%BF_在线_Demo-点此试用-7fafa0?style=for-the-badge&labelColor=3d4a45)](https://zhiqiangbao.github.io/qingye-jian/)
[![下载桌面版](https://img.shields.io/badge/%E2%AC%87%EF%B8%8F_桌面版-Releases-8eb8c9?style=for-the-badge&labelColor=3d4a45)](https://github.com/ZhiqiangBao/qingye-jian/releases)
[![GitHub stars](https://img.shields.io/github/stars/ZhiqiangBao/qingye-jian?style=for-the-badge&labelColor=3d4a45&color=e7a8b2)](https://github.com/ZhiqiangBao/qingye-jian/stargazers)

<br/>

`横线纸`　`皮肤`　`贴纸`　`笔迹字体`　`翻页`　`导出打印`

</div>

---

<blockquote>
<p align="center">
不是冷冰冰的文档页，<br/>
而是摊开在书桌上的一页纸——<br/>
有横线、有边线，还能贴一张今日备注。
</p>
</blockquote>

<p align="center">
适合：学生党写学习计划 · 考研排日程 · 喜欢手账却想用 Markdown 的人
</p>

---

## 为什么是青叶笺

| | 普通编辑器 | **青叶笺** |
| :--- | :--- | :--- |
| 看起来 | 白底黑字 | 手账纸面、皮肤、笔迹 |
| 记任务 | 纯列表 | 可勾选，进度一眼可见 |
| 排版 | 滚动到底 | 成品页翻页，大标题可顶到页首 |
| 心情 | 办公感 | 书桌感、纸笺感 |

---

## 亮点速览

**纸面与氛围**  
多套手账皮肤（预览比例、横线、配色），笔迹字体可换；预览就是成品页。  
皮肤 JSON 可设 `orientation: "landscape"` 横页，或 `aspect: "16 / 9"` 自定义长宽比（详见 [`skins/README.txt`](./skins/README.txt)）。

**贴纸小宇宙**  
便签、圆形、胶带……写上字、拖到想贴的地方；按页保存，撕掉也方便。

**认真写计划**  
任务勾选、完成进度、计划模板；写完可以按成品页尺寸导出 PDF。

**两种打开方式**  
浏览器里先玩 Demo；需要完整读写本地文件、导出 PDF 时，再下载桌面版。

---

## 立即开始

### 1. 在线 Demo（零安装）

打开就能换皮肤、贴贴纸、翻页，试手感：

**[https://zhiqiangbao.github.io/qingye-jian/](https://zhiqiangbao.github.io/qingye-jian/)**

> Demo 内容保存在你的浏览器里，也可下载为 `.md`。  
> **在线 Demo 不提供 PDF 导出**（没有本地服务与无头浏览器）。需要 PDF 请用桌面版；Demo 里仍可打开导出页下载 HTML。

### 2. 桌面版（完整体验）

1. 前往 **[Releases](https://github.com/ZhiqiangBao/qingye-jian/releases)** 下载压缩包  
2. 解压后双击 **青叶笺**  
3. 用完点界面顶部「退出」，或直接关闭标签页（后台会在几秒内自动退出）

**导出 PDF（桌面版）**

- **矢量（推荐）**：调用本机 Edge/Chrome 无头打印，文字清晰、文件较小，页面尺寸=当前成品页画布（不强制塞进 A4）。需已安装 Edge 或 Chrome。  
- **高清 / 标准位图**：不依赖浏览器，清晰度与体积折中备选。

### 3. 从源码运行（git clone）

适合开发或不想用打包版的情况。只需本机有 **Python 3.10+**（仅用标准库，无需 `pip install`）。

```bash
git clone https://github.com/ZhiqiangBao/qingye-jian.git
cd qingye-jian
python server.py
```

- 默认会打开浏览器访问 `http://127.0.0.1:8765/`
- 若不希望自动打开浏览器：`python server.py --no-open`，再手动访问上述地址
- 笔记默认在仓库内 `document/`；也可用界面「工作区」改到别的文件夹
- 用完请点界面顶部「退出」，或关闭标签页（后台约数秒内自动退出）
- 矢量 PDF 同样需要本机已安装 Edge 或 Chrome

打包桌面版（可选）：

```bash
python packaging/build_release.py
```

产物在 `release/qingye-jian/`。

---

## 一个很有用的小技巧

想让某个大标题从**新一页最上方**开始？在标题正上方写一行：

```md
<!-- pagebreak -->
## 上午时段
```

更多手账写法见 [`help/编辑技巧.md`](./help/编辑技巧.md)，或启动后点「帮助」。

---

## 适用场景

- 一日学习计划 / 考研冲刺日  
- 周末轻量安排、复盘清单  
- 想用手账气质写 Markdown 的日常笔记  

---

## 版本更新 · v0.2.1

- 关闭编辑器标签页后，本地后台约数秒内自动退出（也可点「退出」立即关闭）

## 版本更新 · v0.2.0

### 导出与版式

- 成品页导出：PDF **页面尺寸与当前预览画布一致**（所见即所得，不再为塞进 A4 而拉伸重排）
- **矢量 PDF**：本机 Edge/Chrome 无头打印，内嵌字体、文字可缩放仍清晰
- **位图 PDF 备选**：高清（PNG）/ 标准（JPEG），无浏览器时仍可导出
- 导出前可选保存路径；多页时显示生成进度
- **GitHub Pages Demo：不提供 PDF**（说明见上）

### 体验与工程

- 皮肤可声明横页（`orientation`）或自定义预览比（`aspect`）；a4/a5 仍只表示比例、非打印机纸型
- 截图链路改用 html2canvas-pro，兼容现代 CSS 颜色
- 字体 OFL 许可文本收入 `licenses/fonts/`
- 第三方组件说明见 [`licenses/third-party.md`](./licenses/third-party.md)

---

## 开源依赖与声明

所用库与字体均为可再分发的开源许可（MIT / SIL OFL 等），**无需额外向作者单独申请**。  
明细与注意事项：

- 第三方库与 Edge/Chrome 调用说明 → [`licenses/third-party.md`](./licenses/third-party.md)  
- 字体 OFL 原文 → [`licenses/fonts/`](./licenses/fonts/README.md)

矢量导出只**调用本机已安装的浏览器**，不把 Edge/Chrome 打进安装包，也不暗示与微软/谷歌官方隶属关系。

---

<div align="center">

**先点 Demo，三分钟感受一页纸笺。**

[在线试用](https://zhiqiangbao.github.io/qingye-jian/)　·　[下载桌面版](https://github.com/ZhiqiangBao/qingye-jian/releases)　·　[编辑技巧](./help/编辑技巧.md)

<br/>

<sub>青叶笺 · 让计划也有纸笺的温度</sub>

</div>
