import { ReactNode, useEffect, useMemo } from 'react'
import GayButton from './GayButton';
import Slot from './Slot';
import DraggableButtonContainer from './DraggableButtonContainer';
import { useRecoilState } from 'recoil';
import { pluginAtom, isEditingAtom, settingsAtom } from '../GayAtoms';
import { chooseNewCommand } from 'chooseNewCommand';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

const ButtonGrid: React.FC = () => {
    const [{ buttonLocations, numRows, rowHeight, numCols }, setSettings] = useRecoilState(settingsAtom);
    const [isEditing] = useRecoilState(isEditingAtom);
    const [plugin] = useRecoilState(pluginAtom);

    useEffect(() => {
        return monitorForElements({
            onDrop({ source, location }) {
                const [sx, sy] = (source.data.location as [number, number])
                const destination = location.current.dropTargets[0]
                if (!destination) return;
                const [dx, dy] = (destination.data.location as [number, number])

                setSettings(prev => ({ ...prev, buttonLocations: { ...prev.buttonLocations, [source.data.buttonName as string]: [dx, dy] } }))
                if (buttonNameGrid[dx][dy]) // dropTarget non-empty
                    setSettings(prev => ({ ...prev, buttonLocations: { ...prev.buttonLocations, [buttonLocations[dx][dy]]: [sx, sy] } }))
            }
        })
    }, [buttonLocations])

    const buttonNameGrid: Array<Array<string>> = useMemo(() => {
        const arr = Array(numRows)
        for (let i = 0; i < arr.length; i++)
            arr[i] = Array(numCols).fill('')
        Object.entries(buttonLocations).forEach(([id, coord]) => {
            arr[coord[0]][coord[1]] = id;
        })
        return arr
    }, [buttonLocations])

    const Grid = () => {
        const grid = [];
        for (let i = 0; i < numRows; i++) {
            for (let j = 0; j < numCols; j++) {
                const wrapper = (child: ReactNode) => (
                    <Slot
                        key={JSON.stringify([i, j])}
                        location={[i, j]}
                    >
                        {child}
                    </Slot>
                );
                const buttonName = buttonNameGrid[i][j];
                let children;
                switch (true) {
                    case buttonName && isEditing:
                        children = (
                            <DraggableButtonContainer location={[i, j]} buttonName={buttonName}>
                                <GayButton buttonName={buttonName} />
                            </DraggableButtonContainer>
                        );
                        break;
                    case !buttonName && isEditing:
                        children = (
                            <button style={{ width: '100%', height: '100%' }} onClick={async () => {
                                if (plugin?.app) {
                                    const pair = await chooseNewCommand(plugin);
                                    setSettings(prev => ({
                                        ...prev,
                                        buttonNames: [...prev.buttonNames, pair.id],
                                        buttonLocations: { ...prev.buttonLocations, [pair.id]: [i, j] },
                                        // commandIcons: { ...prev.commandIcons, [pair.id]: pair.icon }
                                    }))
                                }
                            }}>+</button>
                        );
                        break;
                    case buttonName && !isEditing:
                        children = buttonName && (
                            <div className='gay-button-container'>
                                <GayButton buttonName={buttonName} />
                            </div>
                        );
                        break;
                    case !buttonName && !isEditing:
                        children = buttonName && (
                            <div className='gay-button-container'>
                            </div>
                        );
                        break;
                }
                grid.push(wrapper(children))
            }
        }
        return grid
    }


    return (
        <div style={{
            display: 'grid',
            gridTemplateRows: `repeat(${numRows}, ${rowHeight}px)`,
            gridTemplateColumns: `repeat(${numCols}, minmax(0, 1fr))`,
        }}>
            {Grid()}
        </div>
    );
};

export default ButtonGrid;