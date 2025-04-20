import chroma from "chroma-js";
import { toPng } from "html-to-image";

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

export const pointerInside = (
  event: React.PointerEvent<HTMLButtonElement>,
  el: HTMLElement | null,
) => {
  if (!el) return false;

  const { x, y, width, height } = el.getBoundingClientRect();
  if (
    event.clientX >= x &&
    event.clientX <= x + width &&
    event.clientY >= y &&
    event.clientY <= y + height
  )
    return true;

  return false;
};

export const getLuminanceGuidedIconColor = (
  bgColorString: string,
  contrastThreshold = 4.5,
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
  // })
  // })
};
