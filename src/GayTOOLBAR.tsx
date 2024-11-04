import React, { RefObject, useEffect, useRef } from 'react';
import ButtonGrid from './Grid/ButtonGrid';
import GaySettings from './Settings/GaySettings';
import { useEditor, useSettings } from './StateManagement';
import { Platform } from 'obsidian';

const GayToolbar: React.FC = () => {
    const isEditing = useEditor(state => state.isEditing);
    const { backgroundColor: { r, g, b }, opacity, customBackground } = useSettings();

    const ref: RefObject<HTMLDivElement> = useRef(null)

    useEffect(() => {
        if (Platform.isMobile)
            return;
        const statusBar: HTMLDivElement | null = document.querySelector('.status-bar')
        if (statusBar)
            statusBar.style.bottom = (ref.current?.getBoundingClientRect().height || 0) + 'px'
        return () => { if (statusBar) statusBar.style.bottom = '0px' }
    })

    return (
        <div ref={ref} style={{ background: customBackground || `rgba(${[r, g, b, opacity].join(',')}` }} className='gay-toolbar'>
            {isEditing && <GaySettings />}
            <ButtonGrid />
        </div>
    );
}

export default GayToolbar;