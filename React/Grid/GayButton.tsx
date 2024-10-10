import React, { useEffect, useRef } from 'react'
import { setIcon } from 'obsidian';
import { buttonFamily, editingButtonNameAtom, pluginAtom, isEditingAtom } from '../GayAtoms';
import { useRecoilState, useRecoilValue } from 'recoil';

interface GayButtonProps {
    buttonName: string;
}

const GayButton: React.FC<GayButtonProps> = ({ buttonName }) => {
    const ref = useRef<HTMLButtonElement>(null);

    const [plugin] = useRecoilState(pluginAtom);
    console.log(buttonName)
    const { icon, backgroundColor, onClickCommandId } = useRecoilValue(buttonFamily(buttonName));
    const [isEditing] = useRecoilState(isEditingAtom);
    const [editingbuttonName, setEditingbuttonName] = useRecoilState(editingButtonNameAtom);

    useEffect(() => {
        if (ref.current) {
            setIcon(ref.current, icon || 'question-mark-glyph');
            const svg = ref.current.firstChild as HTMLElement;
            if (svg) {
                isEditing ? svg.classList.add('wiggle') : svg.classList.remove('wiggle')
            }
        }
    }, [ref.current, isEditing]);

    return (
        <button
            id={buttonName}
            key={buttonName + "__button-key"}
            onClick={(e) => {
                e.preventDefault();
                if (isEditing) {
                    if (editingbuttonName === buttonName)
                        setEditingbuttonName('')
                    else
                        setEditingbuttonName(buttonName)
                } else {
                    // @ts-ignore | app.commands exists; not sure why it's not in the API...
                    onClickCommandId && plugin?.app.commands.executeCommandById(onClickCommandId)
                }
            }}
            onMouseDown={(e) => !isEditing && e.preventDefault()}
            ref={ref}
            className={[
                'gay-button',
                isEditing && buttonName === editingbuttonName ? 'button-halo' : '',
            ].join(' ')}
            style={{ backgroundColor: backgroundColor }}
        >
        </button>
    )
}

export default GayButton;