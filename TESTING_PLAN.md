# Testing Plan: Custom Commands & Preset Colors Persistence

## Overview
This plan tests that `customCommands` and `presetColors` persist independently of saved configs and restore-defaults operations.

---

## Test Categories

### 1. Type Safety & Build
**Goal:** Verify TypeScript compilation and type correctness

- [ ] Run `npm run build` - should compile without errors
- [ ] Verify `customCommands` is NOT in `savedConfigKeys` array
- [ ] Verify `presetColors` is NOT in `savedConfigKeys` array
- [ ] Verify `customCommands` IS in `GayToolbarSettings` intersection type
- [ ] Verify `presetColors` IS in `GayToolbarSettings` intersection type
- [ ] Verify `SavedConfigValues` does NOT include `customCommands` or `presetColors`

---

### 2. Saving Configs
**Goal:** Verify that saved configs do NOT include `customCommands` or `presetColors`

#### Test 2.1: Save config with custom commands
**Steps:**
1. Add 2-3 custom commands via Command Editor
2. Save current config
3. Inspect the saved config's JSON data

**Expected:**
- Saved config JSON does NOT contain `customCommands` field
- Saved config JSON contains all other settings (buttons, layout, etc.)

#### Test 2.2: Save config with custom preset colors
**Steps:**
1. Add 2-3 custom colors to preset palette
2. Save current config
3. Inspect the saved config's JSON data

**Expected:**
- Saved config JSON does NOT contain `presetColors` field
- Saved config JSON contains all other settings

#### Test 2.3: Save config with both custom commands and preset colors
**Steps:**
1. Add custom commands AND custom preset colors
2. Save current config
3. Inspect the saved config's JSON data

**Expected:**
- Saved config JSON contains neither `customCommands` nor `presetColors`
- All other settings are saved correctly

---

### 3. Loading Configs
**Goal:** Verify that loading a config preserves current `customCommands`, `presetColors`, and `savedConfigsFilePath`

#### Test 3.1: Load config preserves custom commands
**Steps:**
1. Add 2 custom commands (e.g., "Test1", "Test2")
2. Save current config (config A)
3. Delete one custom command (now only "Test1" remains)
4. Load config A

**Expected:**
- Only "Test1" remains (current state preserved)
- "Test2" does NOT reappear from loaded config
- All other settings from config A are loaded correctly

#### Test 3.2: Load config preserves preset colors
**Steps:**
1. Set preset colors to `["#ff0000", "#00ff00", "#0000ff"]`
2. Save current config (config B)
3. Change preset colors to `["#ffffff", "#000000"]`
4. Load config B

**Expected:**
- Preset colors remain `["#ffffff", "#000000"]` (current state preserved)
- Colors from config B (`["#ff0000", "#00ff00", "#0000ff"]`) do NOT load
- All other settings from config B are loaded correctly

#### Test 3.3: Load config preserves savedConfigsFilePath
**Steps:**
1. Change `savedConfigsFilePath` to a custom path (e.g., "MyConfigs.md")
2. Save current config (config C)
3. Change `savedConfigsFilePath` back to default ("GayToolbarSavedConfigs.md")
4. Load config C

**Expected:**
- `savedConfigsFilePath` remains "GayToolbarSavedConfigs.md" (current state preserved)
- All other settings from config C are loaded correctly

#### Test 3.4: Load old config (with customCommands/presetColors in data)
**Steps:**
1. Manually create/edit a saved config JSON to include `customCommands` and `presetColors` (simulating old format)
2. Load that config

**Expected:**
- Current `customCommands` are preserved (old ones ignored)
- Current `presetColors` are preserved (old ones ignored)
- All other settings from old config load correctly
- No errors or crashes

#### Test 3.5: Load config with empty arrays
**Steps:**
1. Have 0 custom commands and 0 preset colors
2. Save current config
3. Add 1 custom command and 1 preset color
4. Load the saved config

**Expected:**
- Custom command remains (current state preserved)
- Preset color remains (current state preserved)
- All other settings load correctly

---

### 4. Restore Defaults
**Goal:** Verify that restoring defaults preserves `customCommands`, `presetColors`, and `savedConfigsFilePath`

#### Test 4.1: Restore defaults preserves custom commands
**Steps:**
1. Add 3 custom commands
2. Change several other settings (buttons, layout, colors, etc.)
3. Run "Load default settings" command
4. Verify state

**Expected:**
- All 3 custom commands remain
- All other settings reset to defaults
- Dialog copy mentions preservation of custom commands

#### Test 4.2: Restore defaults preserves preset colors
**Steps:**
1. Add 5 custom preset colors
2. Change several other settings
3. Run "Load default settings" command
4. Verify state

**Expected:**
- All 5 preset colors remain
- All other settings reset to defaults

#### Test 4.3: Restore defaults preserves savedConfigsFilePath
**Steps:**
1. Change `savedConfigsFilePath` to "CustomPath.md"
2. Change several other settings
3. Run "Load default settings" command
4. Verify state

