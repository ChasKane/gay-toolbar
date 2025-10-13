import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { useSettings, useEditor, usePlugin } from "./StateManagement";
import { GayToolbarSettings, EditorState } from "./types";
import { resetAllStores } from "./test-setup";

// Mock external dependencies
// Removed drag-and-drop mocking since components return early when not editing

jest.mock("./Settings/chooseNewCommand", () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue({
    icon: "plus",
    id: "test-command",
  }),
}));

jest.mock("./utils", () => ({
  takeSnapshot: jest.fn().mockResolvedValue("data:image/png;base64,mock"),
}));

// Test utilities
export const setTestSettings = (
  overrides: Partial<GayToolbarSettings> = {}
) => {
  useSettings.setState((state) => ({ ...state, ...overrides }));
};

export const setTestEditor = (overrides: Partial<EditorState> = {}) => {
  useEditor.setState((state) => ({ ...state, ...overrides }));
};

export const setTestPlugin = (plugin: any = null) => {
  usePlugin.setState(plugin);
};

// Custom render function that provides default mocks
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  settingsOverrides?: Partial<GayToolbarSettings>;
  editorOverrides?: Partial<EditorState>;
  plugin?: any;
}

export const renderWithProviders = (
  ui: React.ReactElement,
  {
    settingsOverrides = {},
    editorOverrides = {},
    plugin = null,
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  // Reset stores first
  resetAllStores();

  // Apply overrides
  if (Object.keys(settingsOverrides).length > 0) {
    setTestSettings(settingsOverrides);
  }
  if (Object.keys(editorOverrides).length > 0) {
    setTestEditor(editorOverrides);
  }
  if (plugin !== null) {
    setTestPlugin(plugin);
  }

  return render(ui, renderOptions);
};

// Helper to create test buttons
export const createTestButtons = (count: number, numCols: number = 3) => {
  const buttons: Record<string, any> = {};
  const buttonIds: string[] = [];
  const buttonLocations: Record<string, [number, number]> = {};

  for (let i = 0; i < count; i++) {
    const id = `test-button-${i}`;
    const row = Math.floor(i / numCols);
    const col = i % numCols;

    buttonIds.push(id);
    buttonLocations[id] = [row, col];
    buttons[id] = {
      id,
      tapIcon: "plus",
      backgroundColor: "#ff0000",
      onTapCommandId: "test-command",
      swipeCommands: [],
      swipeRingOffsetAngle: 0,
    };
  }

  return { buttons, buttonIds, buttonLocations };
};

// Re-export everything from testing library
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
