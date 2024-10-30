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

    const [isEmpty, setIsEmpty] = useState(false);

    const groomValue = (val: number) => Math.clamp(step === 1 ? val : Math.round(val * 100) / 100, bounds[0], bounds[1])

    return (
        <div>
            <label style={{ display: 'block', marginTop: '4x', marginBottom: '4px' }}>{label}</label>

            <div className='gay-input'>
                <button
                    onClick={() => value > bounds[0] && setSettings({ [name]: groomValue(value - step) })}
                >-</button>
                <input
                    className='gay-numeric-input'
                    type="number"
                    value={isEmpty ? '' : value}
                    min={bounds[0]}
                    max={bounds[1]}
                    step={step}
                    onChange={e => {
                        if (e.target.value === '') {
                            setIsEmpty(true)
                            setSettings({ [name]: bounds[0] });
                        } else {
                            setIsEmpty(false)
                            setSettings({ [name]: groomValue(Number(e.target.value)) });
                        }
                    }}
                    onBlur={e => {
                        if (e.target.value === '') {
                            setSettings({ [name]: 0 });
                        } else {
                            setSettings({ [name]: groomValue(Number(e.target.value)) });
                        }
                    }}
                />
                <button
                    onClick={() => value < bounds[1] && setSettings({ [name]: groomValue(value + step) })}
                >+</button>
            </div>
        </div>
    );
};

export default SliderInputGroup;