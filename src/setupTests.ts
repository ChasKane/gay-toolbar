import "@testing-library/jest-dom";
import { resetAllStores } from "./test-setup";

// Mock window.Capacitor for mobile testing
Object.defineProperty(window, "Capacitor", {
  value: {
    Plugins: {
      Keyboard: {
        hide: jest.fn(),
      },
    },
  },
  writable: true,
});

// Mock HTML-to-image
jest.mock("html-to-image", () => ({
  toPng: jest.fn().mockResolvedValue("data:image/png;base64,mock"),
}));

// chroma-js removed, now using culori

// Reset stores before each test
beforeEach(() => {
  resetAllStores();
});
