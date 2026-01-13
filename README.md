
## 项目简介

昭景是一款基于 Plasmo 的浏览器扩展，用于在任意页面上进行 rrweb 录制并在本地 IndexedDB 中保存回放记录。通过弹窗页控制录制状态，内容脚本负责实际录制，Service Worker 将录制数据持久化，配置页提供记录管理与回放能力。

## 主要特性

- 一键开始/停止录制，支持当前活动标签页状态同步
- rrweb 事件流录制与本地回放
- 录制列表管理：查看、删除、下载 JSON
- 记录存储于 IndexedDB，离线可用
- Plasmo 架构：弹窗、内容脚本、Service Worker、Options 页面分层清晰

## 架构与数据流

1) 弹窗页 [src/popup.tsx](src/popup.tsx) 向当前标签的内容脚本发送 `GET`/`SET` 消息以查询或切换录制状态。
2) 内容脚本 [src/contents/plasmo.ts](src/contents/plasmo.ts) 使用 rrweb 录制事件流，收到 `SET` 时启动/停止，停止后将 `{timestamp,url,records,duration}` 通过 `SAVE_RECORDING` 消息发给背景。
3) Service Worker [src/background.ts](src/background.ts) 接收 `SAVE_RECORDING`，调用 [src/lib/indexeddb.ts](src/lib/indexeddb.ts) 将记录写入 IndexedDB。
4) Options 页面 [src/options.tsx](src/options.tsx) 读取 IndexedDB 记录，提供列表、删除、下载，并通过 [src/components/RRWebPlayer.tsx](src/components/RRWebPlayer.tsx) 回放。

流程概念：弹窗控制 → 内容脚本录制 → 背景存储 → Options 回放。

## 快速开始

### 环境要求
- Node.js 18+
- pnpm 8+

### 安装依赖

```bash
pnpm install
```

### 开发调试

```bash
pnpm dev
```

Plasmo 会启动开发服务器并输出浏览器扩展的加载路径。按照终端提示在浏览器中加载打包目录。

### 构建发布

```bash
pnpm build
# 或打包为可分发压缩包
pnpm package
```

## 使用指南

1) 在浏览器中加载扩展后，点击工具栏图标打开弹窗。
2) 点击“开始录制”后，内容脚本开始记录当前页 rrweb 事件；再次点击会停止并保存。
3) 点击“查看记录”跳转 Options 页面，可在左侧列表选择记录，右侧回放。
4) 在列表中可删除或下载记录（JSON 文件包含事件流与元数据）。

## 代码结构概览

- 弹窗控制： [src/popup.tsx](src/popup.tsx)
- 内容录制： [src/contents/plasmo.ts](src/contents/plasmo.ts)
- 背景存储： [src/background.ts](src/background.ts)
- 回放管理： [src/options.tsx](src/options.tsx)
- 数据持久化： [src/lib/indexeddb.ts](src/lib/indexeddb.ts)
- 工具函数： [src/lib/utils.ts](src/lib/utils.ts)
- UI 组件： [src/components](src/components)

## 开发说明

- 消息协议：弹窗/内容脚本使用 `Action` 类型 `GET` | `SET` 查询或切换录制状态；内容脚本向背景发送 `SAVE_RECORDING` 持久化。
- 录制实现：rrweb `record()` 采集事件流，停止时计算 `duration` 并清空缓存。
- 存储模型：IndexedDB 库 `zhaojing-records`，表 `recordings`，键自增，字段见 `Recording` 接口。
- UI 与样式：Tailwind 与 shadcn/ui 组件集，部分自定义样式位于 [src/style](src/style).

## 参考

- 架构图源文件： [assets/zhaojing.drawio](assets/zhaojing.drawio)

