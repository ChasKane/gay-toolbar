import { ReactNode, useEffect, useMemo } from 'react'
import GayButton from './GayButton';
import GridSlot from './GridSlot';
import DraggableButtonContainer from './DraggableButtonContainer';
import { useSettings, usePlugin, useEditor } from '../StateManagement';
import { chooseNewCommand } from 'chooseNewCommand';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

const ButtonGrid: React.FC = () => {
    const addButton = useSettings(state => state.addButton)
    const moveButton = useSettings(state => state.moveButton)
    const { buttonLocations, numRows, rowHeight, numCols } = useSettings(state => state)
    const plugin = usePlugin(state => state.plugin)
    const isEditing = useEditor(state => state.isEditing);

    useEffect(() => {
        return monitorForElements({
            onDrop({ source, location }) {
                const [sx, sy] = (source.data.location as [number, number])
                const destination = location.current.dropTargets[0]
                if (!destination) return;
                const [dx, dy] = (destination.data.location as [number, number])

                moveButton(source.data.buttonName as string, [dx, dy])
                if (buttonNameGrid[dx][dy]) // dropTarget non-empty? swap locations
                    moveButton(buttonNameGrid[dx][dy], [sx, sy])
            }
        })
    }, [buttonLocations])


    const buttonNameGrid: Array<Array<string>> = useMemo(() => {
        const arr = Array(numRows)
        for (let i = 0; i < arr.length; i++)
            arr[i] = Array(numCols).fill('')
        Object.entries(buttonLocations).forEach(([name, coord]) => {
            arr[coord[0]][coord[1]] = name;
        })
        return arr
    }, [buttonLocations])

    const Grid = () => {
        const grid = [];
        for (let i = 0; i < numRows; i++) {
            for (let j = 0; j < numCols; j++) {
                const wrapper = (child: ReactNode) => (
                    <GridSlot key={JSON.stringify([i, j])} location={[i, j]}>
                        {child}
                    </GridSlot>
                );
                const buttonName = buttonNameGrid[i][j];
                let child;
                switch (true) {
                    case buttonName && isEditing:
                        child = (
                            <DraggableButtonContainer location={[i, j]} buttonName={buttonName}>
                                <GayButton buttonName={buttonName} />
                            </DraggableButtonContainer>
                        );
                        break;
                    case !buttonName && isEditing:
                        child = (
                            <button style={{ width: '100%', height: '100%' }} onClick={async () => {
                                console.log('buttonClick', plugin)
                                if (plugin?.app) {
                                    const { name, icon, onClickCommandId } = await chooseNewCommand(plugin);
                                    addButton(name, icon, onClickCommandId, [i, j])
                                }
                            }}>+</button>
                        );
                        break;
                    case buttonName && !isEditing:
                        child = buttonName && (
                            <div className='gay-button-container'>
                                <GayButton buttonName={buttonName} />
                            </div>
                        );
                        break;
                    case !buttonName && !isEditing:
                        child = buttonName && (
                            <div className='gay-button-container'>
                            </div>
                        );
                        break;
                }
                grid.push(wrapper(child))
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