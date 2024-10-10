import React, { useRef } from 'react';

const SliderInputGroup: React.FC<{
    text: string,
    value: number,
    name: string,
    bounds: [number, number]
}> = ({ text, value, name, bounds }) => {
    const ref1 = useRef<HTMLInputElement>(null)
    const ref2 = useRef<HTMLInputElement>(null)
    return (
        <div className='slider-input-group'>
            <input
                ref={ref1}
                type='number'
                name={name}
                className='number-input'
                onChange={e => { if (ref2.current) ref2.current.value = e.target.value }}
                defaultValue={value}
                min={bounds[0]}
                max={bounds[1]}
                step={1}
            ></input>
            <label htmlFor={name}>{text}</label>
            <input
                ref={ref2}
                type='range'
                name={name}
                className='range-input'
                onChange={e => { if (ref1.current) ref1.current.value = e.target.value }}
                defaultValue={value}
                min={bounds[0]}
                max={bounds[1]}
                step={1}
            ></input>
        </div >
    )
}

export default SliderInputGroup;