# 第三方组件与运行依赖

青叶笺发行包内嵌或调用的第三方组件均为常见开源许可，**可合法用于开源与闭源分发**（按各许可证保留声明即可）。  
本文件便于核对；完整许可证文本见各组件官方仓库或本目录下字体 OFL 原文。

## 随仓库分发的库

| 组件 | 用途 | 许可 | 说明 |
|------|------|------|------|
| [html2canvas-pro](https://github.com/yorickshan/html2canvas-pro) | 位图 PDF 备选（截取成品页） | **MIT** | 文件名为 `html2canvas.min.js` |
| [jsPDF](https://github.com/parallax/jsPDF) | 将截图写入 PDF | **MIT** | `jspdf.umd.min.js` |
| [marked](https://github.com/markedjs/marked) | Markdown 渲染 | **MIT** | `marked.min.js` |
| Google Fonts 字体（见 [`fonts/`](./fonts/README.md)） | 界面与导出笔迹 | **SIL OFL 1.1** | 通过 CDN 加载；OFL 原文在 `licenses/fonts/*/OFL.txt` |

MIT / OFL 均允许商业使用与再分发；**无需向作者付费或单独申请授权**。  
分发时请保留上述库自带的版权与许可声明（min 文件头部已含），字体保留 OFL 文本即可。

## 不随仓库分发、由用户本机提供

| 组件 | 用途 | 说明 |
|------|------|------|
| Microsoft Edge / Google Chrome | **矢量 PDF**（无头 `--print-to-pdf`） | 调用用户已安装的浏览器，**不重新打包浏览器**。安装与使用遵循各浏览器自身条款；青叶笺仅作本地 CLI 调用。 |

未检测到 Edge/Chrome 时，桌面版可改用「高清/标准位图」导出，不依赖无头打印。

## 是否需要额外「声明」？

| 事项 | 建议 |
|------|------|
| 仓库 README 写明第三方与字体许可 | 推荐（已链到本页与 `fonts/`） |
| 发行 zip 内附 `licenses/` | 推荐（尤其含字体说明时） |
| 单独向 MIT/OFL 作者申请授权 | **不需要** |
| 把 Edge/Chrome 打进安装包 | **不要**；保持「调用本机浏览器」即可，也无需附带其许可 |
| 商标使用（Chrome / Edge 名称） | 说明「需安装」即可，勿暗示官方出品或隶属关系 |

> 本说明不构成法律意见；若计划上架应用商店或更改项目许可证，请再核对目标渠道规则。
