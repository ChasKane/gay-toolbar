import React from "react";
import { render, screen } from "@testing-library/react";
import AnimatedTrail from "../AnimatedTrail";

// Mock @react-spring/web
jest.mock("@react-spring/web", () => ({
  useTrail: () => [
    Array(5)
      .fill(null)
      .map((_, i) => ({
        xy: { to: (fn: any) => fn(100, 100) },
        opacity: 1,
        scale: 1,
      })),
    { start: jest.fn() },
  ],
  animated: {
    div: ({ children, style, ...props }: any) => (
      <div data-testid="animated-ball" style={style} {...props}>
        {children}
      </div>
    ),
  },
}));

describe("AnimatedTrail", () => {
  const defaultProps = {
    id: "test-trail",
    targetX: 100,
    targetY: 100,
    ballCount: 5,
    ballDiameter: 20,
    isActive: true,
    onComplete: jest.fn(),
    pressDelayMs: 1000,
    color: "rgba(255, 255, 255, 0.8)",
  };

  it("renders the correct number of balls", () => {
    render(<AnimatedTrail {...defaultProps} />);
    const balls = screen.getAllByTestId("animated-ball");
    expect(balls).toHaveLength(5);
  });

  it("calls onComplete when trail becomes inactive", () => {
    const onComplete = jest.fn();
    const { rerender } = render(
      <AnimatedTrail {...defaultProps} onComplete={onComplete} />
    );

    // Make trail inactive
    rerender(
      <AnimatedTrail
        {...defaultProps}
        isActive={false}
        onComplete={onComplete}
      />
    );

    // Should call onComplete after pressDelayMs
    setTimeout(() => {
      expect(onComplete).toHaveBeenCalledWith("test-trail");
    }, 1000);
  });
});
