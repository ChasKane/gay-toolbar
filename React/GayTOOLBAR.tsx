import React from 'react';
import ButtonGrid from './Grid/ButtonGrid';
import GaySettings from './Settings/GaySettings';
import { useEditor } from './StateManagement';

const GayToolbar: React.FC = () => {
    console.log('GayToolbar render 🏳‍🌈');

    const isEditing = useEditor(state => state.isEditing);

    return (
        <>
            {isEditing && <GaySettings />}
            <ButtonGrid />
        </>
    );
}

export default GayToolbar;