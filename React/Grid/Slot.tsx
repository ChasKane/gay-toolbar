
import react, { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { useRecoilState } from 'recoil';
import { appAtom, isEditingAtom, pluginAtom, settingsAtom } from '../GayAtoms';
import invariant from 'tiny-invariant';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

interface SlotProps {
    location: [number, number];
    children: ReactNode;
}

const sameLoc = ([a, b]: [number, number], [x, y]: [number, number]) => a === x && b === y

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
            style={{
                opacity: entered ? '15%' : '100%',
            }}
        // onDragEnter={e => {
        //     console.log('dragEnter ', i, j, e.target, e.currentTarget.contains(e.relatedTarget))
        //     if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget)) {
        //         !sameLoc(JSON.parse(e.currentTarget.id), hoverLoc) && e.currentTarget.id !== draggingId && setHoverLoc((JSON.parse(e.currentTarget.id) as [number, number]))
        //     }
        // }}
        // onDragLeave={e => {
        //     console.log('dragLeave ', i, j, e.target, e.currentTarget.contains(e.relatedTarget))
        //     if (!e.relatedTarget || e.currentTarget.contains(e.relatedTarget)) {
        //         !sameLoc(JSON.parse(e.currentTarget.id), hoverLoc) && e.currentTarget.id !== draggingId && setHoverLoc([-1, -1])
        //     }
        // }}
        // onDragOver={e => e.preventDefault()}
        >
            {children}
        </div>
    )
}

export default Slot;