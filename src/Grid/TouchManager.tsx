import React, { useState, useCallback, useRef } from "react";
import { useGesture } from "@use-gesture/react";
import { getAngle, getSwipeIdx } from "../utils";
import AnimatedTrail from "./AnimatedTrail";

interface Trail {
  id: string;
  targetX: number;
  targetY: number;
  isActive: boolean;
  velocityX: number;
  velocityY: number;
  icon?: string;
  color: string;
  initX: number;
  initY: number;
}

interface TouchManagerProps {
  children: React.ReactNode;
  ballCount: number;
  ballDiameter: number;
  pressDelayMs: number;
  swipeCommands?: Array<{ color: string; commandId: string; icon: string }>;
  swipeRingOffsetAngle?: number;
}

const TouchManager: React.FC<TouchManagerProps> = ({
  children,
  ballCount,
  ballDiameter,
  pressDelayMs,
  swipeCommands,
  swipeRingOffsetAngle = 0,
}) => {
  const [trails, setTrails] = useState<Trail[]>([]);
  const trailIdCounter = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate color and icon based on position (same logic as GayButton)
  const getCommandFromPosition = useCallback(
    (initX: number, initY: number, currentX: number, currentY: number) => {
      if (!swipeCommands || swipeCommands.length === 0) {
        return { color: "rgba(255, 255, 255, 0.8)", icon: undefined };
      }

      // Use the same logic as GayButton: calculate angle from init to current position
      const angle = getAngle(
        { x: initX, y: initY },
        { x: currentX, y: currentY }
      );
      const swipeIdx = getSwipeIdx(
        angle,
        swipeRingOffsetAngle,
        swipeCommands.length
      );

      const command = swipeCommands[swipeIdx];
      return {
        color: command?.color || "rgba(255, 255, 255, 0.8)",
        icon: command?.icon,
      };
    },
    [swipeCommands, swipeRingOffsetAngle]
  );

  const createTrail = useCallback((x: number, y: number) => {
    const id = `trail-${trailIdCounter.current++}`;

    // Convert viewport coordinates to container-relative coordinates
    const containerRect = containerRef.current?.getBoundingClientRect();
    const relativeX = containerRect ? x - containerRect.left : x;
    const relativeY = containerRect ? y - containerRect.top : y;

    const newTrail: Trail = {
      id,
      targetX: relativeX,
      targetY: relativeY,
      isActive: true,
      velocityX: 0,
      velocityY: 0,
      color: "rgba(255, 255, 255, 0)", // Start with white, will be updated on first movement
      initX: relativeX,
      initY: relativeY,
    };

    setTrails((prev) => [...prev, newTrail]);
    return id;
  }, []);

  const updateTrail = useCallback(
    (id: string, x: number, y: number) => {
      // Convert viewport coordinates to container-relative coordinates
      const containerRect = containerRef.current?.getBoundingClientRect();
      const relativeX = containerRect ? x - containerRect.left : x;
      const relativeY = containerRect ? y - containerRect.top : y;

      setTrails((prev) =>
        prev.map((trail) => {
          if (trail.id === id) {
            // Calculate velocity
            const velocityX = relativeX - trail.targetX;
            const velocityY = relativeY - trail.targetY;

            // Use position-based logic (same as GayButton) to determine command
            const command = getCommandFromPosition(
              trail.initX,
              trail.initY,
              relativeX,
              relativeY
            );

            return {
              ...trail,
              targetX: relativeX,
              targetY: relativeY,
              velocityX,
              velocityY,
              color: command.color,
              icon: command.icon,
            };
          }
          return trail;
        })
      );
    },
    [getCommandFromPosition]
  );

  const deactivateTrail = useCallback((id: string) => {
    setTrails((prev) =>
      prev.map((trail) =>
        trail.id === id ? { ...trail, isActive: false } : trail
      )
    );
  }, []);

  const removeTrail = useCallback((id: string) => {
    setTrails((prev) => prev.filter((trail) => trail.id !== id));
  }, []);

  const bind = useGesture(
    {
      onDrag: ({ active, xy: [x, y], first, last, event }) => {
        if (first) {
          // Create new trail on first touch
          createTrail(x, y);
        } else if (active) {
          // Update the most recent active trail
          const activeTrails = trails.filter((t) => t.isActive);
          if (activeTrails.length > 0) {
            const latestTrail = activeTrails[activeTrails.length - 1];
            updateTrail(latestTrail.id, x, y);
          }
        } else if (last) {
          // Deactivate the most recent trail
          const activeTrails = trails.filter((t) => t.isActive);
          if (activeTrails.length > 0) {
            const latestTrail = activeTrails[activeTrails.length - 1];
            deactivateTrail(latestTrail.id);
          }
        }
      },
      onMove: ({ active, xy: [x, y] }) => {
        if (active) {
          // Update the most recent active trail during move
          const activeTrails = trails.filter((t) => t.isActive);
          if (activeTrails.length > 0) {
            const latestTrail = activeTrails[activeTrails.length - 1];
            updateTrail(latestTrail.id, x, y);
          }
        }
      },
    },
    {
      drag: {
        filterTaps: false,
        threshold: 0,
      },
    }
  );

  return (
    <div
      ref={containerRef}
      {...bind()}
      className="touch-manager"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      {children}

      {/* Render all active trails */}
      {trails.map((trail) => (
        <AnimatedTrail
          key={trail.id}
          id={trail.id}
          targetX={trail.targetX}
          targetY={trail.targetY}
          ballCount={ballCount}
          ballDiameter={ballDiameter}
          isActive={trail.isActive}
          onComplete={removeTrail}
          pressDelayMs={pressDelayMs}
          color={trail.color}
          icon={trail.icon}
        />
      ))}
    </div>
  );
};

export default TouchManager;
