import React, { useRef, useState } from 'react';
import { useSettings } from 'React/StateManagement';

const SliderInputGroup: React.FC<{
    label: string,
    name: string,
    bounds: [number, number],
    step?: number,
}> = ({ label, name, bounds, step = 1 }) => {
    //@ts-ignore -- we know name will be in GayToolbarSettings
    const value = useSettings(state => state[name])
    const setSettings = useSettings(state => state.setSettings)

    const [localValue, setLocalValue] = useState(value.toString());

    return (
        <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>{label}</label>

            <div style={{ display: 'flex', alignItems: 'center' }}>
                <button
                    onClick={() => value > bounds[0] && setSettings({ [name]: value - step })}
                    style={{ marginRight: '8px' }}
                >-</button>
                <input
                    style={{ marginRight: '8px', width: '3em', textAlign: 'center' }}
                    type="number"
                    value={localValue}
                    min={bounds[0]}
                    max={bounds[1]}
                    onChange={e => setLocalValue(e.target.value)}
                    onBlur={e => {
                        // If input is empty, revert to the previous state or fallback value (e.g., 0)
                        if (localValue === '') {
                            setSettings({ [name]: 0 });
                            setLocalValue('0');
                        } else {
                            setSettings({ [name]: Number(localValue) });
                        }
                    }}
                />
                <button
                    onClick={() => value < bounds[1] && setSettings({ [name]: value + step })}
                    style={{ marginRight: '8px' }}
                >+</button>
                <div style={{ flexGrow: 1 }}>
                    <input
                        type="range"
                        min={bounds[0]}
                        max={bounds[1]}
                        onChange={() => setSettings({ [name]: Number(localValue) })}
                        step={step}
                        value={value}
                        style={{ width: '100%' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default SliderInputGroup;