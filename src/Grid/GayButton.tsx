import React, { useEffect, useRef, useState } from 'react';
import { setIcon } from 'obsidian';
import { usePlugin, useSettings, useEditor } from '../StateManagement';

const pointerInside = (t: PointerEvent, el: HTMLElement | null) => {
    if (!el)
        return false;

    const { x, y, width, height } = el.getBoundingClientRect()
    if (t.clientX >= x
        && t.clientX <= x + width
        && t.clientY >= y
        && t.clientY <= y + height
    )
        return true;

    return false;
}

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
            onClick={e => {
                !isEditing && e.preventDefault();
                if (isEditing) {
                    if (selectedButtonId === buttonId)
                        setSelectedButtonId('')
                    else
                        setSelectedButtonId(buttonId)
                }
            }}
            onMouseDown={e => !isEditing && e.preventDefault()}
            onPointerDown={e => {
                const el = buttonRef.current
                el?.addClass('gay-button-tap')

                const startTime = Date.now();
                let pointerDown = true;

                setTimeout(() => {
                    if (pointerDown && holdIcon)
                        el?.addClass('gay-button-hold')
                    el?.removeClass('gay-button-tap')
                }, 200)

                document.body.addEventListener('pointerup', pointerUpListener)
                document.body.addEventListener('pointercancel', pointerCancelListener)

                function pointerUpListener(e: PointerEvent) {
                    e.preventDefault()
                    const endTime = Date.now()
                    setTimeout(() => { // quick taps were causing menu rendering errors (eg Quick Actions Menu)
                        pointerDown = false;
                        holdIcon && el?.removeClass('gay-button-hold')
                        if (pointerInside(e, buttonRef.current)) {
                            const delta = endTime - startTime;
                            if (delta < 200) { // tap
                                if (onTapCommandId)
                                    // @ts-ignore | app.commands exists; not sure why it's not in the API...
                                    plugin?.app.commands.executeCommandById(onTapCommandId)

                            } else { // hold
                                if (!isEditing && onHoldCommandId)
                                    // @ts-ignore | app.commands exists; not sure why it's not in the API...
                                    plugin?.app.commands.executeCommandById(onHoldCommandId)
                            }
                        } else { // swipe
                            // ...
                        }
                        document.body.removeEventListener('pointerup', pointerUpListener)
                        document.body.removeEventListener('pointercancel', pointerCancelListener)
                    }, 20)
                }
                function pointerCancelListener() {
                    document.body.removeEventListener('pointerup', pointerUpListener)
                    document.body.removeEventListener('pointercancel', pointerCancelListener)
                }
            }}
        >
            <div className={holdIcon && 'tap-icon'} ref={tapIconRef}></div>
            {holdIcon && <div className='hold-icon' ref={holdIconRef}></div>}
        </button >

    )
}

export default GayButton;