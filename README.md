# 颜色亮度调节器

一个基于 OKLCH 色彩空间的专业颜色处理工具，专门用于精确调整颜色的亮度并保持色彩饱和度特征。

## 📸 功能特性

- **智能亮度调整** - 使用先进的算法压缩高亮度范围，让颜色更适合界面显示
- **相对色度保持** - 在调整亮度时智能保持颜色的相对饱和度特征
- **多格式支持** - 支持 HEX、RGB、OKLCH 格式的输入和输出
- **色域优化** - 自动检测并适配 sRGB 显示器色域限制
- **灰度智能处理** - 对灰度色进行特殊处理，保持无彩度特征
- **实时预览** - 提供直观的原始颜色和处理后颜色对比
- **精确算法** - 使用二分查找法计算最大可用色度值

## 🔧 核心算法

### 亮度调整公式

```
L_new = min(2 × L_original - 1.3, 0.5)
```

### 相对色度计算

- 基于当前亮度和色相计算最大可能色度
- 保持颜色的相对饱和度比例
- 特殊色相区间 (30°-210°) 确保最小相对色度为 0.8

### 色域适配

- 使用二分查找法确定 sRGB 色域内的最大色度值
- 自动裁剪超出色域的颜色参数
- 最终色度限制在 0.2 以内确保显示效果

## 🚀 开始使用

### 安装依赖

```bash
bun install
# 或
npm install
```

### 启动开发服务器

```bash
bun dev
# 或
npm run dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
bun run build
# 或
npm run build
```

## 🎯 使用方法

1. **输入颜色** - 在输入框中输入任何有效的颜色值（支持 HEX、RGB、HSL、颜色名称等）
2. **选择输出格式** - 从下拉菜单中选择期望的输出格式
3. **调整选项** - 勾选"Fixed Relative Chroma"以启用相对色度保持功能
4. **查看结果** - 实时查看原始颜色和处理后颜色的对比效果

## 🛠️ 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **UI 组件**: Radix UI
- **颜色处理**: chroma-js
- **包管理**: Bun

## 📊 应用场景

- **UI 设计** - 为界面元素生成合适亮度的颜色
- **主题设计** - 创建统一的色彩体系
- **品牌色彩** - 调整品牌色在不同场景下的表现
- **无障碍设计** - 优化颜色对比度和可读性
- **色彩研究** - 分析和处理 OKLCH 色彩空间中的颜色

## 🔬 算法原理

本工具基于 [OKLCH 色彩空间](https://oklch.com/) 进行颜色处理，这是一个感知均匀的色彩空间，能够提供更准确和一致的颜色调整效果。核心处理流程包括：

1. **输入解析** - 将任意格式颜色转换为 OKLCH
2. **灰度检测** - 识别并特殊处理灰度色 (C < 0.009)
3. **相对色度计算** - 基于当前 L、C、H 值计算相对饱和度
4. **色相调整** - 对特定色相范围应用最小饱和度约束
5. **亮度压缩** - 使用非线性公式调整亮度范围
6. **色度重计算** - 基于新亮度和相对色度计算最终色度值
7. **色域适配** - 确保结果在 sRGB 色域内可正确显示

详细的处理流程请参考 [color-processor.md](./color-processor.md) 文档。

## 📄 许可证

本项目采用 MIT 许可证。
