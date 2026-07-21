import * as culori from "culori";
import { toPng } from "html-to-image";
import { ColorService } from "react-color-palette";
import {
  GayButtonSettings,
  GayToolbarSettings,
  persistedSettingsKeys,
  savedConfigKeys,
  SettingsAccordionSections,
} from "./types";

const ACCORDION_SECTIONS: (keyof SettingsAccordionSections)[] = [
  "layout",
  "appearance",
  "other",
];

export type Position = { x: number; y: number };

/** Obsidian pop-out windows: use focused window's document when available (tests fall back to `document`). */
export function getActiveDocument(): Document {
  const g = globalThis as typeof globalThis & { activeDocument?: Document };
  return g.activeDocument ?? document;
}

/** Convert hex for react-color-palette (RGB 0–255, HSV s/v 0–100 — not culori’s 0–1). */
export const hexToIColor = (color: string) =>
  ColorService.convert("hex", color);

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
  swipeBorderWidth: number = 20,
  bottomBuffer: number = 0
) => {
  const parentNode = getActiveDocument().querySelector(
    ".app-container"
  ) as HTMLElement;
  if (parentNode) {
    parentNode.style.setProperty("--press-delay", `${pressDelayMs}ms`);
    const borderWidth = `${rowHeight * (swipeBorderWidth / 100)}px`;
    parentNode.style.setProperty("--button-border-width", borderWidth);
    parentNode.style.setProperty("--bottom-buffer", `${bottomBuffer}px`);
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
  const element = getActiveDocument().getElementById("gay-button-grid");
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
  /** Original locale date/time when epoch could not be parsed (legacy files). */
  dateLabel?: string;
}

/**
 * Resolve a saved-config timestamp from markdown metadata.
 * Prefer machine-readable **Timestamp:** (epoch ms). Fall back to **Date:**
 * locale strings from older files — those often fail to parse (e.g. DD/MM/YYYY).
 */
export const resolveConfigTimestamp = (
  timestampRaw: string | undefined,
  datePart: string | undefined,
  timePart: string | undefined
): number => {
  if (timestampRaw) {
    const epoch = Number(timestampRaw.trim());
    if (Number.isFinite(epoch) && epoch > 0) return epoch;
  }
  if (datePart && timePart) {
    const parsed = new Date(`${datePart} ${timePart}`);
    const ms = parsed.getTime();
    if (Number.isFinite(ms)) return ms;
  }
  return 0;
};

export const formatConfigDisplayDate = (
  timestamp: number,
  dateLabel?: string
): string => {
  if (Number.isFinite(timestamp) && timestamp > 0) {
    try {
      return new Intl.DateTimeFormat().format(new Date(timestamp));
    } catch {
      /* fall through */
    }
  }
  if (dateLabel) {
    // "21/01/2026 at 21:52:20" → date part only
    const at = dateLabel.indexOf(" at ");
    return at >= 0 ? dateLabel.slice(0, at) : dateLabel;
  }
  return "Unknown date";
};

export const formatConfigDisplayTime = (
  timestamp: number,
  dateLabel?: string
): string => {
  if (Number.isFinite(timestamp) && timestamp > 0) {
    try {
      return new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(new Date(timestamp));
    } catch {
      /* fall through */
    }
  }
  if (dateLabel) {
    const at = dateLabel.indexOf(" at ");
    return at >= 0 ? dateLabel.slice(at + 4) : "";
  }
  return "";
};

export const parseMarkdownConfigs = (content: string): MarkdownConfig[] => {
  const configs: MarkdownConfig[] = [];
  const sections = content.split(/^## /m).filter((section) => section.trim());

  for (const section of sections) {
    const lines = section.split("\n");
    const id = lines[0].trim();
    // Skip the file title section ("Gay Toolbar Saved Configs")
    if (!id || id.startsWith("Gay Toolbar")) continue;

    const timestampMatch = section.match(/\*\*Timestamp:\*\* (\d+)/);
    const dateMatch = section.match(/\*\*Date:\*\* (.+?) at (.+?)$/m);
    const screenshotMatch = section.match(
      /!\[.*?\]\(data:image\/png;base64,([^)]+)\)/
    );
    const dataMatch = section.match(/```json\n([\s\S]*?)\n```/);

    // Require screenshot + JSON; date metadata may be missing or unparseable
    if (id && screenshotMatch && dataMatch) {
      const date = resolveConfigTimestamp(
        timestampMatch?.[1],
        dateMatch?.[1],
        dateMatch?.[2]
      );
      const dateLabel =
        dateMatch && date <= 0
          ? `${dateMatch[1]} at ${dateMatch[2]}`
          : undefined;
      configs.push({
        id,
        date,
        screenshot: `data:image/png;base64,${screenshotMatch[1]}`,
        data: dataMatch[1],
        ...(dateLabel ? { dateLabel } : {}),
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
    const hasEpoch = Number.isFinite(config.date) && config.date > 0;
    content += `## ${config.id}\n\n`;
    if (hasEpoch) {
      const date = new Date(config.date);
      const formattedDate = date.toLocaleDateString();
      const formattedTime = date.toLocaleTimeString();
      content += `**Timestamp:** ${date.getTime()}\n\n`;
      content += `**Date:** ${formattedDate} at ${formattedTime}\n\n`;
    } else if (config.dateLabel) {
      // Preserve legacy locale date string; Timestamp added on next save once known
      content += `**Date:** ${config.dateLabel}\n\n`;
    } else {
      content += `**Date:** Unknown\n\n`;
    }
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

export const normalizeAngle = (degrees: number): number =>
  ((degrees % 360) + 360) % 360;

export const angularDistance = (a: number, b: number): number => {
  const diff = Math.abs(normalizeAngle(a) - normalizeAngle(b));
  return Math.min(diff, 360 - diff);
};

export const getSwipeAngle = (
  index: number,
  swipeCount: number,
  offsetAngle = 0
): number => normalizeAngle((360 * index) / swipeCount + offsetAngle);

export const syncSwipeColorsToButtonColor = (
  swipeCommands: GayButtonSettings["swipeCommands"],
  backgroundColor: string
): GayButtonSettings["swipeCommands"] => {
  if (!swipeCommands?.length) return swipeCommands;
  return swipeCommands.map((entry) =>
    entry && typeof entry === "object"
      ? { ...entry, color: backgroundColor }
      : entry
  );
};

export const syncAllSwipeColorsToButtonColors = (
  buttons: Record<string, GayButtonSettings>
): Record<string, GayButtonSettings> => {
  const next: Record<string, GayButtonSettings> = { ...buttons };
  for (const id of Object.keys(next)) {
    const button = next[id];
    const swipeCommands = syncSwipeColorsToButtonColor(
      button.swipeCommands,
      button.backgroundColor
    );
    if (swipeCommands !== button.swipeCommands) {
      next[id] = { ...button, swipeCommands };
    }
  }
  return next;
};

export type SwipeColorAnchor = { angle: number; color: string };

export const interpolateHexColors = (
  colorA: string,
  colorB: string,
  weightA: number
): string => {
  const a = culori.parse(colorA);
  const b = culori.parse(colorB);
  if (!a || !b) return colorA;
  const rgbA = culori.rgb(a);
  const rgbB = culori.rgb(b);
  if (!rgbA || !rgbB) return colorA;
  const weightB = 1 - weightA;
  const mixed = {
    mode: "rgb" as const,
    r: rgbA.r * weightA + rgbB.r * weightB,
    g: rgbA.g * weightA + rgbB.g * weightB,
    b: rgbA.b * weightA + rgbB.b * weightB,
  };
  const hex = culori.formatHex(mixed);
  return hex ?? colorA;
};

export const colorForSwipeAngle = (
  angle: number,
  anchors: SwipeColorAnchor[],
  fallbackBackgroundColor: string
): string => {
  if (anchors.length === 0) return fallbackBackgroundColor;
  if (anchors.length === 1) return anchors[0].color;

  const θ = normalizeAngle(angle);
  const byDistance = [...anchors].sort(
    (a, b) => angularDistance(θ, a.angle) - angularDistance(θ, b.angle)
  );
  const nearest = byDistance[0];
  const second = byDistance[1];

  if (angularDistance(θ, nearest.angle) < 0.01) return nearest.color;

  const d1 = angularDistance(θ, nearest.angle);
  const d2 = angularDistance(θ, second.angle);
  if (d1 + d2 === 0) return nearest.color;

  const weightNearest = d2 / (d1 + d2);
  return interpolateHexColors(nearest.color, second.color, weightNearest);
};

export const swipeColorAnchorsFromCommands = (
  swipeCommands: ({ color: string } | null)[],
  swipeRingOffsetAngle = 0
): SwipeColorAnchor[] => {
  const count = swipeCommands.length;
  if (!count) return [];
  return swipeCommands.flatMap((entry, index) => {
    if (!entry) return [];
    return [
      {
        angle: getSwipeAngle(index, count, swipeRingOffsetAngle),
        color: entry.color,
      },
    ];
  });
};

export const assignSwipeColorsFromSlot = (
  incomingSwipes: ({ commandId: string; icon: string; color: string } | null)[],
  incomingOffset: number,
  slotSwipes: ({ color: string } | null)[],
  slotOffset: number,
  slotBackgroundColor: string
): ({ commandId: string; icon: string; color: string } | null)[] => {
  const anchors = swipeColorAnchorsFromCommands(slotSwipes, slotOffset);
  const count = incomingSwipes.length;
  if (!count) return incomingSwipes;

  return incomingSwipes.map((entry, index) => {
    if (!entry) return null;
    const angle = getSwipeAngle(index, count, incomingOffset);
    return {
      ...entry,
      color: colorForSwipeAngle(angle, anchors, slotBackgroundColor),
    };
  });
};

/**
 * Migrates settings by adding missing keys from default settings
 * @param settings - Current settings object (will be mutated)
 * @param defaultSettings - Default settings to migrate from
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
      // Only assign if the default has the key and is not undefined
      (settings as any)[key] =
        defaultSettings[key as keyof typeof defaultSettings];
      hasMissingKeys = true;
    }
  }

  return hasMissingKeys;
};

/**
 * First-time upgrade from adoptSlotColorsOnDrop to lockColorsInPlace.
 * Preserves the user's prior adopt-slot choice; new installs keep migrateSettings default.
 */
export const migrateLockColorsInPlace = (
  settings: GayToolbarSettings
): boolean => {
  const hadLockColorsInPlace =
    "lockColorsInPlace" in settings &&
    settings.lockColorsInPlace !== undefined;

  if (hadLockColorsInPlace) return false;

  const hadAdoptSlotColorsOnDrop =
    "adoptSlotColorsOnDrop" in settings &&
    settings.adoptSlotColorsOnDrop !== undefined;

  if (!hadAdoptSlotColorsOnDrop) return false;

  settings.lockColorsInPlace = settings.adoptSlotColorsOnDrop;
  settings.adoptSlotColorsOnDrop = false;
  return true;
};

/**
 * Merges and normalizes openAccordions from defaults with current settings.
 * @param settings - Current settings (will be mutated)
 * @param defaultSettings - Default settings to merge from
 * @returns Whether openAccordions was updated (so caller can persist)
 */
export const migrateOpenAccordions = (
  settings: GayToolbarSettings,
  defaultSettings: GayToolbarSettings
): boolean => {
  const defaultAccordions = defaultSettings.openAccordions;
  const current = settings.openAccordions;
  const merged: SettingsAccordionSections = {
    ...defaultAccordions,
    ...(current && typeof current === "object" ? current : {}),
  };
  for (const s of ACCORDION_SECTIONS) {
    if (typeof merged[s] !== "boolean") merged[s] = defaultAccordions[s];
  }
  const currentKeys =
    current && typeof current === "object" ? Object.keys(current) : [];
  const needsMigration =
    !current ||
    ACCORDION_SECTIONS.some((s) => (current as Record<string, unknown>)?.[s] === undefined) ||
    currentKeys.some((key) => !ACCORDION_SECTIONS.includes(key as keyof SettingsAccordionSections));
  if (needsMigration) {
    settings.openAccordions = {
      layout: merged.layout,
      appearance: merged.appearance,
      other: merged.other,
    };
    return true;
  }
  return false;
};

/**
 * Normalize a saved-config JSON blob for applying to the live store:
 * migrate missing schema keys, drop non-layout fields that must stay current.
 */
export const prepareLoadedSavedConfig = (
  parsedData: Record<string, unknown>,
  current: Pick<
    GayToolbarSettings,
    "customCommands" | "presetColors" | "savedConfigsFilePath"
  >,
  defaultSettings: GayToolbarSettings
): Partial<GayToolbarSettings> => {
  const {
    configs: _configs,
    customCommands: _customCommands,
    presetColors: _presetColors,
    savedConfigsFilePath: _savedConfigsFilePath,
    openAccordions: _openAccordions,
    showNewVersionNotes: _showNewVersionNotes,
    lastSeenUpdateNotesVersion: _lastSeenUpdateNotesVersion,
    ...rest
  } = parsedData;

  const migrated = { ...rest } as GayToolbarSettings;
  migrateLockColorsInPlace(migrated);
  migrateSettings(migrated, defaultSettings);

  const settingsToLoad: Partial<GayToolbarSettings> = {};
  for (const key of savedConfigKeys) {
    if (key in migrated && migrated[key] !== undefined) {
      (settingsToLoad as any)[key] = migrated[key];
    }
  }

  return {
    ...settingsToLoad,
    customCommands: current.customCommands ?? [],
    presetColors: current.presetColors ?? [],
    savedConfigsFilePath: current.savedConfigsFilePath,
  };
};

/** Subset of settings stored in data.json — safe to merge into the Zustand store. */
export function pickPersistedSettings(
  settings: GayToolbarSettings
): Partial<GayToolbarSettings> {
  const toMerge: Partial<GayToolbarSettings> = {};
  for (const k of persistedSettingsKeys) {
    if ((settings as Record<string, unknown>)[k] !== undefined) {
      (toMerge as Record<string, unknown>)[k] = (
        settings as Record<string, unknown>
      )[k];
    }
  }
  return toMerge;
}

/** Turning update notes back on replays the current version after settings close. */
export function patchShowNewVersionNotesToggle(
  wasEnabled: boolean,
  nowEnabled: boolean
): Partial<
  Pick<GayToolbarSettings, "showNewVersionNotes" | "lastSeenUpdateNotesVersion">
> {
  if (nowEnabled && !wasEnabled) {
    return { showNewVersionNotes: true, lastSeenUpdateNotesVersion: "" };
  }
  return { showNewVersionNotes: nowEnabled };
}
