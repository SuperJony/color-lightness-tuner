# Color Processor 颜色处理流程

```mermaid
flowchart TD
    %% 设置节点样式
    classDef start fill:#2ecc71,stroke:#27ae60,color:white
    classDef process fill:#3498db,stroke:#2980b9,color:white
    classDef condition fill:#e74c3c,stroke:#c0392b,color:white
    classDef output fill:#f1c40f,stroke:#f39c12,color:black
    classDef special fill:#9b59b6,stroke:#8e44ad,color:white

    Start([开始]) --> Input[输入颜色]
    Input --> ConvertOKLCH[转换为OKLCH格式]
    ConvertOKLCH --> ExtractValues[提取L,C,H值]

    ExtractValues --> IsGray{"是否为灰度色?
    C < 0.009"}

    IsGray -->|是| SetZeroChroma[设置色度为0]
    IsGray -->|否| CalcRelativeChroma[计算相对色度]

    CalcRelativeChroma --> AdjustByHue[根据色相调整相对色度]
    AdjustByHue --> CheckHue{"30° < H <= 210°?"}
    CheckHue -->|是| SetMinChroma[设置最小相对色度为0.8]
    CheckHue -->|否| KeepChroma[保持原相对色度]

    SetMinChroma & KeepChroma --> AdjustL[调整亮度值]
    SetZeroChroma --> AdjustL

    AdjustL --> UseRelative{"使用相对色度?"}

    UseRelative -->|是| CalcNewChroma1["C = max(findMaxChroma × relativeChroma, C)"]
    UseRelative -->|否| CalcNewChroma2["C = min(C, findMaxChroma)"]

    CalcNewChroma1 & CalcNewChroma2 --> LimitChroma[限制色度不超过0.2]

    LimitChroma --> ConvertFormat["转换为目标格式
    hex/rgb/oklch"]

    ConvertFormat --> Output[输出处理后的颜色]
    Output --> End([结束])

    %% 应用样式
    class Start,End start
    class Input,ConvertOKLCH,ExtractValues,SetZeroChroma,CalcRelativeChroma,AdjustByHue,SetMinChroma,KeepChroma,AdjustL,CalcNewChroma1,CalcNewChroma2,LimitChroma process
    class IsGray,CheckHue,UseRelative condition
    class Output,ConvertFormat output
    class CalcNewChroma1,CalcNewChroma2 special
```

## 处理步骤说明

### 1. 颜色输入与转换

- 接受多种格式的颜色输入
- 统一转换为 OKLCH 色彩空间处理

### 2. 灰度检测

- 当色度 C < 0.009 时判定为灰度色
- 灰度色维持零色度处理

### 3. 相对色度处理

- 计算基础相对色度值
- 特殊色相区间(30°-210°)强制最小相对色度 0.8

### 4. 亮度调整

- 使用公式：L = min(2L - 1.3, 0.5)
- 压缩高亮度范围

### 5. 色度计算与限制

- 根据相对色度模式选择计算方式
- 使用二分法确定最大色度
- 限制最终色度不超过 0.2

### 6. 输出转换

- 支持转换为 hex/rgb/oklch 格式
- 保证输出格式的精确性

## 注意事项

1. 所有计算在 OKLCH 色彩空间进行
2. 考虑 sRGB 显示器色域限制
3. 包含完整的错误处理机制
4. 保证色彩还原的准确性
