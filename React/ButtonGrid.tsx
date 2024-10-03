import react, { useMemo, useState } from 'react'
import GayButton from './GayButton';
import { useRecoilState } from 'recoil';
import { appAtom, isEditingAtom, pluginAtom, settingsAtom } from './GayAtoms';
import { chooseNewCommand } from 'chooseNewCommand';

interface DraggableGridProps {
    icons: { [key: string]: string }
}
const sameLoc = ([a, b]: [number, number], [x, y]: [number, number]) => a === x && b === y

const ButtonGrid: React.FC<DraggableGridProps> = ({ icons }) => {
    const [{ commandIds, commandLocations, numRows, rowHeight, numCols, forceSquareButtons }, setSettings] = useRecoilState(settingsAtom);
    const [isEditing] = useRecoilState(isEditingAtom);
    const [plugin] = useRecoilState(pluginAtom);
    const [app] = useRecoilState(appAtom);

    const [draggingId, SetDraggingId] = useState<string>('');
    const [hoverLoc, SetHoverLoc] = useState<[number, number]>([-1, -1]);

    const setDraggingId = (s: string) => { console.log('drag=', s), SetDraggingId(s) }
    const setHoverLoc = (s: [number, number]) => { console.log('hover=', s), SetHoverLoc(s) }

    const cLocs: Array<Array<string>> = useMemo(() => {
        const arr = Array(numRows)
        for (let i = 0; i < arr.length; i++)
            arr[i] = Array(numCols).fill(null)
        Object.entries(commandLocations).forEach(([id, coord]) => {
            arr[coord.row - 1][coord.col - 1] = id
        })
        return arr
    }, [commandLocations])

    const Grid = () => {
        const grid = [];
        for (let i = 0; i < numRows; i++) {
            for (let j = 0; j < numCols; j++) {
                const id = cLocs[i][j];
                grid.push(isEditing ? (
                    <div
                        key={`${i + 1}_${j + 1}`}
                        id={JSON.stringify([i, j])}
                        className='cell'
                        style={{
                            background: sameLoc([i, j], hoverLoc) ? 'pink' : '',
                            gridRow: `${i + 1}`,
                            gridColumn: `${j + 1}`,
                        }}
                        onDragEnter={e => {
                            console.log('dragEnter ', i, j, e.target, e.currentTarget.contains(e.relatedTarget))
                            if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget)) {
                                !sameLoc(JSON.parse(e.currentTarget.id), hoverLoc) && e.currentTarget.id !== draggingId && setHoverLoc((JSON.parse(e.currentTarget.id) as [number, number]))
                            }
                        }}
                        onDragLeave={e => {
                            console.log('dragLeave ', i, j, e.target, e.currentTarget.contains(e.relatedTarget))
                            if (!e.relatedTarget || e.currentTarget.contains(e.relatedTarget)) {
                                !sameLoc(JSON.parse(e.currentTarget.id), hoverLoc) && e.currentTarget.id !== draggingId && setHoverLoc([-1, -1])
                            }
                        }}
                        onDragOver={e => e.preventDefault()}
                    >
                        {id ?
                            <div
                                draggable
                                id={id}
                                className={"gay-button-container " + ((id === draggingId && !sameLoc([i, j], hoverLoc)) ? 'hovering-button-container' : '')}
                                onClick={e => console.log(e.currentTarget.id)}
                                onTouchStart={e => e.preventDefault()}
                                onDragStart={e => {
                                    const ct = e.currentTarget;
                                    console.log('dragStart, ', ct.id, e.target)
                                    if (!ct)
                                        return;
                                    setDraggingId(ct.id);
                                    const dragImage = ct.cloneNode(true) as HTMLElement
                                    dragImage.id = 'dragImage';
                                    dragImage.style.width = ct.getBoundingClientRect().width + 'px';
                                    dragImage.style.height = ct.getBoundingClientRect().height + 'px';
                                    document.body.appendChild(dragImage)
                                    e.dataTransfer.setDragImage(
                                        dragImage,
                                        dragImage.getBoundingClientRect().width / 2,
                                        dragImage.getBoundingClientRect().height / 2,
                                    )
                                    ct.classList.add('hovering-button-container')
                                }}
                                onDragEnd={e => {
                                    console.log('dragEnd', hoverLoc)
                                    setDraggingId('');
                                    setHoverLoc([-1, -1]);
                                    e.currentTarget.classList.remove('hovering-button-container')
                                    document.getElementById('dragImage')?.remove()
                                    const [row, col] = hoverLoc
                                    if (row < 0 || col < 0) {
                                        console.log('hoverLoc wrong: ', hoverLoc)
                                        return
                                    }
                                    setSettings(prev => ({ ...prev, commandLocations: { ...prev.commandLocations, [e.currentTarget.id]: { row: row + 1, col: col + 1 } } }))
                                    if (cLocs[row][col])
                                        setSettings(prev => ({ ...prev, commandLocations: { ...prev.commandLocations, [cLocs[row][col]]: { row: i + 1, col: j + 1 } } }))
                                }}
                            >
                                <GayButton icon={icons[id]} commandId={id} />
                            </div>
                            :
                            <button style={{ width: '100%', height: '100%' }} onClick={async () => {
                                console.log(plugin, app)
                                if (plugin && app) {
                                    const pair = await chooseNewCommand(plugin, app);
                                    setSettings(prev => ({ ...prev, commandIds: [...prev.commandIds, pair.id], commandLocations: { ...prev.commandLocations, [pair.id]: { row: i + 1, col: j + 1 } } }))
                                }
                            }}>+</button>
                        }
                    </div >
                ) : (
                    <div
                        key={`${i + 1}_${j + 1}`}
                        id={JSON.stringify([i, j])}
                        className='cell'
                        style={{
                            gridRow: `${i + 1}`,
                            gridColumn: `${j + 1}`,
                        }}
                    >
                        {id && (
                            <div
                                id={id}
                                className='gay-button-container'
                            >
                                <GayButton icon={icons[id]} commandId={id} />
                            </div>
                        )}
                    </div>
                ))
            }
        }
        return grid
    }


    return (
        <div className='gay-toolbar' style={{
            display: 'grid',
            gridTemplateRows: `repeat(${numRows}, ${rowHeight}px)`,
            gridTemplateColumns: `repeat(${numCols}, minmax(0, 1fr))`,
        }}>
            {Grid()}
        </div>
    );
};

export default ButtonGrid;