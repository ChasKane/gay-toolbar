import react, { useEffect, useMemo, useState } from 'react'
import GayButton from '../GayButton';
import Slot from './Slot';
import ButtonContainer from './ButtonContainer';
import { useRecoilState } from 'recoil';
import { appAtom, isEditingAtom, pluginAtom, settingsAtom } from '../GayAtoms';
import { chooseNewCommand } from 'chooseNewCommand';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { setIcon } from 'obsidian';

interface DraggableGridProps {
}

const ButtonGrid: React.FC<DraggableGridProps> = () => {
    const [{ commandLocations, commandIcons, numRows, rowHeight, numCols }, setSettings] = useRecoilState(settingsAtom);
    const [isEditing] = useRecoilState(isEditingAtom);
    const [plugin] = useRecoilState(pluginAtom);
    const [app] = useRecoilState(appAtom);

    const cLocs: Array<Array<string>> = useMemo(() => {
        const arr = Array(numRows)
        for (let i = 0; i < arr.length; i++)
            arr[i] = Array(numCols).fill(null)
        Object.entries(commandLocations).forEach(([id, coord]) => {
            arr[coord[0]][coord[1]] = id;
        })
        return arr
    }, [commandLocations])

    useEffect(() => {
        return monitorForElements({
            onDrop({ source, location }) {
                const [sx, sy] = source.data.location
                const destination = location.current.dropTargets[0]
                if (!destination) return;
                const [dx, dy] = destination.data.location

                setSettings(prev => ({ ...prev, commandLocations: { ...prev.commandLocations, [source.data.commandId]: [dx, dy] } }))
                if (cLocs[dx][dy])
                    setSettings(prev => ({ ...prev, commandLocations: { ...prev.commandLocations, [cLocs[dx][dy]]: [sx, sy] } }))
                // setIcon(source.element, commandIcons[source.data.commandId] || 'question-mark-glyph');
                // const svg = source.element.firstChild as HTMLElement;
                // if (svg) {
                //     isEditing ? svg.classList.add('wiggle') : svg.classList.remove('wiggle')
                // }

            }
        })
    }, [cLocs])

    const Grid = () => {
        const grid = [];
        for (let i = 0; i < numRows; i++) {
            for (let j = 0; j < numCols; j++) {
                const id = cLocs[i][j];
                grid.push(isEditing ? (
                    <Slot location={[i, j]} key={JSON.stringify([i, j])}>
                        {id ?
                            <ButtonContainer location={[i, j]} commandId={id}>
                                <GayButton icon={commandIcons[id]} commandId={id} />
                            </ButtonContainer>
                            :
                            <button style={{ width: '100%', height: '100%' }} onClick={async () => {
                                if (plugin && app) {
                                    const pair = await chooseNewCommand(plugin, app);
                                    setSettings(prev => ({
                                        ...prev,
                                        commandIds: [...prev.commandIds, pair.id],
                                        commandLocations: { ...prev.commandLocations, [pair.id]: [i, j] },
                                        commandIcons: { ...prev.commandIcons, [pair.id]: pair.icon }
                                    }))
                                }
                            }}>+</button>
                        }
                    </Slot >
                ) : (
                    <Slot
                        key={JSON.stringify([i, j])}
                        location={[i, j]}
                    >
                        {id && (
                            <div
                                id={id}
                                className='gay-button-container'
                            >
                                <GayButton icon={commandIcons[id]} commandId={id} />
                            </div>
                        )}
                    </Slot>
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