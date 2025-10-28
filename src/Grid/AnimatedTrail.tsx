import React, { forwardRef, useEffect, useRef, useState } from "react";
import { useSpring, animated, SpringRef } from "@react-spring/web";
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

const AnimatedTrail = React.memo<TrailProps>(
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

    // no useTrail because we need to update each of the springs continuously.
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
      if (isActive && !isFadingRef.current) {
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
        // Only update if not fading out
        if (!isFadingRef.current) {
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
        }

        lastPositionRef.current = { x: targetX, y: targetY };
      }
    }, [targetX, targetY, isActive, springs, ballCount]);

    // Handle fade out when trail becomes inactive
    useEffect(() => {
      if (!isActive && !isFadingRef.current) {
        isFadingRef.current = true;

        // Continue moving in the direction of last velocity
        const velocity = velocityRef.current;
        const finalX = lastPositionRef.current.x + velocity.x * 3;
        const finalY = lastPositionRef.current.y + velocity.y * 3;

        setTimeout(() => {
          // setTimeout to ensure react's re-render doesn't overwrite these spring updates.
          // Start fade out animation with continued movement and scaling
          springs.forEach((spring, index) => {
            spring.xy.start([finalX, finalY]);
            spring.opacity.start(0.7);
            if (index === 0) {
              spring.scale.start(4);
            }
          });
        }, 0);

        // Remove trail after fade out
        fadeOutTimeoutRef.current = setTimeout(() => {
          onComplete(id);
        }, pressDelayMs);

        return () => {
          if (fadeOutTimeoutRef.current) {
            clearTimeout(fadeOutTimeoutRef.current);
          }
        };
      }
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
          const transform = spring.xy.to(
            (x, y) =>
              // spring.scale.to(
              //   (scale: number) =>
              `translate3d(${x - (ballSize * spring.scale.get()) / 2}px, ${
                y - (ballSize * spring.scale.get()) / 2
              }px, 0)`
            // )
          );

          return (
            <AnimatedBall
              key={index}
              diameter={ballSize}
              color={color}
              icon={shouldShowIcon ? icon : undefined} // Only show icon in the leading ball
              scale={spring.scale}
              style={{
                transform,
                opacity: spring.opacity,
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
