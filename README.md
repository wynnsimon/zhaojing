# 昭景 (Zhaojing) - 页面录制与回放工具

一个功能强大的 Chrome 扩展，可以录制网页用户操作并实现完整的回放功能。基于 [rrweb](https://www.rrweb.io/) 库，提供高精度的网页交互录制。

## 功能特性

✨ **核心功能**
- 🎥 一键开始/停止页面录制
- 📊 完整记录页面交互（鼠标、键盘、滚动等）
- 🎬 逼真回放录制内容
- 💾 自动保存至浏览器存储
- 📝 录制记录管理（查看、删除）

⚙️ **技术特点**
- 支持大容量录制数据存储（IndexedDB）
- 实时录制 & 异步存储架构
- 响应式设计，支持左右面板调整
- 优雅的 UI 界面

## 项目结构

```
src/
├── popup.tsx              # Popup 页面 - 控制录制
├── options.tsx            # Options 页面 - 查看录制记录
├── background.ts          # Background 脚本 - 处理消息和存储
├── contents/
│   └── plasmo.ts         # Content Script - 网页注入，进行录制
├── components/
│   ├── RRWebPlayer.tsx   # rrweb 播放器组件
│   └── ui/               # shadcn/ui 组件库
├── lib/
│   ├── indexeddb.ts      # IndexedDB 操作库
│   └── utils.ts          # 工具函数
├── types.d.ts            # TypeScript 类型定义
└── style.css             # 全局样式
```

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

这会启动开发服务器，扩展会自动加载到 Chrome 中。

### 生产构建

```bash
pnpm build
```

### 打包扩展

```bash
pnpm package
```

## 使用方法

### 1. 录制页面操作

- 点击扩展图标打开 Popup
- 点击"开始录制"按钮
- 在网页上执行操作（点击、输入、滚动等）
- 点击"停止录制"完成录制
- 录制数据自动保存

### 2. 查看录制记录

- 在 Popup 中点击"查看录制记录"按钮
- 进入录制记录管理页面
- 左侧显示所有录制列表，包括：
  - 录制时间
  - 录制网址
  - 录制时长
- 点击任一记录，右侧自动播放该录制

### 3. 管理录制

- 选中任意记录可预览
- 点击"删除"按钮移除不需要的录制

## 架构说明

### 数据流

```
网页 (Content Script)
    ↓ [录制操作数据]
Background Script
    ↓ [保存数据]
扩展 IndexedDB
    ↓ [读取数据]
Options 页面 (展示回放)
```

### 关键模块

| 模块 | 职责 | 说明 |
|------|------|------|
| Content Script | 网页录制 | 使用 rrweb 在网页中录制操作 |
| Background | 消息处理 & 存储 | 接收 CS 消息，保存到 IndexedDB |
| Popup | 用户交互 | 控制录制开始/停止 |
| Options | 记录管理 | 查看、播放、删除录制 |
| IndexedDB | 数据持久化 | 大容量录制数据存储 |

## 技术栈

| 技术 | 用途 |
|------|------|
| React 18 | UI 框架 |
| TypeScript | 类型系统 |
| Plasmo | Chrome 扩展框架 |
| rrweb | 页面录制库 |
| rrweb-player | 录制回放 |
| shadcn/ui | 组件库 |
| Tailwind CSS | 样式框架 |
| IndexedDB | 数据存储 |

## 扩展权限

```json
{
  "permissions": ["tabs", "storage"],
  "host_permissions": ["https://*/*"]
}
```

- **tabs**: 获取当前标签页信息
- **storage**: 使用 chrome.storage API
- **host_permissions**: 在所有网站上运行 content script

## API 接口

### Content Script → Background

**消息格式：**
```typescript
{
  action: "SAVE_RECORDING",
  data: {
    timestamp: number,
    url: string,
    records: EventWithTime[],
    duration: number
  }
}
```

### IndexedDB 操作

```typescript
// 获取所有录制
const recordings = await getAllRecordings();

// 获取单个录制
const recording = await getRecording(id);

// 删除录制
await deleteRecording(id);

// 保存录制（由 background 调用）
await saveRecording(recordingData);
```

## 常见问题

### Q: 录制数据存储在哪里？
A: 存储在浏览器的 IndexedDB 中（扩展专用），容量很大（通常几百 MB）。

### Q: 支持跨域录制吗？
A: 支持，会录制指定标签页的所有网站操作。

### Q: 播放器支持哪些操作？
A: 支持播放、暂停、速度调整等基本操作（由 rrweb-player 提供）。

### Q: 可以导出录制吗？
A: 当前版本支持在页面查看。可在控制台中导出 JSON 数据。

## 开发指南

### 添加新功能

1. **修改 Content Script** (`src/contents/plasmo.ts`)
   - 修改录制逻辑
   - 修改消息格式需同步更新 Background

2. **修改 Background** (`src/background.ts`)
   - 修改存储逻辑
   - 添加新的消息处理

3. **修改 UI**
   - Popup: `src/popup.tsx`
   - Options: `src/options.tsx`
   - 新建组件放在 `src/components/`

### 调试

- **打开扩展控制台**: `chrome://extensions` → 选择扩展 → 检查视图
- **Content Script 日志**: 在网页控制台查看
- **Background 日志**: 在扩展控制台查看
- **Popup/Options 日志**: 在对应页面的开发者工具查看

## 性能优化建议

- 长时间录制可能消耗大量内存，建议定期停止和重新开始
- 录制高交互的应用（游戏、动画等）时数据量最大
- 定期删除不需要的录制以释放空间

## 许可证

MIT

## 作者

pinkdopeybug@163.com

## 更新日志

### v0.0.1
- 初始版本
- 基础录制和回放功能
- 录制记录管理
