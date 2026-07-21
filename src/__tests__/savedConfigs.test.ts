import {
  formatConfigDisplayDate,
  formatConfigDisplayTime,
  generateMarkdownContent,
  parseMarkdownConfigs,
  prepareLoadedSavedConfig,
  resolveConfigTimestamp,
} from "../utils";
import DEFAULT_SETTINGS from "../Settings/DEFAULT_SETTINGS";
import { GayToolbarSettings } from "../types";

describe("saved config markdown dates", () => {
  it("prefers Timestamp epoch over locale Date strings", () => {
    expect(
      resolveConfigTimestamp("1737412345000", "21/01/2026", "21:52:20")
    ).toBe(1737412345000);
  });

  it("falls back to Date when Timestamp is missing and parseable", () => {
    // US-style MM/DD/YYYY often parses; DD/MM with day>12 does not
    const ms = resolveConfigTimestamp(undefined, "01/12/2026", "18:25:47");
    expect(Number.isFinite(ms) && ms > 0).toBe(true);
  });

  it("returns 0 for unparseable locale dates instead of NaN", () => {
    expect(resolveConfigTimestamp(undefined, "20/07/2026", "00:09:26")).toBe(0);
    expect(resolveConfigTimestamp(undefined, "21/01/2026", "21:52:20")).toBe(0);
  });

  it("formatters never throw on invalid timestamps", () => {
    expect(formatConfigDisplayDate(NaN)).toBe("Unknown date");
    expect(formatConfigDisplayDate(0)).toBe("Unknown date");
    expect(formatConfigDisplayTime(NaN)).toBe("");
    expect(formatConfigDisplayTime(0)).toBe("");
    expect(formatConfigDisplayDate(0, "20/07/2026 at 00:09:26")).toBe(
      "20/07/2026"
    );
    expect(formatConfigDisplayTime(0, "20/07/2026 at 00:09:26")).toBe(
      "00:09:26"
    );
    expect(() => formatConfigDisplayDate(Date.now())).not.toThrow();
  });

  it("parses legacy locale-only configs without crashing and keeps entries", () => {
    const legacy = `# Gay Toolbar Saved Configs

## abc123

**Date:** 20/07/2026 at 00:09:26

![Toolbar Screenshot](data:image/png;base64,aaaa)

**Settings:**

\`\`\`json
{"buttonIds":["b1"],"numRows":3}
\`\`\`

---
`;
    const configs = parseMarkdownConfigs(legacy);
    expect(configs).toHaveLength(1);
    expect(configs[0].id).toBe("abc123");
    expect(configs[0].date).toBe(0);
    expect(configs[0].dateLabel).toBe("20/07/2026 at 00:09:26");
    expect(configs[0].data).toContain("buttonIds");
    expect(formatConfigDisplayDate(configs[0].date, configs[0].dateLabel)).toBe(
      "20/07/2026"
    );

    // Regenerating must preserve the locale label, not invent "now"
    const regenerated = generateMarkdownContent(configs);
    expect(regenerated).toContain("**Date:** 20/07/2026 at 00:09:26");
    expect(regenerated).not.toContain("**Timestamp:**");
  });

  it("round-trips Timestamp through generate + parse", () => {
    const epoch = 1752970166000;
    const md = generateMarkdownContent([
      {
        id: "xyz",
        date: epoch,
        screenshot: "data:image/png;base64,abc",
        data: '{"numRows":2}',
      },
    ]);
    expect(md).toContain(`**Timestamp:** ${epoch}`);
    const parsed = parseMarkdownConfigs(md);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].date).toBe(epoch);
  });
});

describe("prepareLoadedSavedConfig", () => {
  const current = {
    customCommands: [
      { id: "keep", name: "Keep", content: "1" },
    ],
    presetColors: ["#aaa"],
    savedConfigsFilePath: "MyConfigs.md",
  };

  it("fills missing schema keys from defaults when loading an old config", () => {
    const oldConfig = {
      buttonIds: ["btn1"],
      numRows: 4,
      numCols: 5,
      // neither lockColorsInPlace nor adoptSlotColorsOnDrop — use defaults
      customCommands: [{ id: "old", name: "Old", content: "x" }],
      presetColors: ["#old"],
    };

    const loaded = prepareLoadedSavedConfig(
      oldConfig,
      current,
      DEFAULT_SETTINGS as GayToolbarSettings
    );

    expect(loaded.buttonIds).toEqual(["btn1"]);
    expect(loaded.numRows).toBe(4);
    expect(loaded.lockColorsInPlace).toBe(
      DEFAULT_SETTINGS.lockColorsInPlace
    );
    expect(loaded.swipeColorsFromPalette).toBe(
      DEFAULT_SETTINGS.swipeColorsFromPalette
    );
    expect(loaded.lockSwipeColorsToButton).toBe(
      DEFAULT_SETTINGS.lockSwipeColorsToButton
    );
    expect(loaded.customCommands).toEqual(current.customCommands);
    expect(loaded.presetColors).toEqual(current.presetColors);
    expect(loaded.savedConfigsFilePath).toBe("MyConfigs.md");
  });

  it("maps adoptSlotColorsOnDrop false to lockColorsInPlace false", () => {
    const oldConfig = {
      buttonIds: ["btn1"],
      adoptSlotColorsOnDrop: false,
    };

    const loaded = prepareLoadedSavedConfig(
      oldConfig,
      current,
      DEFAULT_SETTINGS as GayToolbarSettings
    );

    expect(loaded.lockColorsInPlace).toBe(false);
    expect(loaded.adoptSlotColorsOnDrop).toBe(false);
  });

  it("maps adoptSlotColorsOnDrop to lockColorsInPlace when upgrading", () => {
    const oldConfig = {
      buttonIds: ["btn1"],
      adoptSlotColorsOnDrop: true,
    };

    const loaded = prepareLoadedSavedConfig(
      oldConfig,
      current,
      DEFAULT_SETTINGS as GayToolbarSettings
    );

    expect(loaded.lockColorsInPlace).toBe(true);
    expect(loaded.adoptSlotColorsOnDrop).toBe(false);
  });

  it("preserves layout values from the saved config over defaults", () => {
    const oldConfig = {
      buttonIds: ["a", "b"],
      numRows: 9,
      rowHeight: 42,
      backgroundColor: "#123456",
    };

    const loaded = prepareLoadedSavedConfig(
      oldConfig,
      current,
      DEFAULT_SETTINGS as GayToolbarSettings
    );

    expect(loaded.numRows).toBe(9);
    expect(loaded.rowHeight).toBe(42);
    expect(loaded.backgroundColor).toBe("#123456");
  });
});
