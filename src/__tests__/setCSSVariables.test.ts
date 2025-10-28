import { setCSSVariables } from "../utils";

// Mock DOM environment
const mockParentNode = {
  style: {
    setProperty: jest.fn(),
  },
};

// Mock document.querySelector
Object.defineProperty(document, "querySelector", {
  value: jest.fn(() => mockParentNode),
  writable: true,
});

describe("setCSSVariables", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset querySelector to return mockParentNode by default
    (document.querySelector as jest.Mock).mockReturnValue(mockParentNode);
  });

  it("should set CSS variables with correct values", () => {
    const pressDelayMs = 500;
    const rowHeight = 60;
    const swipeBorderWidth = 25;

    setCSSVariables(pressDelayMs, rowHeight, swipeBorderWidth);

    expect(document.querySelector).toHaveBeenCalledWith(".app-container");
    expect(mockParentNode.style.setProperty).toHaveBeenCalledWith(
      "--press-delay",
      "500ms"
    );
    expect(mockParentNode.style.setProperty).toHaveBeenCalledWith(
      "--button-border-width",
      "15px" // 60 * (25/100) = 15
    );
  });

  it("should handle different rowHeight values correctly", () => {
    const testCases = [
      { rowHeight: 20, expectedBorderWidth: "4px" },
      { rowHeight: 50, expectedBorderWidth: "10px" },
      { rowHeight: 100, expectedBorderWidth: "20px" },
      { rowHeight: 150, expectedBorderWidth: "30px" },
    ];

    testCases.forEach(({ rowHeight, expectedBorderWidth }) => {
      jest.clearAllMocks();
      setCSSVariables(1000, rowHeight, 20);

      expect(mockParentNode.style.setProperty).toHaveBeenCalledWith(
        "--button-border-width",
        expectedBorderWidth
      );
    });
  });

  it("should handle different pressDelayMs values correctly", () => {
    const testCases = [
      { pressDelayMs: 100, expectedDelay: "100ms" },
      { pressDelayMs: 500, expectedDelay: "500ms" },
      { pressDelayMs: 2000, expectedDelay: "2000ms" },
    ];

    testCases.forEach(({ pressDelayMs, expectedDelay }) => {
      jest.clearAllMocks();
      setCSSVariables(pressDelayMs, 50, 20);

      expect(mockParentNode.style.setProperty).toHaveBeenCalledWith(
        "--press-delay",
        expectedDelay
      );
    });
  });

  it("should handle null parentNode gracefully", () => {
    // Mock querySelector to return null
    (document.querySelector as jest.Mock).mockReturnValue(null);

    expect(() => {
      setCSSVariables(500, 60, 20);
    }).not.toThrow();

    // Should not call setProperty when parentNode is null
    expect(mockParentNode.style.setProperty).not.toHaveBeenCalled();
  });

  it("should handle different swipeBorderWidth values correctly", () => {
    const testCases = [
      { swipeBorderWidth: 10, expectedBorderWidth: "6px" }, // 60 * (10/100) = 6
      { swipeBorderWidth: 20, expectedBorderWidth: "12px" }, // 60 * (20/100) = 12
      { swipeBorderWidth: 50, expectedBorderWidth: "30px" }, // 60 * (50/100) = 30
      { swipeBorderWidth: 100, expectedBorderWidth: "60px" }, // 60 * (100/100) = 60
    ];

    testCases.forEach(({ swipeBorderWidth, expectedBorderWidth }) => {
      jest.clearAllMocks();
      setCSSVariables(1000, 60, swipeBorderWidth);

      expect(mockParentNode.style.setProperty).toHaveBeenCalledWith(
        "--button-border-width",
        expectedBorderWidth
      );
    });
  });

  it("should use default swipeBorderWidth when not provided", () => {
    setCSSVariables(500, 60);

    expect(mockParentNode.style.setProperty).toHaveBeenCalledWith(
      "--button-border-width",
      "12px" // 60 * (20/100) = 12 (default is 20%)
    );
  });
});
