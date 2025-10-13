import { getEmptySettings } from "./Settings/DEFAULT_SETTINGS";
import { useSettings, useEditor, usePlugin } from "./StateManagement";

// Reset all stores to initial state before each test
export const resetAllStores = () => {
  useSettings.setState(getEmptySettings());
  useEditor.setState({
    isEditing: false,
    selectedButtonId: "",
    setIsEditing: jest.fn(),
    setSelectedButtonId: jest.fn(),
  });
  usePlugin.setState(null);
};

// Mock external dependencies that cause issues in tests
export const setupTestMocks = () => {
  // Removed drag and drop mocking since components return early when not editing

  // Mock chooseNewCommand
  jest.mock("./Settings/chooseNewCommand", () => ({
    __esModule: true,
    default: jest.fn().mockResolvedValue({
      icon: "plus",
      id: "test-command",
    }),
  }));

  // Mock utils
  jest.mock("./utils", () => ({
    takeSnapshot: jest.fn().mockResolvedValue("data:image/png;base64,mock"),
  }));
};
