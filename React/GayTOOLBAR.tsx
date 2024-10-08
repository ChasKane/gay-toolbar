import React, { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import GaySettingsPane from './GaySettings';
import { appAtom, isEditingAtom, settingsAtom } from './GayAtoms';
import { useRecoilState } from 'recoil';
import ButtonGrid from './Grid/ButtonGrid';

interface GayToolbarProps {
    settingsContainerEl: HTMLElement;
}

const GayToolbar: React.FC<GayToolbarProps> = ({ settingsContainerEl }) => {
    console.log('GayToolbar render 🏳‍🌈');

    const [settings, setSettings] = useRecoilState(settingsAtom);
    const { commandIds } = settings;
    const [isEditing] = useRecoilState(isEditingAtom);
    const [app] = useRecoilState(appAtom);

    useEffect(() => {
        // @ts-ignore
        window.__DEBUG_RECOIL__ = settings
    }, [settings]);

    return (
        <>
            {isEditing && <GaySettingsPane />}
            <ButtonGrid />
            {createPortal(<GaySettingsPane />, settingsContainerEl)}
        </>
    );
}

export default GayToolbar;