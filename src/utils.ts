import * as culori from "culori";
import { toPng } from "html-to-image";
import { GayToolbarSettings, savedConfigKeys } from "./types";

export type Position = { x: number; y: number };

export const hexToIColor = (color: string) => {
  const parsed = culori.parseHex(color);
  if (!parsed) {
    return {
      hex: color,
      rgb: { r: 0, g: 0, b: 0, a: 1 },
      hsv: { h: 0, s: 0, v: 0, a: 1 },
    };
  }

  const rgb = culori.rgb(parsed);
  const hsv = culori.hsv(parsed);

  return {
    hex: color,
    rgb: {
      r: rgb?.r || 0,
      g: rgb?.g || 0,
      b: rgb?.b || 0,
      a: rgb?.alpha || 1,
    },
    hsv: {
      h: hsv?.h || 0,
      s: hsv?.s || 0,
      v: hsv?.v || 0,
      a: hsv?.alpha || 1,
    },
  };
};

export const getDistance = (initYX?: Position, finalXY?: Position) => {
  if (!initYX || !finalXY) {
    console.error(initYX, finalXY);
    return 0;
  }
  return Math.hypot(finalXY.x - initYX.x, finalXY.y - initYX.y);
};

/**
 * Given an angle (degrees) and a radius (px),
 * returns top/left CSS coords to position an absolutely‐positioned
 * element around the center of its parent.
 */
export const positionAt = (
  angle: number,
  radiusPercentage: number
): { top: string; left: string; transform: string } => {
  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * radiusPercentage;
  const y = Math.sin(rad) * radiusPercentage;

  return {
    left: `calc(50% + (50%*${x}))`,
    top: `calc(50% + (50%*${y}))`,
    transform: "translate(-50%, -50%)",
  };
};

export const getAngle = (initYX: Position, finalXY: Position) => {
  const normalizedX = finalXY.x - initYX.x;
  const normalizedY = finalXY.y - initYX.y;
  let rad = Math.atan2(normalizedY, normalizedX);
  if (rad < 0) rad += Math.PI * 2;
  const angle = (360 * rad) / (Math.PI * 2);
  return angle % 360;
};

export const getSwipeIdx = (angle: number, offset: number, length: number) => {
  if (angle < 0 || angle > 360) {
    console.error(angle);
    return 0;
  }
  let startAngle = (offset - 360 / (length * 2)) % 360;
  if (startAngle < 0) startAngle += 360;
  const slotLen = 360 / length;
  // TODO is there any better way to do this than modding by 360 twice? re: js % not modding negative numbers correctly
  const delta = (360 - ((startAngle - angle) % 360)) % 360;
  const swipeIdx = Math.floor(delta / slotLen);
  // console.table({
  //   angle,
  //   offset,
  //   length,
  //   startAngle,
  //   slotLen,
  //   delta,
  //   swipeIdx,
  // });
  return swipeIdx;
};

