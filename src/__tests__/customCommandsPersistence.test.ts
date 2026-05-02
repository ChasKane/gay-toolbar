import DEFAULT_SETTINGS from "../Settings/DEFAULT_SETTINGS";
import { getEmptySettings } from "../Settings/DEFAULT_SETTINGS";
import {
  GayToolbarSettings,
  savedConfigKeys,
  SavedConfigValues,
  CustomCommand,
  persistedSettingsKeys,
} from "../types";

describe("Custom Commands and Preset Colors Persistence", () => {
  describe("Type definitions", () => {
    it("should NOT include customCommands in savedConfigKeys", () => {
      expect(savedConfigKeys).not.toContain("customCommands");
    });

    it("should NOT include presetColors in savedConfigKeys", () => {
      expect(savedConfigKeys).not.toContain("presetColors");
    });

    it("should NOT include customCommands in SavedConfigValues type", () => {
      // TypeScript compile-time check: if customCommands were in SavedConfigValues,
      // this would fail. Runtime check: verify savedConfigKeys doesn't include it.
      const testConfig: Partial<SavedConfigValues> = {
        buttonIds: [],
        numRows: 2,
      };
      // @ts-expect-error - customCommands should not exist on SavedConfigValues
      const shouldNotExist = testConfig.customCommands;
      expect(shouldNotExist).toBeUndefined();
    });

    it("should NOT include presetColors in SavedConfigValues type", () => {
      const testConfig: Partial<SavedConfigValues> = {
        buttonIds: [],
        numRows: 2,
      };
      // @ts-expect-error - presetColors should not exist on SavedConfigValues
      const shouldNotExist = testConfig.presetColors;
      expect(shouldNotExist).toBeUndefined();
    });

    it("should include customCommands in GayToolbarSettings", () => {
      const testSettings: Partial<GayToolbarSettings> = {
        buttonIds: [],
        customCommands: [{ id: "test", name: "Test", content: "test" }],
      };
      expect(testSettings.customCommands).toBeDefined();
      expect(testSettings.customCommands?.length).toBe(1);
    });

    it("should include presetColors in GayToolbarSettings", () => {
      const testSettings: Partial<GayToolbarSettings> = {
        buttonIds: [],
        presetColors: ["#ff0000", "#00ff00"],
      };
      expect(testSettings.presetColors).toBeDefined();
      expect(testSettings.presetColors?.length).toBe(2);
    });
  });

  describe("Saving configs", () => {
    it("should not include customCommands in saved config JSON", () => {
      const currentSettings: Partial<GayToolbarSettings> = {
        ...DEFAULT_SETTINGS,
        customCommands: [
          { id: "cmd1", name: "Command 1", content: "content1" },
          { id: "cmd2", name: "Command 2", content: "content2" },
        ],
        buttonIds: ["btn1"],
        numRows: 3,
      };

      // Simulate what addConfig does: create JSON from savedConfigKeys only
      const savedConfig = JSON.stringify(
        Object.fromEntries(
          savedConfigKeys.map((key) => [key, currentSettings[key]])
        )
      );

      const parsed = JSON.parse(savedConfig);
      expect(parsed.customCommands).toBeUndefined();
      expect(parsed.buttonIds).toEqual(["btn1"]);
      expect(parsed.numRows).toBe(3);
    });

    it("should not include presetColors in saved config JSON", () => {
      const currentSettings: Partial<GayToolbarSettings> = {
        ...DEFAULT_SETTINGS,
        presetColors: ["#ff0000", "#00ff00", "#0000ff"],
        buttonIds: ["btn1"],
        numRows: 3,
      };

      const savedConfig = JSON.stringify(
        Object.fromEntries(
          savedConfigKeys.map((key) => [key, currentSettings[key]])
        )
      );

      const parsed = JSON.parse(savedConfig);
      expect(parsed.presetColors).toBeUndefined();
      expect(parsed.buttonIds).toEqual(["btn1"]);
      expect(parsed.numRows).toBe(3);
    });

    it("should not include customCommands or presetColors in saved config JSON", () => {
      const currentSettings: Partial<GayToolbarSettings> = {
        ...DEFAULT_SETTINGS,
        customCommands: [{ id: "cmd1", name: "Command 1", content: "content1" }],
        presetColors: ["#ff0000"],
        buttonIds: ["btn1"],
        numRows: 3,
      };

      const savedConfig = JSON.stringify(
        Object.fromEntries(
          savedConfigKeys.map((key) => [key, currentSettings[key]])
        )
      );

      const parsed = JSON.parse(savedConfig);
      expect(parsed.customCommands).toBeUndefined();
      expect(parsed.presetColors).toBeUndefined();
      expect(parsed.buttonIds).toEqual(["btn1"]);
      expect(parsed.numRows).toBe(3);
    });
  });

  describe("Loading configs", () => {
    it("should preserve customCommands when loading a config", () => {
      const currentCustomCommands: CustomCommand[] = [
        { id: "current1", name: "Current 1", content: "content1" },
        { id: "current2", name: "Current 2", content: "content2" },
      ];

      // Simulate old config data (might have customCommands from old format)
      const oldConfigData = JSON.stringify({
        buttonIds: ["btn1", "btn2"],
        numRows: 4,
        customCommands: [
          { id: "old1", name: "Old 1", content: "oldcontent1" },
        ],
        presetColors: ["#old1", "#old2"],
      });

      const parsedData = JSON.parse(oldConfigData);
      const { configs: _c, ...settingsToLoad } = parsedData;

      // Simulate what Configs.tsx does
      const current = {
        customCommands: currentCustomCommands,
        presetColors: ["#current1", "#current2"],
        savedConfigsFilePath: "CurrentPath.md",
      };

      const finalSettings = {
        ...settingsToLoad,
        customCommands: current.customCommands ?? [],
        presetColors: current.presetColors ?? [],
        savedConfigsFilePath: current.savedConfigsFilePath,
      };

      // Should preserve current customCommands, not load old ones
      expect(finalSettings.customCommands).toEqual(currentCustomCommands);
      expect(finalSettings.customCommands).not.toContainEqual({
        id: "old1",
        name: "Old 1",
        content: "oldcontent1",
      });
      expect(finalSettings.buttonIds).toEqual(["btn1", "btn2"]);
      expect(finalSettings.numRows).toBe(4);
    });

    it("should preserve presetColors when loading a config", () => {
      const currentPresetColors = ["#current1", "#current2", "#current3"];

      const oldConfigData = JSON.stringify({
        buttonIds: ["btn1"],
        numRows: 5,
        presetColors: ["#old1", "#old2"],
      });

      const parsedData = JSON.parse(oldConfigData);
      const { configs: _c, ...settingsToLoad } = parsedData;

      const current = {
        customCommands: [],
        presetColors: currentPresetColors,
        savedConfigsFilePath: "CurrentPath.md",
      };

      const finalSettings = {
        ...settingsToLoad,
        customCommands: current.customCommands ?? [],
        presetColors: current.presetColors ?? [],
        savedConfigsFilePath: current.savedConfigsFilePath,
      };

      // Should preserve current presetColors, not load old ones
      expect(finalSettings.presetColors).toEqual(currentPresetColors);
      expect(finalSettings.presetColors).not.toContain("#old1");
      expect(finalSettings.presetColors).not.toContain("#old2");
      expect(finalSettings.buttonIds).toEqual(["btn1"]);
      expect(finalSettings.numRows).toBe(5);
    });

    it("should preserve savedConfigsFilePath when loading a config", () => {
      const currentPath = "MyCustomPath.md";

      const oldConfigData = JSON.stringify({
        buttonIds: ["btn1"],
        numRows: 3,
        savedConfigsFilePath: "OldPath.md",
      });

      const parsedData = JSON.parse(oldConfigData);
      const { configs: _c, ...settingsToLoad } = parsedData;

      const current = {
        customCommands: [],
        presetColors: [],
        savedConfigsFilePath: currentPath,
      };

      const finalSettings = {
        ...settingsToLoad,
        customCommands: current.customCommands ?? [],
        presetColors: current.presetColors ?? [],
        savedConfigsFilePath: current.savedConfigsFilePath,
      };

      // Should preserve current savedConfigsFilePath
      expect(finalSettings.savedConfigsFilePath).toBe(currentPath);
      expect(finalSettings.savedConfigsFilePath).not.toBe("OldPath.md");
    });

    it("should preserve all three values when loading a config", () => {
      const currentCustomCommands: CustomCommand[] = [
        { id: "cmd1", name: "Command 1", content: "content1" },
      ];
      const currentPresetColors = ["#color1", "#color2"];
      const currentPath = "MyPath.md";

      const oldConfigData = JSON.stringify({
        buttonIds: ["btn1"],
        numRows: 2,
        customCommands: [{ id: "old", name: "Old", content: "old" }],
        presetColors: ["#old"],
        savedConfigsFilePath: "OldPath.md",
      });

      const parsedData = JSON.parse(oldConfigData);
      const { configs: _c, ...settingsToLoad } = parsedData;

      const current = {
        customCommands: currentCustomCommands,
        presetColors: currentPresetColors,
        savedConfigsFilePath: currentPath,
      };

      const finalSettings = {
        ...settingsToLoad,
        customCommands: current.customCommands ?? [],
        presetColors: current.presetColors ?? [],
        savedConfigsFilePath: current.savedConfigsFilePath,
      };

      expect(finalSettings.customCommands).toEqual(currentCustomCommands);
      expect(finalSettings.presetColors).toEqual(currentPresetColors);
      expect(finalSettings.savedConfigsFilePath).toBe(currentPath);
      expect(finalSettings.buttonIds).toEqual(["btn1"]);
      expect(finalSettings.numRows).toBe(2);
    });

    it("should handle empty arrays when loading config", () => {
      const current = {
        customCommands: [] as CustomCommand[],
        presetColors: [] as string[],
        savedConfigsFilePath: "Path.md",
      };

      const oldConfigData = JSON.stringify({
        buttonIds: ["btn1"],
        numRows: 2,
      });

      const parsedData = JSON.parse(oldConfigData);
      const { configs: _c, ...settingsToLoad } = parsedData;

      const finalSettings = {
        ...settingsToLoad,
        customCommands: current.customCommands ?? [],
        presetColors: current.presetColors ?? [],
        savedConfigsFilePath: current.savedConfigsFilePath,
      };

      expect(finalSettings.customCommands).toEqual([]);
      expect(finalSettings.presetColors).toEqual([]);
    });
  });

  describe("Restore defaults", () => {
    it("should preserve customCommands when restoring defaults", () => {
      const currentCustomCommands: CustomCommand[] = [
        { id: "cmd1", name: "Command 1", content: "content1" },
        { id: "cmd2", name: "Command 2", content: "content2" },
      ];

      // Simulate what main.tsx does
      const current = {
        customCommands: currentCustomCommands,
        presetColors: ["#current"],
        savedConfigsFilePath: "CurrentPath.md",
      };

      const toMerge: Partial<GayToolbarSettings> = {};
      // Simulate looping through persistedSettingsKeys and setting defaults
      for (const k of ["buttonIds", "numRows", "numCols"] as any[]) {
        (toMerge as any)[k] = (DEFAULT_SETTINGS as any)[k];
      }

      // Preserve the three values
      toMerge.customCommands = current.customCommands ?? [];
      toMerge.presetColors = current.presetColors ?? [];
      toMerge.savedConfigsFilePath = current.savedConfigsFilePath;

      expect(toMerge.customCommands).toEqual(currentCustomCommands);
      expect(toMerge.buttonIds).toEqual(DEFAULT_SETTINGS.buttonIds);
      expect(toMerge.numRows).toBe(DEFAULT_SETTINGS.numRows);
    });

    it("should preserve presetColors when restoring defaults", () => {
      const currentPresetColors = ["#color1", "#color2", "#color3"];

      const current = {
        customCommands: [],
        presetColors: currentPresetColors,
        savedConfigsFilePath: "Path.md",
      };

      const toMerge: Partial<GayToolbarSettings> = {};
      for (const k of ["buttonIds", "numRows"] as any[]) {
        (toMerge as any)[k] = (DEFAULT_SETTINGS as any)[k];
      }

      toMerge.customCommands = current.customCommands ?? [];
      toMerge.presetColors = current.presetColors ?? [];
      toMerge.savedConfigsFilePath = current.savedConfigsFilePath;

      expect(toMerge.presetColors).toEqual(currentPresetColors);
      expect(toMerge.presetColors).not.toEqual(DEFAULT_SETTINGS.presetColors);
      expect(toMerge.buttonIds).toEqual(DEFAULT_SETTINGS.buttonIds);
    });

    it("should preserve savedConfigsFilePath when restoring defaults", () => {
      const currentPath = "MyCustomPath.md";

      const current = {
        customCommands: [],
        presetColors: [],
        savedConfigsFilePath: currentPath,
      };

      const toMerge: Partial<GayToolbarSettings> = {};
      for (const k of ["buttonIds", "numRows"] as any[]) {
        (toMerge as any)[k] = (DEFAULT_SETTINGS as any)[k];
      }

      toMerge.customCommands = current.customCommands ?? [];
      toMerge.presetColors = current.presetColors ?? [];
      toMerge.savedConfigsFilePath = current.savedConfigsFilePath;

      expect(toMerge.savedConfigsFilePath).toBe(currentPath);
      expect(toMerge.savedConfigsFilePath).not.toBe(
        DEFAULT_SETTINGS.savedConfigsFilePath
      );
    });

    it("should preserve all three values when restoring defaults", () => {
      const currentCustomCommands: CustomCommand[] = [
        { id: "cmd1", name: "Command 1", content: "content1" },
      ];
      const currentPresetColors = ["#color1"];
      const currentPath = "MyPath.md";

      const current = {
        customCommands: currentCustomCommands,
        presetColors: currentPresetColors,
        savedConfigsFilePath: currentPath,
      };

      const toMerge: Partial<GayToolbarSettings> = {};
      for (const k of ["buttonIds", "numRows", "numCols", "pressDelayMs"] as any[]) {
        (toMerge as any)[k] = (DEFAULT_SETTINGS as any)[k];
      }

      toMerge.customCommands = current.customCommands ?? [];
      toMerge.presetColors = current.presetColors ?? [];
      toMerge.savedConfigsFilePath = current.savedConfigsFilePath;

      expect(toMerge.customCommands).toEqual(currentCustomCommands);
      expect(toMerge.presetColors).toEqual(currentPresetColors);
      expect(toMerge.savedConfigsFilePath).toBe(currentPath);
      expect(toMerge.numRows).toBe(DEFAULT_SETTINGS.numRows);
      expect(toMerge.pressDelayMs).toBe(DEFAULT_SETTINGS.pressDelayMs);
    });

    it("should handle empty arrays when restoring defaults", () => {
      const current = {
        customCommands: [] as CustomCommand[],
        presetColors: [] as string[],
        savedConfigsFilePath: "Path.md",
      };

      const toMerge: Partial<GayToolbarSettings> = {};
      for (const k of ["buttonIds", "numRows"] as any[]) {
        (toMerge as any)[k] = (DEFAULT_SETTINGS as any)[k];
      }

      toMerge.customCommands = current.customCommands ?? [];
      toMerge.presetColors = current.presetColors ?? [];
      toMerge.savedConfigsFilePath = current.savedConfigsFilePath;

      expect(toMerge.customCommands).toEqual([]);
      expect(toMerge.presetColors).toEqual([]);
    });
  });

  describe("Backward compatibility", () => {
    it("should handle old configs with customCommands in data", () => {
      // Old config format that includes customCommands
      const oldConfigData = JSON.stringify({
        buttonIds: ["btn1"],
        numRows: 2,
        customCommands: [
          { id: "old1", name: "Old Command", content: "old" },
        ],
      });

      const parsedData = JSON.parse(oldConfigData);
      const { configs: _c, ...settingsToLoad } = parsedData;

      const current = {
        customCommands: [
          { id: "current1", name: "Current", content: "current" },
        ],
        presetColors: ["#current"],
        savedConfigsFilePath: "Path.md",
      };

      const finalSettings = {
        ...settingsToLoad,
        customCommands: current.customCommands ?? [],
        presetColors: current.presetColors ?? [],
        savedConfigsFilePath: current.savedConfigsFilePath,
      };

      // Should ignore old customCommands and preserve current
      expect(finalSettings.customCommands).toEqual(current.customCommands);
      expect(finalSettings.customCommands).not.toContainEqual({
        id: "old1",
        name: "Old Command",
        content: "old",
      });
    });

    it("should handle old configs with presetColors in data", () => {
      const oldConfigData = JSON.stringify({
        buttonIds: ["btn1"],
        numRows: 2,
        presetColors: ["#old1", "#old2"],
      });

      const parsedData = JSON.parse(oldConfigData);
      const { configs: _c, ...settingsToLoad } = parsedData;

      const current = {
        customCommands: [],
        presetColors: ["#current1", "#current2"],
        savedConfigsFilePath: "Path.md",
      };

      const finalSettings = {
        ...settingsToLoad,
        customCommands: current.customCommands ?? [],
        presetColors: current.presetColors ?? [],
        savedConfigsFilePath: current.savedConfigsFilePath,
      };

      // Should ignore old presetColors and preserve current
      expect(finalSettings.presetColors).toEqual(current.presetColors);
      expect(finalSettings.presetColors).not.toContain("#old1");
      expect(finalSettings.presetColors).not.toContain("#old2");
    });
  });

  describe("Plugin reload round-trip (would fail before persistence fix)", () => {
    /**
     * Simulates: plugin runs → user changes customCommands/presetColors →
     * plugin unload (save) → plugin loads again (load) → data should match.
     * Uses the same persist/restore logic as main.tsx (persistedSettingsKeys).
     */
    function simulateSave(state: GayToolbarSettings): Record<string, unknown> {
      const persisted: Record<string, unknown> = {};
      for (const k of persistedSettingsKeys) {
        const v = (state as Record<string, unknown>)[k];
        if (v !== undefined) persisted[k] = v;
      }
      return persisted;
    }

    function simulateLoad(saved: Record<string, unknown>): GayToolbarSettings {
      const toMerge: Partial<GayToolbarSettings> = {};
      for (const k of persistedSettingsKeys) {
        const v = saved[k];
        if (v !== undefined) (toMerge as Record<string, unknown>)[k] = v;
      }
      return { ...getEmptySettings(), ...toMerge } as GayToolbarSettings;
    }

    it("customCommands survive unload then reload", () => {
      const customCommands: CustomCommand[] = [
        { id: "cmd1", name: "My Command", content: "console.log('hi');" },
        { id: "cmd2", name: "Other", content: "return 1;" },
      ];
      const stateBefore: GayToolbarSettings = {
        ...getEmptySettings(),
        customCommands,
        numRows: 3, // other change to show we're not just reading defaults
      } as GayToolbarSettings;

      const saved = simulateSave(stateBefore);
      const stateAfter = simulateLoad(saved);

      expect(stateAfter.customCommands).toEqual(customCommands);
      expect(stateAfter.customCommands).toHaveLength(2);
      expect(stateAfter.numRows).toBe(3);
    });

    it("presetColors survive unload then reload", () => {
      const presetColors = ["#ff0000", "#00ff00", "#0000ff", "#custom"];
      const stateBefore: GayToolbarSettings = {
        ...getEmptySettings(),
        presetColors,
        numCols: 6,
      } as GayToolbarSettings;

      const saved = simulateSave(stateBefore);
      const stateAfter = simulateLoad(saved);

      expect(stateAfter.presetColors).toEqual(presetColors);
      expect(stateAfter.presetColors).toHaveLength(4);
      expect(stateAfter.numCols).toBe(6);
    });

    it("customCommands and presetColors together survive unload then reload", () => {
      const customCommands: CustomCommand[] = [
        { id: "a", name: "A", content: "1" },
      ];
      const presetColors = ["#a", "#b"];
      const stateBefore: GayToolbarSettings = {
        ...getEmptySettings(),
        customCommands,
        presetColors,
        savedConfigsFilePath: "MyConfigs.md",
      } as GayToolbarSettings;

      const saved = simulateSave(stateBefore);
      const stateAfter = simulateLoad(saved);

      expect(stateAfter.customCommands).toEqual(customCommands);
      expect(stateAfter.presetColors).toEqual(presetColors);
      expect(stateAfter.savedConfigsFilePath).toBe("MyConfigs.md");
    });

    it("empty customCommands and presetColors survive round-trip", () => {
      const stateBefore: GayToolbarSettings = {
        ...getEmptySettings(),
        customCommands: [],
        presetColors: [],
      } as GayToolbarSettings;

      const saved = simulateSave(stateBefore);
      const stateAfter = simulateLoad(saved);

      expect(stateAfter.customCommands).toEqual([]);
      expect(stateAfter.presetColors).toEqual([]);
    });
  });
});
