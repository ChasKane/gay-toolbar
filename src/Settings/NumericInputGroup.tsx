import React, { useRef, useState } from "react";
import { useSettings } from "../StateManagement";
import { groomValue } from "utils";

const SliderInputGroup: React.FC<{
  label: string;
  name: string;
  bounds: [number, number];
  step?: number;
}> = ({ label, name, bounds, step = 1 }) => {
  //@ts-ignore -- we know name will be in GayToolbarSettings
  const value = useSettings((state) => state[name]);
  const SetSettings = useSettings((state) => state.setSettings);
  const setSettings = (newSettings: any) => {
    if (name === "pressDelayMs")
      document.body.style.setProperty(
        "--press-delay",
        `${newSettings.pressDelayMs}ms`
      );
    SetSettings(newSettings);
  };

  const [isEmpty, setIsEmpty] = useState(false);

  return (
    <div>
      <label className="gay-input-label">{label}</label>

      <div className="gay-input">
        <button
          onClick={() =>
            value > bounds[0] &&
            setSettings({ [name]: groomValue(value - step, step, bounds) })
          }
        >
          -
        </button>
        <input
          className="gay-numeric-input"
          type="number"
          value={isEmpty ? "" : value}
          min={bounds[0]}
          max={bounds[1]}
          step={step}
          onChange={(e) => {
            if (e.target.value === "") {
              setIsEmpty(true);
              setSettings({ [name]: bounds[0] });
            } else {
              setIsEmpty(false);
              setSettings({
                [name]: groomValue(Number(e.target.value), step, bounds),
              });
            }
          }}
          onBlur={(e) => {
            if (e.target.value === "") {
              setSettings({ [name]: 0 });
            } else {
              setSettings({
                [name]: groomValue(Number(e.target.value), step, bounds),
              });
            }
          }}
        />
        <button
          onClick={() =>
            value < bounds[1] &&
            setSettings({ [name]: groomValue(value + step, step, bounds) })
          }
        >
          +
        </button>
      </div>
    </div>
  );
};

export default SliderInputGroup;
