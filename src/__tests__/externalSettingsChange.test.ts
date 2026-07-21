import DEFAULT_SETTINGS from "../Settings/DEFAULT_SETTINGS";
import { GayToolbarSettings, persistedSettingsKeys } from "../types";
import { pickPersistedSettings, patchShowNewVersionNotesToggle } from "../utils";

describe("external settings reload helpers", () => {
  it("pickPersistedSettings includes every persisted key that is defined", () => {
    const settings: GayToolbarSettings = {
      ...DEFAULT_SETTINGS,
      customCommands: [{ id: "test-cmd", name: "Test", content: "console.log(1)" }],
      presetColors: ["#ff0000"],
      showNewVersionNotes: false,
      lastSeenUpdateNotesVersion: "2.1.0",
    };

    const picked = pickPersistedSettings(settings);

    for (const key of persistedSettingsKeys) {
      expect(picked).toHaveProperty(key);
    }
    expect(picked.customCommands).toEqual(settings.customCommands);
    expect(picked.numRows).toBe(settings.numRows);
  });

  it("pickPersistedSettings omits undefined persisted keys", () => {
    const partial = { ...DEFAULT_SETTINGS } as GayToolbarSettings;
    delete (partial as Partial<GayToolbarSettings>).configs;

    const picked = pickPersistedSettings(partial);

    expect(picked.configs).toBeUndefined();
  });
});

describe("patchShowNewVersionNotesToggle", () => {
  it("re-enabling clears last seen so notes replay after settings close", () => {
    expect(patchShowNewVersionNotesToggle(false, true)).toEqual({
      showNewVersionNotes: true,
      lastSeenUpdateNotesVersion: "",
    });
  });

  it("disabling only flips the master switch", () => {
    expect(patchShowNewVersionNotesToggle(true, false)).toEqual({
      showNewVersionNotes: false,
    });
  });

  it("leaves last seen alone when already enabled", () => {
    expect(patchShowNewVersionNotesToggle(true, true)).toEqual({
      showNewVersionNotes: true,
    });
  });
});
