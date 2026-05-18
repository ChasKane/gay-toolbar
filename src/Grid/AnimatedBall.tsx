import React, { useEffect, useRef } from "react";
import { animated, SpringValue } from "@react-spring/web";
import { setIcon } from "obsidian";
import { getLuminanceGuidedIconColor } from "../utils";

interface AnimatedBallProps {
  style: any;
  diameter: number;
  scale: SpringValue<number>;
  color?: string;
  icon?: string;
}

const AnimatedBall: React.FC<AnimatedBallProps> = React.memo(
  ({ style, diameter, scale, color = "rgba(255, 255, 255, 0.8)", icon }) => {
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
          svg.classList.add("gay-toolbar-trail-ball-icon");
          svg.style.setProperty("--gay-toolbar-trail-icon-color", iconColor);
        }
      }
    }, [icon, diameter]);

    return (
      <animated.div
        style={{
          position: "absolute",
          width: scale?.to((scale: number) => diameter * scale),
          height: scale?.to((scale: number) => diameter * scale),
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
