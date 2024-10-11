import React, { useEffect, useRef } from 'react'
import { setIcon } from 'obsidian';
import { usePlugin, useSettings, useEditor } from '../StateManagement';

const GayButton: React.FC<{ buttonName: string }> = ({ buttonName }) => {
    const ref = useRef<HTMLButtonElement>(null);

    const plugin = usePlugin(state => state.plugin)
    const { isEditing, selectedButtonName, setSelectedButtonName } = useEditor();
    const button = useSettings(state => state.buttons[buttonName]);

    if (!button)
        return null

    const { icon, backgroundColor, onClickCommandId } = button;

    useEffect(() => {
        if (ref.current) {
            setIcon(ref.current, icon || 'question-mark-glyph');
            const svg = ref.current.firstChild as HTMLElement;
            if (svg) {
                isEditing ? svg.classList.add('wiggle') : svg.classList.remove('wiggle')
            }
        }
    }, [ref.current, isEditing, icon]);


    return (
        <button
            id={buttonName}
            key={buttonName + "__button-key"}
            onClick={(e) => {
                e.preventDefault();
                if (isEditing) {
                    if (selectedButtonName === buttonName)
                        setSelectedButtonName('')
                    else
                        setSelectedButtonName(buttonName)
                } else {
                    // @ts-ignore | app.commands exists; not sure why it's not in the API...
                    onClickCommandId && plugin?.app.commands.executeCommandById(onClickCommandId)
                }
            }}
            onMouseDown={(e) => !isEditing && e.preventDefault()}
            ref={ref}
            className={[
                'gay-button',
                isEditing && buttonName === selectedButtonName ? 'button-halo' : '',
            ].join(' ')}
            style={{ backgroundColor: backgroundColor }}
        >
        </button>
    )
}

export default GayButton;