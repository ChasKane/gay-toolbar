import * as culori from "culori";
import { toPng } from "html-to-image";
import { off } from "process";

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
