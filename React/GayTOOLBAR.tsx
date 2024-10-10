import React, { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { isEditingAtom, settingsSelector } from './GayAtoms';
import { useRecoilState, useRecoilValue } from 'recoil';
import ButtonGrid from './Grid/ButtonGrid';
import GaySettings from './Settings/GaySettings';

interface GayToolbarProps {
    settingsContainerEl: HTMLElement;
}

const GayToolbar: React.FC<GayToolbarProps> = ({ settingsContainerEl }) => {
    console.log('GayToolbar render 🏳‍🌈');

    const persistedSettings = useRecoilValue(settingsSelector);
    const [isEditing] = useRecoilState(isEditingAtom);

    useEffect(() => {
        console.log('recoil_window persistedSettings', persistedSettings)
        // @ts-ignore
        window.__DEBUG_RECOIL__ = persistedSettings
    }, [persistedSettings]);

    return (
        <>
            {isEditing && <GaySettings />}
            <ButtonGrid />
            {createPortal(<GaySettings />, settingsContainerEl)}
        </>
    );
}

export default GayToolbar;