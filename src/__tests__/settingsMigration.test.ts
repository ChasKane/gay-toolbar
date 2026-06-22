import DEFAULT_SETTINGS from "../Settings/DEFAULT_SETTINGS";
import { getEmptySettings } from "../Settings/DEFAULT_SETTINGS";
import {
  GayButtonSettings,
  GayToolbarSettings,
  savedConfigKeys,
} from "../types";
import { migrateLockColorsInPlace, migrateOpenAccordions, migrateSettings } from "../utils";

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
      customCommands: [],
      bottomBuffer: 0,
      adoptSlotColorsOnDrop: false,
      lockColorsInPlace: false,
      swipeColorsFromPalette: false,
      lockSwipeColorsToButton: false,
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

  it("should add missing settings when keys are absent", () => {
    const oldSettings: Partial<GayToolbarSettings> = {
      numRows: 2,
      // Missing: swipeBorderWidth, adoptSlotColorsOnDrop, and others
    };

    const hasMissingKeys = migrateSettings(
      oldSettings as GayToolbarSettings,
      DEFAULT_SETTINGS
    );

    expect(hasMissingKeys).toBe(true);
    expect(oldSettings.swipeBorderWidth).toBe(
      DEFAULT_SETTINGS.swipeBorderWidth
    );
    expect(oldSettings.adoptSlotColorsOnDrop).toBe(
      DEFAULT_SETTINGS.adoptSlotColorsOnDrop
    );
    expect(oldSettings.lockColorsInPlace).toBe(
      DEFAULT_SETTINGS.lockColorsInPlace
    );
    expect(oldSettings.swipeColorsFromPalette).toBe(
      DEFAULT_SETTINGS.swipeColorsFromPalette
    );
    expect(oldSettings.lockSwipeColorsToButton).toBe(
      DEFAULT_SETTINGS.lockSwipeColorsToButton
    );
  });

  it("should not add openAccordions via migrateSettings (migrated separately in main)", () => {
    expect(savedConfigKeys).not.toContain("openAccordions");
    const oldSettings: Partial<GayToolbarSettings> = { numRows: 2 };
    migrateSettings(oldSettings as GayToolbarSettings, DEFAULT_SETTINGS);
    expect(oldSettings.openAccordions).toBeUndefined();
  });

  it("should include openAccordions in default settings and getEmptySettings", () => {
    const defaultShape = {
      layout: false,
      appearance: false,
      other: false,
    };
    expect(DEFAULT_SETTINGS.openAccordions).toEqual(defaultShape);
    expect(getEmptySettings().openAccordions).toEqual(defaultShape);
  });

  it("migrateOpenAccordions merges defaults with current and normalizes", () => {
    const settings = getEmptySettings();
    delete (settings as Partial<GayToolbarSettings>).openAccordions;
    const changed = migrateOpenAccordions(settings, DEFAULT_SETTINGS);
    expect(changed).toBe(true);
    expect(settings.openAccordions).toEqual(DEFAULT_SETTINGS.openAccordions);
  });

  it("migrateOpenAccordions returns false when openAccordions already complete", () => {
    const settings = getEmptySettings();
    const changed = migrateOpenAccordions(settings, DEFAULT_SETTINGS);
    expect(changed).toBe(false);
  });

  it("migrateOpenAccordions removes obsolete sections", () => {
    const settings = getEmptySettings();
    (settings.openAccordions as Record<string, boolean>).notifications = true;
    const changed = migrateOpenAccordions(settings, DEFAULT_SETTINGS);
    expect(changed).toBe(true);
    expect(settings.openAccordions).toEqual(DEFAULT_SETTINGS.openAccordions);
    expect(settings.openAccordions).not.toHaveProperty("notifications");
  });

  it("migrateLockColorsInPlace maps adoptSlotColorsOnDrop false to lockColorsInPlace false", () => {
    const settings = {
      adoptSlotColorsOnDrop: false,
    } as GayToolbarSettings;

    const changed = migrateLockColorsInPlace(settings);
    migrateSettings(settings, DEFAULT_SETTINGS);

    expect(changed).toBe(true);
    expect(settings.lockColorsInPlace).toBe(false);
    expect(settings.adoptSlotColorsOnDrop).toBe(false);
  });

  it("migrateLockColorsInPlace maps adoptSlotColorsOnDrop true to lockColorsInPlace true", () => {
    const settings = {
      adoptSlotColorsOnDrop: true,
    } as GayToolbarSettings;

    const changed = migrateLockColorsInPlace(settings);
    migrateSettings(settings, DEFAULT_SETTINGS);

    expect(changed).toBe(true);
    expect(settings.lockColorsInPlace).toBe(true);
    expect(settings.adoptSlotColorsOnDrop).toBe(false);
  });

  it("migrateLockColorsInPlace leaves default when adoptSlotColorsOnDrop was never set", () => {
    const settings = {} as GayToolbarSettings;

    const changed = migrateLockColorsInPlace(settings);
    migrateSettings(settings, DEFAULT_SETTINGS);

    expect(changed).toBe(false);
    expect(settings.lockColorsInPlace).toBe(true);
  });

  it("migrateLockColorsInPlace does nothing when lockColorsInPlace already exists", () => {
    const settings = {
      adoptSlotColorsOnDrop: true,
      lockColorsInPlace: false,
    } as GayToolbarSettings;

    const changed = migrateLockColorsInPlace(settings);

    expect(changed).toBe(false);
    expect(settings.lockColorsInPlace).toBe(false);
    expect(settings.adoptSlotColorsOnDrop).toBe(true);
  });
});
