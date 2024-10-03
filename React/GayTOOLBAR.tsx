import React, { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import GayButton from './GayButton';
import GaySettingsPane from './GaySettings';
import { appAtom, isEditingAtom, settingsAtom } from './GayAtoms';
import { useRecoilState } from 'recoil';
import ButtonGrid from './ButtonGrid';
import GayToolbarPlugin from 'main';

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


    const commandIcons = useMemo(() => commandIds.reduce<{ [key: string]: string }>(
        // @ts-ignore | app.commands exists; not sure why it's not in the API...
        (acc, id: string) => (acc[id] = app?.commands?.commands?.[id]?.icon, acc),
        {}
    ), [commandIds, app]);

    return (
        <>
            {isEditing && <GaySettingsPane />}
            <ButtonGrid icons={commandIcons} />
            {createPortal(<GaySettingsPane />, settingsContainerEl)}
        </>
    );
}

export default GayToolbar;