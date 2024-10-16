import React from 'react';
import ButtonGrid from './Grid/ButtonGrid';
import GaySettings from './Settings/GaySettings';
import { useEditor, useSettings } from './StateManagement';

const GayToolbar: React.FC = () => {
    const isEditing = useEditor(state => state.isEditing);
    const { backgroundColor: { r, g, b }, opacity, customBackground } = useSettings();

    return (
        <div style={{ background: customBackground || `rgba(${[r, g, b, opacity].join(',')}` }} className='gay-toolbar'>
            {isEditing && <GaySettings />}
            <ButtonGrid />
        </div>
    );
}

export default GayToolbar;