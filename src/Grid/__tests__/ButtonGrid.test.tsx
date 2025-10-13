import React from "react";
import { render, screen } from "@testing-library/react";
import ButtonGrid from "../ButtonGrid";
import { renderWithProviders } from "../../test-utils";

describe("ButtonGrid", () => {
  beforeEach(() => {
    // Reset all stores before each test
    jest.clearAllMocks();
  });

  it("renders the grid container with correct dimensions", () => {
    renderWithProviders(<ButtonGrid />, {
      settingsOverrides: {
        numRows: 2,
        numCols: 3,
        rowHeight: 60,
        gridGap: 8,
        gridPadding: 16,
      },
    });

    const grid = screen.getByTestId("gay-button-grid");
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveStyle({
      display: "grid",
      "grid-template-rows": "repeat(2, 60px)",
      "grid-template-columns": "repeat(3, minmax(0, 1fr))",
    });
  });

  it("renders existing buttons when not in editing mode", () => {
    const testButtons = {
      "button-1": {
        id: "button-1",
        tapIcon: "plus",
        backgroundColor: "#ff0000",
        onTapCommandId: "test-command",
        swipeCommands: [],
        swipeRingOffsetAngle: 0,
      },
    };

    renderWithProviders(<ButtonGrid />, {
      settingsOverrides: {
        numRows: 2,
        numCols: 3,
        buttonIds: ["button-1"],
        buttonLocations: { "button-1": [0, 0] },
        buttons: testButtons,
      },
      editorOverrides: {
        isEditing: false,
      },
    });

    // Should render the existing button (look for the button element)
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });
});
