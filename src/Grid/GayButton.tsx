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
    const pressIconRef = useRef<HTMLDivElement>(null);

    const plugin = usePlugin(state => state.plugin)
    const { isEditing, selectedButtonId, setSelectedButtonId } = useEditor();
    const { backgroundColor, tapIcon, pressIcon, onTapCommandId, onPressCommandId } = useSettings(state => state.buttons[buttonId]);

    useEffect(() => {
        if (tapIconRef.current) {
            setIcon(tapIconRef.current, tapIcon || 'question-mark-glyph');
            const svg = tapIconRef.current.firstChild as HTMLElement;
            if (svg) {
                svg.classList.add('gay-icon-lmao');
            }
        }
        if (pressIconRef.current && pressIcon) {
            setIcon(pressIconRef.current, pressIcon);
            const svg = pressIconRef.current.firstChild as HTMLElement;
            if (svg) {
                svg.classList.add('gay-icon-lmao');
            }
        }
    }, [isEditing, tapIcon, pressIcon]);

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
                if (isEditing)
                    return;
                const el = buttonRef.current
                el?.addClass('gay-button-tap')

                const startTime = Date.now();
                let pointerDown = true;

                setTimeout(() => {
                    if (pointerDown && onPressCommandId)
                        el?.addClass('gay-button-press')
                    el?.removeClass('gay-button-tap')
                }, 200)

                document.body.addEventListener('pointerup', pointerUpListener)
                document.body.addEventListener('pointercancel', pointerCancelListener)

                function pointerUpListener(e: PointerEvent) {
                    e.preventDefault()
                    const endTime = Date.now()
                    setTimeout(() => { // quick taps were causing menu rendering errors (eg Quick Actions Menu)
                        pointerDown = false;
                        onPressCommandId && el?.removeClass('gay-button-press')
                        if (pointerInside(e, buttonRef.current)) {
                            const delta = endTime - startTime;
                            if (delta < 200) { // tap
                                if (onTapCommandId)
                                    // @ts-ignore | app.commands exists; not sure why it's not in the API...
                                    plugin?.app.commands.executeCommandById(onTapCommandId)

                            } else { // long-press
                                if (!isEditing && onPressCommandId)
                                    // @ts-ignore | app.commands exists; not sure why it's not in the API...
                                    plugin?.app.commands.executeCommandById(onPressCommandId)
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
            <div className={pressIcon && 'tap-icon'} ref={tapIconRef}></div>
            {pressIcon && <div className='press-icon' ref={pressIconRef}></div>}
        </button >

    )
}

export default GayButton;