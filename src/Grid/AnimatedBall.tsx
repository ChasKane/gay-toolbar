import React, { useEffect, useRef } from "react";
import { animated } from "@react-spring/web";
import { setIcon } from "obsidian";
import { getLuminanceGuidedIconColor } from "../utils";

interface AnimatedBallProps {
  style: any;
  diameter: number;
  color?: string;
  icon?: string;
}

const AnimatedBall: React.FC<AnimatedBallProps> = React.memo(
  ({ style, diameter, color = "rgba(255, 255, 255, 0.8)", icon }) => {
    const iconRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (icon && iconRef.current) {
        iconRef.current.innerHTML = "";
        setIcon(iconRef.current, icon);

        const svg = iconRef.current.firstChild as HTMLElement;
        if (svg) {
          const iconColor = getLuminanceGuidedIconColor(
            color || "rgba(255, 255, 255, 0.8)"
          );
          svg.style.color = iconColor;
          svg.style.filter = "drop-shadow(0 0 6px rgba(0,0,0,0.8))";
          svg.style.width = `${diameter * 0.6}px`;
          svg.style.height = `${diameter * 0.6}px`;
          svg.style.display = "block";
          svg.style.position = "relative";
          svg.style.zIndex = "20";
        } else {
          console.log("No SVG found after setIcon");
        }
      }
    }, [icon, diameter]);

    return (
      <animated.div
        style={{
          position: "absolute",
          width: diameter,
          height: diameter,
          borderRadius: "50%",
          backgroundColor: color,
          pointerEvents: "none",
          willChange: "transform, opacity",
          left: 0,
          top: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...style,
        }}
      >
        {icon && (
          <div
            ref={iconRef}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              zIndex: 10, // Ensure icon is above the ball background
              pointerEvents: "none",
              // backgroundColor: "rgba(255, 0, 0, 0.3)", // Temporary red background to see if container is visible
              borderRadius: "50%",
              width: "80%",
              height: "80%",
            }}
          />
        )}
      </animated.div>
    );
  }
);

AnimatedBall.displayName = "AnimatedBall";

export default AnimatedBall;
