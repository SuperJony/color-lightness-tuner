"use client";

import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import chroma from "chroma-js";
import { useEffect, useState } from "react";

type ColorFormat = "hex" | "rgb" | "oklch";

/**
 * 使用二分查找法找到给定亮度(L)和色相(H)下的最大色度(C)值
 * 在 OKLCH 色彩空间中，并非所有的 L,C,H 组合都能在 sRGB 显示器上显示
 * 该函数通过二分查找找到在不超出 sRGB 色域的情况下可用的最大 C 值
 *
 * @param l - 亮度值 (0-1)
 * @param h - 色相值 (0-360)
 * @returns 最大可用的色度值
 */
function findMaxChroma(l: number, h: number): number {
  let left = 0;
  let right = 0.4; // OKLCH 中 C 的最大理论值约为 0.4
  const epsilon = 0.001; // 精度阈值

  while (right - left > epsilon) {
    const mid = (left + right) / 2;
    const color = chroma.oklch(l, mid, h);

    // 检查颜色是否在 sRGB 色域内
    if (color.clipped()) {
      // console.log(`Color is clipped: ${color.hex()}`);
      right = mid;
    } else {
      left = mid;
    }
  }
  // console.log(`Max chroma: ${left}`);
  return left;
}

/**
 * 计算给定颜色的相对色度值
 * 相对色度 = 当前色度 / 该亮度和色相下的最大可能色度
 * 这个值用于在改变亮度时保持颜色的相对饱和度
 *
 * @param l - 亮度值 (0-1)
 * @param c - 色度值 (0-0.4)
 * @param h - 色相值 (0-360)
 * @returns 相对色度值 (0-1)
 */
function calculateRelativeChroma(l: number, c: number, h: number): number {
  const maxC = findMaxChroma(l, h);
  return c > maxC ? 1 : c / maxC;
}

/**
 * 根据色相值调整相对色度
 * - 对于灰度色（无彩色），保持零色度
 * - h在(30, 210)时，最小值不小于0.8
 *
 * @param relativeChroma - 原始相对色度值
 * @param h - 色相值 (0-360)
 * @param isGrayscale - 是否为灰度色
 * @returns 调整后的相对色度值
 */
function adjustRelativeChromaByHue(
  relativeChroma: number,
  h: number,
  isGrayscale: boolean
): number {
  // 如果是灰度色，返回0以保持无彩度
  if (isGrayscale) {
    return 0;
  }

  // 确保色相值在0-360范围内
  h = ((h % 360) + 360) % 360;

  if (h > 30 && h <= 210) {
    return Math.max(0.8, relativeChroma);
  }

  return relativeChroma;
}

/**
 * 处理输入颜色，主要进行以下操作：
 * 1. 将输入颜色转换为 OKLCH 格式
 * 2. 计算相对色度以保持颜色的饱和度特征
 * 3. 调整亮度值（降低亮度）
 * 4. 基于新亮度和相对色度重新计算合适的色度值
 * 5. 将结果转换为指定的输出格式
 *
 * @param inputColor - 输入的颜色值（支持多种格式）
 * @param outputFormat - 期望的输出格式（hex/rgb/oklch）
 * @param useRelativeChroma - 是否使用相对色度调整
 * @returns 处理后的颜色字符串
 */
function processColor(
  inputColor: string,
  outputFormat: ColorFormat,
  useRelativeChroma: boolean
): string {
  try {
    const color = chroma(inputColor).oklch();
    let [l, c, h] = color;

    // 判断是否为灰度色（色度接近于0）
    const isGrayscale = c < 0.001;

    // 计算并调整相对色度
    const baseRelativeChroma = calculateRelativeChroma(l, c, h);
    const relativeChroma = adjustRelativeChromaByHue(
      baseRelativeChroma,
      h,
      isGrayscale
    );
    console.log(
      `relativeChroma: ${relativeChroma}, baseRelativeChroma: ${baseRelativeChroma}`
    );

    // 计算调整后的亮度
    l = Math.min(2 * l - 1.3, 0.5);

    // 如果是灰度色，保持零色度
    // 如果使用相对色度，则按相对色度计算色度
    // 否则不做调整
    if (isGrayscale) {
      c = 0;
    } else if (useRelativeChroma) {
      c = Math.max(findMaxChroma(l, h) * relativeChroma, c);
    } else {
      c = Math.min(c, findMaxChroma(l, h));
    }

    // 调整后的颜色, 控制 c 的值最大为 0.2
    const adjustedColor = chroma.oklch(l, c > 0.2 ? 0.2 : c, h);

    // 转换输出格式
    switch (outputFormat) {
      case "hex":
        return adjustedColor.hex();
      case "rgb":
        return `rgb(${adjustedColor.rgb().join(", ")})`;
      case "oklch":
        const [l, c, h] = adjustedColor.oklch();
        return `oklch(${l.toFixed(2)} ${c.toFixed(3)} ${h.toFixed(2)})`;
      default:
        throw new Error("Invalid output format");
    }
  } catch (error) {
    console.error("Error processing color:", error);
    return "Invalid color";
  }
}

/**
 * 颜色处理器组件
 * 提供用户界面来转换和处理颜色：
 * - 支持输入任何有效的颜色值
 * - 可选择输出格式（HEX/RGB/OKLCH）
 * - 实时显示原始颜色和处理后的颜色
 * - 自动进行颜色转换和处理
 */
export default function ColorProcessor() {
  const [inputColor, setInputColor] = useState("#FFE4DF");
  const [outputFormat, setOutputFormat] = useState<ColorFormat>("hex");
  const [processedColor, setProcessedColor] = useState("");
  const [useRelativeChroma, setUseRelativeChroma] = useState(true);

  useEffect(() => {
    const result = processColor(inputColor, outputFormat, useRelativeChroma);
    console.log(result);
    setProcessedColor(result);
  }, [inputColor, outputFormat, useRelativeChroma]);

  return (
    <Card className="w-full max-w-[600px] p-8">
      <div className="space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">
            Color Converter
            <div
              className="h-[2px] w-48  mt-1"
              style={{ backgroundColor: processedColor }}
            />
          </h1>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Input Color</h2>
          <Input
            value={inputColor}
            onChange={(e) => setInputColor(e.target.value)}
            className="text-base"
          />
          <div className="flex items-center space-x-2">
            <Checkbox
              id="fixed-relative-chroma"
              checked={useRelativeChroma}
              onCheckedChange={(checked) =>
                setUseRelativeChroma(checked as boolean)
              }
            />
            <label
              htmlFor="fixed-relative-chroma"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Fixed Relative Chroma
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Output Format</h2>
          <Select
            value={outputFormat}
            onValueChange={(value: ColorFormat) => setOutputFormat(value)}
          >
            <SelectTrigger className="text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hex">HEX</SelectItem>
              <SelectItem value="rgb">RGB</SelectItem>
              <SelectItem value="oklch">OKLCH</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Original Color</h2>
            <div
              className="w-full h-24 rounded-lg border border-gray-900/10"
              style={{ backgroundColor: inputColor }}
            />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Processed Color</h2>
            <div
              className="w-full h-24 rounded-lg border border-gray-900/10 "
              style={{ backgroundColor: processedColor }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Output Color</h2>
          <Input
            value={processedColor}
            readOnly
            className="text-base bg-gray-50"
          />
        </div>
      </div>
    </Card>
  );
}