**Expected:**
- `savedConfigsFilePath` remains "CustomPath.md"
- All other settings reset to defaults

#### Test 4.4: Restore defaults with empty arrays
**Steps:**
1. Have 0 custom commands and 0 preset colors
2. Change several settings
3. Run "Load default settings" command

**Expected:**
- Custom commands remain empty array `[]`
- Preset colors remain empty array `[]`
- All other settings reset to defaults

---

### 5. Integration Scenarios
**Goal:** Test realistic user workflows

#### Test 5.1: Multi-config workflow
**Steps:**
1. Add custom commands: ["Cmd1", "Cmd2"]
2. Save config A
3. Add custom command "Cmd3"
4. Save config B
5. Load config A
6. Load config B
7. Restore defaults

**Expected:**
- After loading A: commands remain ["Cmd1", "Cmd2", "Cmd3"] (current state)
- After loading B: commands remain ["Cmd1", "Cmd2", "Cmd3"] (current state)
- After restore defaults: commands remain ["Cmd1", "Cmd2", "Cmd3"]

#### Test 5.2: Config switching with color palette
**Steps:**
1. Set preset colors to ["#red", "#blue"]
2. Save config X
3. Change preset colors to ["#green", "#yellow", "#purple"]
4. Save config Y
5. Load config X
6. Load config Y
7. Restore defaults

**Expected:**
- After loading X: colors remain ["#green", "#yellow", "#purple"]
- After loading Y: colors remain ["#green", "#yellow", "#purple"]
- After restore defaults: colors remain ["#green", "#yellow", "#purple"]

#### Test 5.3: Full workflow
**Steps:**
1. Set up toolbar with custom buttons, layout, colors
2. Add 2 custom commands
3. Add 3 preset colors
4. Save config "MySetup"
5. Change everything (buttons, layout, colors)
6. Add 1 more custom command
7. Add 2 more preset colors
8. Load "MySetup"
9. Verify toolbar matches "MySetup" but commands/colors are current
10. Restore defaults
11. Verify commands/colors still current, everything else default

**Expected:**
- After loading: toolbar matches "MySetup" visually, but commands are 3 total (2 old + 1 new), colors are 5 total (3 old + 2 new)
- After restore: commands still 3, colors still 5, everything else defaults

---

### 6. Edge Cases & Error Handling

#### Test 6.1: Null/undefined handling
**Steps:**
1. Manually corrupt a saved config JSON (remove fields, set to null)
2. Try to load it

**Expected:**
- No crashes
- Current `customCommands` and `presetColors` preserved
- Error logged to console if parsing fails

#### Test 6.2: Empty config data
**Steps:**
1. Create a saved config with minimal/empty JSON
2. Load it

**Expected:**
- Current `customCommands` and `presetColors` preserved
- Defaults applied for missing fields

#### Test 6.3: Very large arrays
**Steps:**
1. Add 50+ custom commands
2. Add 20+ preset colors
3. Save config
4. Load config
5. Restore defaults

**Expected:**
- All commands preserved through save/load/restore cycle
- All colors preserved through save/load/restore cycle
- No performance issues

---

### 7. UI/UX Verification

#### Test 7.1: Restore defaults dialog copy
**Steps:**
1. Navigate to Restore Defaults view
2. Read the warning message

**Expected:**
- Message mentions that custom commands, color palette, and saved configs file path will be preserved
- Copy is clear and accurate

#### Test 7.2: Command Editor still works
**Steps:**
1. Add/edit/delete custom commands via Command Editor
2. Save config
3. Load config
4. Verify commands still editable

**Expected:**
- Command Editor functions normally
- Commands persist across config operations

#### Test 7.3: Color Picker still works
**Steps:**
1. Add/edit/delete preset colors via Color Picker
2. Save config
3. Load config
4. Verify colors still editable

**Expected:**
- Color Picker functions normally
- Colors persist across config operations

---

## Test Execution Checklist

### Manual Testing
- [ ] Run all tests in Test Categories 1-7 above
- [ ] Document any failures or unexpected behavior
- [ ] Verify no console errors during operations

### Automated Testing (if applicable)
- [ ] Update `settingsMigration.test.ts` if needed
- [ ] Add unit tests for config loading logic
- [ ] Add unit tests for restore defaults logic
- [ ] Run `npm test` and verify all pass

### Regression Testing
- [ ] Verify existing saved configs still load correctly
- [ ] Verify toolbar functionality unchanged (buttons, layout, etc.)
- [ ] Verify other settings (not customCommands/presetColors) still save/load correctly

---

## Success Criteria

✅ **All tests pass**
✅ **No regressions in existing functionality**
✅ **Type safety maintained (build passes)**
✅ **User experience: custom commands and colors persist as expected**
✅ **Old configs (with customCommands/presetColors) still load without errors**

---

## Notes

- When testing, use the Obsidian plugin dev environment
- Check browser console for any errors
- Verify saved config markdown files contain correct JSON (without customCommands/presetColors)
- Test on both fresh install and upgrade scenarios (existing users with old configs)
