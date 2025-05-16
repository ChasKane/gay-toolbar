import chroma from "chroma-js";
import { toPng } from "html-to-image";
import { off } from "process";

export type Position = { x: number; y: number };

export const hexToIColor = (color: string) => {
  const C = chroma(color);
  const [r, g, b] = C.rgb();
  const [h, s, v] = C.hsv();
  return {
    hex: color,
    rgb: { r, g, b, a: C.alpha() },
    hsv: { h, s, v, a: C.alpha() },
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
  const delta = 360 - ((startAngle - angle) % 360);
  const swipeIdx = Math.floor(delta / slotLen);
  console.log([angle, offset, length], [startAngle, slotLen, delta], swipeIdx);
  return swipeIdx;
};

export const getLuminanceGuidedIconColor = (
  bgColorString: string,
  contrastThreshold = 4.5
) => {
  const matches = bgColorString.match(/#(?:[0-9a-fA-F]{3,4}){1,2}\b/g);

  const bgColor = matches ? chroma.average(matches) : chroma(bgColorString);
  const bgLuminance = bgColor.luminance();
  let iconColor;

  if (bgLuminance > 0.7) {
    iconColor = bgColor.set("lab.l", 40);
  } else if (bgLuminance < 0.3) {
    iconColor = bgColor.set("lab.l", 90);
  } else {
    // mid-range
    iconColor =
      bgLuminance >= 0.5 ? bgColor.set("lab.l", 10) : bgColor.set("lab.l", 90);
  }

  // Additional contrast adjustments for edge cases
  if (chroma.contrast(bgColor, iconColor) < contrastThreshold) {
    iconColor =
      bgLuminance > 0.5 ? iconColor.darken(1.5) : iconColor.brighten(1.5);
  }

  return iconColor.alpha(1).hex();
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
