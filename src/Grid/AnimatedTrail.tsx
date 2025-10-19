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
        const finalX = lastPositionRef.current.x + velocity.x * -2; // Continue with velocity
        const finalY = lastPositionRef.current.y + velocity.y * -2;

        // Start fade out animation with continued movement and scaling
        springs.forEach((spring, index) => {
          spring.xy.start([finalX, finalY]);
          spring.opacity.start(0.1);

          if (index === 0) {
            // console.log(
            //   "🎯 LEADING BALL SCALE ANIMATION:",
            //   id,
            // "isFading:",
            // isFadingRef.current,
            // "isAnimating:",
            // spring.scale.isAnimating,
            // "scale:",
            // spring.scale.get()
            // );

            spring.scale.start(5, {
              config: { tension: 400, friction: 20 }, // More aggressive for faster approach
            });

            // console.log(
            //   "🎯 AFTER SCALE START:",
            // id,
            //   "value:",
            //   springs[0].scale.get(),
            //   "isAnimating:",
            //   springs[0].scale.isAnimating,
            //   "isPaused:",
            //   springs[0].scale.isPaused,
            //   "isDelayed:",
            //   springs[0].scale.isDelayed,
            //   "queue:",
            //   springs[0].scale.queue,
            //   "velocity:",
            //   springs[0].scale.velocity,
            //   "animation:",
            //   springs[0].scale.animation
            // );
          }
        });

        const logScale = (label: string, delay: number) => {
          setTimeout(() => {
            console.log(
              `🎬 ${label}:`,
              id,
              "value:",
              springs[0].scale.get()
              // "isAnimating:",
              // springs[0].scale.isAnimating,
              // "isPaused:",
              // springs[0].scale.isPaused,
              // "isDelayed:",
              // springs[0].scale.isDelayed,
              // "queue:",
              // springs[0].scale.queue,
              // "velocity:",
              // springs[0].scale.velocity,
              // "animation:",
              // springs[0].scale.animation
            );
          }, delay);
        };

        // logScale("INITIAL", 0);
        // logScale("10%", pressDelayMs * 0.1);
        // logScale("30%", pressDelayMs * 0.3);
        // logScale("50%", pressDelayMs * 0.5);
        // logScale("80%", pressDelayMs * 0.8);
        logScale("110%", pressDelayMs * 1.1);

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
