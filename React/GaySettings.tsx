import React, { useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import { isEditingAtom, settingsAtom } from './GayAtoms';
import SliderInputGroup from './SliderInputGroup';

export default () => {
    const [isEditing, setIsEditing] = useRecoilState(isEditingAtom);
    const [settings, setSettings] = useRecoilState(settingsAtom);

    return (
        <div className='gay-settings-container'>
            <form method='POST' onSubmit={e => {
                e.preventDefault()
                let newVals = {}
                new FormData(e.target).forEach((v, k) => {
                    newVals[k] = Number(v)
                })
                setSettings(prev => ({ ...prev, ...newVals }))
            }}>
                <SliderInputGroup text="Number of Columns" value={settings.numCols} name='numCols' bounds={[1, 20]} />
                <SliderInputGroup text="Number of Rows" value={settings.numRows} name='numRows' bounds={[1, 10]} />
                <SliderInputGroup text="Row Height in Pixels" value={settings.rowHeight} name='rowHeight' bounds={[5, 70]} />
                <button role='submit' onMouseDown={e => e.preventDefault()}>Save</button>
            </form>
            <button onClick={() => setIsEditing(false)} onMouseDown={e => e.preventDefault()}>close</button>
        </div >
    );
};