export const getLuminanceGuidedIconColor = (
  bgColorString: string,
  contrastThreshold = 4.5
): string => {
  try {
    const matches = bgColorString.match(/#(?:[0-9a-fA-F]{3,4}){1,2}\b/g);
    const parsedColors = matches
      ? matches.map(culori.parseHex).filter(Boolean)
      : [];
    const bgColor =
      parsedColors.length > 0
        ? culori.average(parsedColors as any)
        : culori.parseHex(bgColorString);

    if (!bgColor) {
      return "#000000"; // Fallback for invalid color
    }

    const bgLuminance = culori.wcagLuminance(bgColor);
    let iconColor;

    if (bgLuminance > 0.7) {
      const lch = culori.lch(bgColor);
      iconColor = culori.rgb({ ...lch, l: 40 });
    } else if (bgLuminance < 0.3) {
      const lch = culori.lch(bgColor);
      iconColor = culori.rgb({ ...lch, l: 90 });
    } else {
      // mid-range
      const lch = culori.lch(bgColor);
      iconColor = culori.rgb({
        ...lch,
        l: bgLuminance >= 0.5 ? 10 : 90,
      });
    }

    // Additional contrast adjustments for edge cases
    if (culori.wcagContrast(bgColor, iconColor) < contrastThreshold) {
      const lch = culori.lch(iconColor);
      iconColor = culori.rgb({
        ...lch,
        l: bgLuminance > 0.5 ? lch.l * 0.5 : Math.min(100, lch.l * 1.5),
      });
    }

    const result = culori.formatHex({ ...iconColor, alpha: 1 });
    return result || "#000000"; // Fallback if formatHex returns undefined
  } catch (error) {
    console.warn("Error in getLuminanceGuidedIconColor:", error);
    return "#000000"; // Fallback for any errors
  }
};

export const groomValue = (
  val: number,
  step: number,
  bounds: [number, number]
) =>
  Math.clamp(
    step === 1 ? val : Math.round(val * 100) / 100,
    bounds[0],
    bounds[1]
  );

export const setCSSVariables = (
  pressDelayMs: number,
  rowHeight: number,
  swipeBorderWidth: number = 20
) => {
  const parentNode = document.querySelector(".app-container") as HTMLElement;
  if (parentNode) {
    parentNode.style.setProperty("--press-delay", `${pressDelayMs}ms`);
    const borderWidth = `${rowHeight * (swipeBorderWidth / 100)}px`;
    parentNode.style.setProperty("--button-border-width", borderWidth);
  }
};

export const centerButtonsRadius = 0.5;
export const positionCentralItem: (multiple: number) => any = (
  multiple: number
) => ({
  ...positionAt(multiple * 45, centerButtonsRadius),
  position: "absolute",
});

// ============================================================================= //

export const takeSnapshot = async () => {
  const element = document.getElementById("gay-button-grid");
  if (!element) {
    throw new Error("Element not found");
  }

  element.classList.add("disable-animations");

  try {
    return await toPng(element);
  } catch (error) {
    console.error("Error capturing snapshot:", error);
    throw error;
  } finally {
    element.classList.remove("disable-animations");
  }
};

// ============================================================================= //
// Markdown file utilities for screenshot storage

export interface MarkdownConfig {
  id: string;
  date: number;
  screenshot: string;
  data: string;
}

export const parseMarkdownConfigs = (content: string): MarkdownConfig[] => {
  const configs: MarkdownConfig[] = [];
  const sections = content.split(/^## /m).filter((section) => section.trim());

  for (const section of sections) {
    const lines = section.split("\n");
    const id = lines[0].trim();
    const dateMatch = section.match(/\*\*Date:\*\* (.+?) at (.+?)$/m);
    const screenshotMatch = section.match(
      /!\[.*?\]\(data:image\/png;base64,([^)]+)\)/
    );
    const dataMatch = section.match(/```json\n([\s\S]*?)\n```/);

    if (id && dateMatch && screenshotMatch && dataMatch) {
      // Parse the formatted date back to timestamp
      const dateStr = `${dateMatch[1]} ${dateMatch[2]}`;
      const parsedDate = new Date(dateStr);
      const timestamp = parsedDate.getTime();

      configs.push({
        id,
        date: timestamp,
        screenshot: `data:image/png;base64,${screenshotMatch[1]}`,
        data: dataMatch[1],
      });
    }
  }

  return configs;
};

export const generateMarkdownContent = (configs: MarkdownConfig[]): string => {
  if (configs.length === 0) {
    return "# Gay Toolbar Saved Configs\n\nNo saved configs yet.";
  }

  let content = "# Gay Toolbar Saved Configs\n\n";

  for (const config of configs) {
    const date = new Date(config.date);
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString();

    content += `## ${config.id}\n\n`;
    content += `**Date:** ${formattedDate} at ${formattedTime}\n\n`;
    content += `![Toolbar Screenshot](${config.screenshot})\n\n`;
    content += `**Settings:**\n\n`;
    content += `\`\`\`json\n${config.data}\n\`\`\`\n\n`;
    content += `---\n\n`;
  }

  return content;
};

export const addConfigToMarkdown = (
  content: string,
  newConfig: MarkdownConfig
): string => {
  const existingConfigs = parseMarkdownConfigs(content);
  const updatedConfigs = [newConfig, ...existingConfigs];
  return generateMarkdownContent(updatedConfigs);
};

export const removeConfigFromMarkdown = (
  content: string,
  configId: string
): string => {
  const existingConfigs = parseMarkdownConfigs(content);
  const updatedConfigs = existingConfigs.filter(
    (config: MarkdownConfig) => config.id !== configId
  );
  return generateMarkdownContent(updatedConfigs);
};

/**
 * Calculates the position for swipe icons around a button.
 * Uses a piecewise linear approximation to position icons in 8 octants.
 *
 * @param idx - The index of the swipe command (0-based)
 * @param swipeCommandsLength - Total number of swipe commands
 * @param swipeRingOffsetAngle - Offset angle in degrees for the swipe ring
 * @returns CSS positioning object with top, left, and transform properties
 */
export const getSwipeIconPosition = (
  idx: number,
  swipeCommandsLength: number,
  swipeRingOffsetAngle: number
): { top: string; left: string; transform: string } => {
  const angle = (360 * idx) / swipeCommandsLength + (swipeRingOffsetAngle ?? 0);

  // Normalize angle to 0-360 range to handle cases where angle >= 360
  const normalizedAngle = ((angle % 360) + 360) % 360;

  const rad = (normalizedAngle * Math.PI) / 180;
  let x: number = 0;
  let y: number = 0;

  // TODO do this better using interpolation, minding bgScale
  if (normalizedAngle >= 0 && normalizedAngle < 45) {
    x = 1;
    y = normalizedAngle / 45;
  } else if (normalizedAngle >= 1 * 45 && normalizedAngle < 3 * 45) {
    x = -(normalizedAngle / 45 - 2);
    y = 1;
  } else if (normalizedAngle >= 3 * 45 && normalizedAngle < 5 * 45) {
    x = -1;
    y = -(normalizedAngle / 45 - 4);
  } else if (normalizedAngle >= 5 * 45 && normalizedAngle < 7 * 45) {
    x = normalizedAngle / 45 - 6;
    y = -1;
  } else if (normalizedAngle >= 7 * 45 && normalizedAngle < 360) {
    x = 1;
    y = normalizedAngle / 45 - 8;
  }

  return {
    left: `calc(50% + (50%*${x}))`,
    top: `calc(50% + (50%*${y}))`,
    transform: `translate(-50%,-50%) translate(calc(50%*${-x!}), calc(50%*${-y!}))`,
  };
};

/**
 * Migrates settings by adding missing keys from default settings
 * @param settings - Current settings object (will be mutated)
 * @param defaultSettings - Default settings to migrate from
 * @param savedConfigKeys - Keys that should be migrated
 * @returns Whether any keys were added (for logging purposes)
 */
export const migrateSettings = (
  settings: GayToolbarSettings,
  defaultSettings: GayToolbarSettings
): boolean => {
  let hasMissingKeys = false;

  for (const key of savedConfigKeys) {
    if (
      !(key in settings) ||
      settings[key as keyof typeof settings] === undefined
    ) {
      console.log(
        `Adding missing setting: ${key} = ${JSON.stringify(
          defaultSettings[key as keyof typeof defaultSettings]
        )}`
      );
      // Only assign if the default has the key and is not undefined
      (settings as any)[key] =
        defaultSettings[key as keyof typeof defaultSettings];
      hasMissingKeys = true;
    }
  }

  return hasMissingKeys;
};
