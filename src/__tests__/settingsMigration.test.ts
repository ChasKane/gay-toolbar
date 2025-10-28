import DEFAULT_SETTINGS from "../Settings/DEFAULT_SETTINGS";
import {
  GayButtonSettings,
  GayToolbarSettings,
  savedConfigKeys,
} from "../types";
import { migrateSettings } from "../utils";

describe("Settings Migration", () => {
  it("should identify missing settings keys correctly", () => {
    // Test old settings missing new keys
    const oldSettings: Partial<GayToolbarSettings> = {
      numRows: 2,
      numCols: 5,
      rowHeight: 20,
      gridGap: 2,
      gridPadding: 2,
      backgroundColor: "pink",
      customBackground: "",
      mobileOnly: false,
      pressDelayMs: 200,
      // Missing: swipeBorderWidth
      isMinimized: false,
      annoyingText: true,
      presetColors: ["#add8e6", "#ffb6c1"],
      buttonIds: [],
      buttonLocations: {},
      buttons: {},
      savedConfigsFilePath: "GayToolbarSavedConfigs.md",
      minimizedToolbarLoc: [0.9, 50],
    };

    const hasMissingKeys = migrateSettings(
      oldSettings as GayToolbarSettings,
      DEFAULT_SETTINGS
    );

    expect(hasMissingKeys).toBe(true);
    expect(oldSettings.swipeBorderWidth).toBe(
      DEFAULT_SETTINGS.swipeBorderWidth
    );
  });

  it("should add missing settings with correct default values", () => {
    const oldSettings: Partial<GayToolbarSettings> = {
      numRows: 2,
      numCols: 5,
      rowHeight: 20,
      // Missing: swipeBorderWidth
      pressDelayMs: 200,
    };

    const hasMissingKeys = migrateSettings(
      oldSettings as GayToolbarSettings,
      DEFAULT_SETTINGS
    );

    expect(hasMissingKeys).toBe(true);
    expect(oldSettings.swipeBorderWidth).toBe(
      DEFAULT_SETTINGS.swipeBorderWidth
    );
    expect(oldSettings.numRows).toBe(2); // Should preserve existing values
    expect(oldSettings.numCols).toBe(5); // Should preserve existing values
  });

  it("should not overwrite existing settings", () => {
    const existingSettings: Partial<GayToolbarSettings> = {
      numRows: 3,
      numCols: 6,
      rowHeight: 29,
      pressDelayMs: 170,
      swipeBorderWidth: 15, // User has custom value
      // Include all other keys to test no overwrite scenario
      buttonIds: ["custom-button"],
      mobileOnly: true,
      buttonLocations: { "custom-button": [0, 0] },
      buttons: {
        "custom-button": {
          id: "custom-button",
          tapIcon: "custom",
          backgroundColor: "#custom",
          onTapCommandId: "custom",
          colorIdx: 0,
        } as GayButtonSettings,
      },
      gridGap: 5,
      gridPadding: 5,
      backgroundColor: "#custom",
      customBackground: "custom-gradient",
      useCustomBackground: true,
      isMinimized: true,
      annoyingText: false,
      presetColors: ["#custom1", "#custom2"],
      minimizedToolbarLoc: [0.5, 25],
    };

    const hasMissingKeys = migrateSettings(
      existingSettings as GayToolbarSettings,
      DEFAULT_SETTINGS
    );

    expect(hasMissingKeys).toBe(false); // No missing keys
    // Should preserve user's custom values
    expect(existingSettings.swipeBorderWidth).toBe(15); // User's custom value
    expect(existingSettings.numRows).toBe(3); // User's custom value
    expect(existingSettings.pressDelayMs).toBe(170); // User's custom value
  });

  it("should handle empty settings object", () => {
    const emptySettings: Partial<GayToolbarSettings> = {};

    const hasMissingKeys = migrateSettings(
      emptySettings as GayToolbarSettings,
      DEFAULT_SETTINGS
    );

    expect(hasMissingKeys).toBe(true);
    // Should add all default values
    expect(emptySettings.swipeBorderWidth).toBe(
      DEFAULT_SETTINGS.swipeBorderWidth
    );
    expect(emptySettings.numRows).toBe(DEFAULT_SETTINGS.numRows);
    expect(emptySettings.numCols).toBe(DEFAULT_SETTINGS.numCols);
    expect(emptySettings.pressDelayMs).toBe(DEFAULT_SETTINGS.pressDelayMs);
  });

  it("should handle settings with undefined values", () => {
    const settingsWithUndefined: Partial<GayToolbarSettings> = {
      numRows: 2,
      numCols: 5,
      swipeBorderWidth: undefined, // Explicitly undefined
      pressDelayMs: 200,
    };

    const hasMissingKeys = migrateSettings(
      settingsWithUndefined as GayToolbarSettings,
      DEFAULT_SETTINGS
    );

    expect(hasMissingKeys).toBe(true);
    expect(settingsWithUndefined.swipeBorderWidth).toBe(
      DEFAULT_SETTINGS.swipeBorderWidth
    );
    expect(settingsWithUndefined.numRows).toBe(2); // Should preserve existing values
    expect(settingsWithUndefined.pressDelayMs).toBe(200); // Should preserve existing values
  });

  it("should log missing settings", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    const oldSettings: Partial<GayToolbarSettings> = {
      numRows: 2,
      // Missing: swipeBorderWidth
    };

    migrateSettings(oldSettings as GayToolbarSettings, DEFAULT_SETTINGS);

    expect(consoleSpy).toHaveBeenCalledWith(
      `Adding missing setting: swipeBorderWidth = ${DEFAULT_SETTINGS.swipeBorderWidth}`
    );

    consoleSpy.mockRestore();
  });
});
