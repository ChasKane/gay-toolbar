
import react, { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { useRecoilState } from 'recoil';
import { appAtom, isEditingAtom, pluginAtom, settingsAtom } from '../GayAtoms';
import invariant from 'tiny-invariant';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';


interface ButtonContainerProps {
    location: [number, number];
    commandId: string;
    children: ReactNode;
}

const ButtonContainer: React.FC<ButtonContainerProps> = ({ location, commandId, children }) => {
    const ref = useRef(null);
    const [dragging, setDragging] = useState<boolean>(false);

    useEffect(() => {
        const el = ref.current;
        invariant(el, 'ref is null');

        return draggable({
            element: el,
            getInitialData: () => ({ location, commandId }),
            onDragStart: () => setDragging(true),
            onDrop: () => setDragging(false)
        })
    }, [location, commandId])

    return (
        <div
            ref={ref}
            className={"gay-button-container"}
        >
            {children}
        </div>
    )
}

export default ButtonContainer;