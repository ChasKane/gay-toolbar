
import { ReactNode, useEffect, useRef, useState } from 'react'
import invariant from 'tiny-invariant';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

interface SlotProps {
    location: [number, number];
    children: ReactNode;
}

const Slot: React.FC<SlotProps> = ({ location, children }) => {
    const ref = useRef(null)
    const [entered, setEntered] = useState(false)

    useEffect(() => {
        const el = ref.current
        invariant(el)

        return dropTargetForElements({
            element: el,
            getData: () => ({ location }),
            onDragEnter: () => setEntered(true),
            onDragLeave: () => setEntered(false),
            onDrop: () => setEntered(false)
        })
    }, [location])

    return (
        <div
            ref={ref}
            key={JSON.stringify(location)}
            className='slot'
            style={{ opacity: entered ? '15%' : '100%' }}
        >
            {children}
        </div>
    )
}

export default Slot;