
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import invariant from 'tiny-invariant';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';


interface ButtonContainerProps {
    location: [number, number];
    buttonName: string;
    children: ReactNode;
}

const DraggableButtonContainer: React.FC<ButtonContainerProps> = ({ location, buttonName, children }) => {
    const ref = useRef(null);
    const [dragging, setDragging] = useState<boolean>(false);

    useEffect(() => {
        const el = ref.current;
        invariant(el, 'ref is null');

        return draggable({
            element: el,
            getInitialData: () => ({ location, buttonName }),
            onDragStart: () => setDragging(true),
            onDrop: () => setDragging(false)
        })
    }, [location, buttonName])

    return (
        <div
            ref={ref}
            className={"gay-button-container"}
            key={JSON.stringify(location)}
        >
            {children}
        </div>
    )
}

export default DraggableButtonContainer;