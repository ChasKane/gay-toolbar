import React, { useEffect, useRef, useState } from "react";
import { useSpring, animated } from "@react-spring/web";
import AnimatedBall from "./AnimatedBall";

interface TrailProps {
  id: string;
  targetX: number;
  targetY: number;
  ballCount: number;
  ballDiameter: number;
  isActive: boolean;
  onComplete: (id: string) => void;
  pressDelayMs: number;
  color: string;
  icon?: string;
}

const AnimatedTrail: React.FC<TrailProps> = React.memo(
  ({
    id,
    targetX,
    targetY,
    ballCount,
    ballDiameter,
    isActive,
    onComplete,
    pressDelayMs,
    color,
    icon,
  }) => {
    const fadeOutTimeoutRef = useRef<NodeJS.Timeout>();
    const isFadingRef = useRef(false);
    const lastPositionRef = useRef({ x: targetX, y: targetY });
    const velocityRef = useRef({ x: 0, y: 0 });
    const animationFrameRef = useRef<number>();
    const positionHistoryRef = useRef<Array<{ x: number; y: number }>>([]);

    // Create individual springs for each ball
    const springs = Array.from({ length: ballCount }, (_, index) => {
      return useSpring({
        xy: [targetX, targetY],
        opacity: 1,
        scale: 1,
        config: { tension: 300, friction: 35 },
      });
    });

    // Update position when target changes
    useEffect(() => {
      if (isActive) {
        // Calculate velocity for smooth movement
        const deltaX = targetX - lastPositionRef.current.x;
        const deltaY = targetY - lastPositionRef.current.y;
        velocityRef.current = { x: deltaX, y: deltaY };

        // Add current position to history
        positionHistoryRef.current.push({ x: targetX, y: targetY });

        // Keep only the last N positions (where N = ballCount * 3 for good trail)
        const maxHistory = ballCount * 3;
        if (positionHistoryRef.current.length > maxHistory) {
          positionHistoryRef.current = positionHistoryRef.current.slice(
            -maxHistory
          );
        }

        // Update each ball to follow a different point in the history
        springs.forEach((spring, index) => {
          const historyIndex = Math.max(
            0,
            positionHistoryRef.current.length - 1 - index * 2
          );
          const targetPos = positionHistoryRef.current[historyIndex] || {
            x: targetX,
            y: targetY,
          };
          spring.xy.start([targetPos.x, targetPos.y]);
        });

        lastPositionRef.current = { x: targetX, y: targetY };
      }
    }, [targetX, targetY, isActive, springs, ballCount]);

    // Handle fade out when trail becomes inactive
    useEffect(() => {
      if (!isActive && !isFadingRef.current) {
        isFadingRef.current = true;

        // Continue moving in the direction of last velocity
        const velocity = velocityRef.current;
        const finalX = lastPositionRef.current.x + velocity.x * 2; // Continue with velocity
        const finalY = lastPositionRef.current.y + velocity.y * 2;

        // Start fade out animation with continued movement and scaling
        springs.forEach((spring, index) => {
          spring.xy.start([finalX, finalY]);
          spring.opacity.start(0.5); // Much less stark - fade to 30% instead of 0%
          // Scale up significantly - each ball gets a different scale for variety
          const scaleAmount = 3 + index * 0.8; // 3x, 3.8x, 4.6x, 5.4x - much more dramatic scaling
          spring.scale.start(scaleAmount, {
            config: { tension: 150, friction: 25 }, // Slower, more gradual animation
          });
        });

        // Remove trail after fade out
        fadeOutTimeoutRef.current = setTimeout(() => {
          onComplete(id);
        }, pressDelayMs);
      }

      return () => {
        if (fadeOutTimeoutRef.current) {
          clearTimeout(fadeOutTimeoutRef.current);
        }
      };
    }, [isActive, id, onComplete, pressDelayMs]);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (fadeOutTimeoutRef.current) {
          clearTimeout(fadeOutTimeoutRef.current);
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, []);

    return (
      <>
        {springs.map((spring, index) => {
          // Progressive sizing - each ball gets smaller
          const sizeMultiplier = 1 - index * 0.15; // 100%, 85%, 70%, 55%
          const ballSize = ballDiameter * sizeMultiplier;
          const shouldShowIcon = index === 0 && icon && icon !== undefined;

          // Leading ball gets the icon

          return (
            <AnimatedBall
              key={index}
              diameter={ballSize}
              color={color}
              icon={shouldShowIcon ? icon : undefined} // Only show icon in the leading ball
              style={{
                transform: spring.xy.to(
                  (x, y) =>
                    `translate3d(${x - ballSize / 2}px, ${
                      y - ballSize / 2
                    }px, 0)`
                ),
                opacity: spring.opacity,
                scale: spring.scale,
                zIndex: 1000 + (ballCount - index), // Leading ball (index 0) gets highest z-index
              }}
            />
          );
        })}
      </>
    );
  }
);

AnimatedTrail.displayName = "AnimatedTrail";

export default AnimatedTrail;
