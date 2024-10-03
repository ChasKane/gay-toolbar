import React, { useEffect, useRef } from 'react'
import { setIcon } from 'obsidian';
import { isEditingAtom } from './GayAtoms';
import { useRecoilState } from 'recoil';

interface GayButtonProps {
    commandId: string;
    icon: string;
}

const GayButton: React.FC<GayButtonProps> = ({ commandId, icon }) => {
    const ref = useRef<HTMLButtonElement>(null);

    const [isEditing] = useRecoilState(isEditingAtom);

    useEffect(() => {
        if (ref.current) {
            setIcon(ref.current, icon || 'question-mark-glyph');
            const svg = ref.current.firstChild as HTMLElement;
            if (svg) {
                svg.addEventListener('dragenter', e => e.stopPropagation())
                svg.addEventListener('dragleave', e => e.stopPropagation())
                svg.addEventListener('dragstart', e => e.stopPropagation())
                svg.addEventListener('dragend', e => e.stopPropagation())
                isEditing ? svg.classList.add('wiggle') : svg.classList.remove('wiggle')
            }
        }
    }, [ref.current, isEditing]);

    return (
        <button
            id={commandId}
            key={commandId + "__button-key"}
            onClick={(e) => {
                if (!isEditing) {
                    e.preventDefault();
                    // @ts-ignore | app.commands exists; not sure why it's not in the API...
                    app.commands.executeCommandById(commandId);
                }
            }}
            onMouseDown={(e) => !isEditing && e.preventDefault()}
            ref={ref}
            className={['gay-button', isEditing ? 'wiggle' : ''].join(' ')}
        >
        </button>
    )
}

export default GayButton;