import React, { useEffect, useRef } from 'react'
import { setIcon } from 'obsidian';
import { usePlugin, useSettings, useEditor } from '../StateManagement';

const GayButton: React.FC<{ buttonId: string }> = ({ buttonId }) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const tapIconRef = useRef<HTMLDivElement>(null);
    const holdIconRef = useRef<HTMLDivElement>(null);

    const plugin = usePlugin(state => state.plugin)
    const { isEditing, selectedButtonId, setSelectedButtonId } = useEditor();
    const { backgroundColor, tapIcon, holdIcon, onTapCommandId, onHoldCommandId } = useSettings(state => state.buttons[buttonId]);

    useEffect(() => {
        if (tapIconRef.current) {
            setIcon(tapIconRef.current, tapIcon || 'question-mark-glyph');
            const svg = tapIconRef.current.firstChild as HTMLElement;
            if (svg) {
                svg.classList.add('gay-icon-lmao');
            }
        }
        if (holdIconRef.current && holdIcon) {
            setIcon(holdIconRef.current, holdIcon);
            const svg = holdIconRef.current.firstChild as HTMLElement;
            if (svg) {
                svg.classList.add('gay-icon-lmao');
            }
        }
    }, [isEditing, tapIcon, holdIcon]);

    return (
        <button
            ref={buttonRef}
            id={buttonId}
            key={buttonId + "__button-key"}
            className={[
                'gay-button',
                isEditing && 'wiggle',
                isEditing && buttonId === selectedButtonId ? 'button-halo' : '',
            ].join(' ')}
            style={{ backgroundColor: backgroundColor }}
            onClick={(e) => {
                e.preventDefault();
                if (isEditing) {
                    if (selectedButtonId === buttonId)
                        setSelectedButtonId('')
                    else
                        setSelectedButtonId(buttonId)
                } else {
                    if (onTapCommandId)
                        // @ts-ignore | app.commands exists; not sure why it's not in the API...
                        plugin?.app.commands.executeCommandById(onTapCommandId)
                }
            }}
            onMouseDown={e => !isEditing && e.preventDefault()}
        >
            <div ref={tapIconRef}></div>
            <div className='hold-icon' ref={holdIconRef}></div>
        </button>

    )
}

export default GayButton;