import { ReactNode, useEffect, useMemo } from 'react'
import GayButton from './GayButton';
import GridSlot from './GridSlot';
import DraggableButtonContainer from './DraggableButtonContainer';
import { useSettings, usePlugin, useEditor } from '../StateManagement';
import { chooseNewCommand } from 'src/chooseNewCommand';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

const ButtonGrid: React.FC = () => {
    const addButton = useSettings(state => state.addButton)
    const moveButton = useSettings(state => state.moveButton)
    const setSelectedButtonId = useEditor(state => state.setSelectedButtonId)
    const isEditing = useEditor(state => state.isEditing);
    const { buttonLocations, numRows, numCols, rowHeight, gridGap, gridPadding } = useSettings(state => state)
    const plugin = usePlugin(state => state.plugin)

    useEffect(() => {
        return monitorForElements({
            onDrop({ source, location }) {
                const [sx, sy] = (source.data.location as [number, number])
                const destination = location.current.dropTargets[0]
                if (!destination) return;
                const [dx, dy] = (destination.data.location as [number, number])

                moveButton(source.data.buttonId as string, [dx, dy])
                if (buttonIdGrid[dx][dy]) // dropTarget non-empty? swap locations
                    moveButton(buttonIdGrid[dx][dy], [sx, sy])
            }
        })
    }, [buttonLocations])


    const buttonIdGrid: Array<Array<string>> = useMemo(() => {
        const arr = Array(numRows)
        for (let i = 0; i < numRows; i++)
            arr[i] = Array(numCols).fill('')
        Object.entries(buttonLocations).forEach(([id, coord]) => {
            if (coord[0] < numRows && coord[1] < numCols)
                arr[coord[0]][coord[1]] = id;
        })
        return arr
    }, [buttonLocations, numRows, numCols])

    const Grid = () => {
        const grid = [];
        for (let i = 0; i < numRows; i++) {
            for (let j = 0; j < numCols; j++) {
                const wrapper = (child: ReactNode) => (
                    <GridSlot key={JSON.stringify([i, j])} location={[i, j]}>
                        {child}
                    </GridSlot>
                );
                const buttonId = buttonIdGrid[i][j];
                let child;
                switch (true) {
                    case buttonId && isEditing:
                        child = (
                            <DraggableButtonContainer location={[i, j]} buttonId={buttonId}>
                                <GayButton buttonId={buttonId} />
                            </DraggableButtonContainer>
                        );
                        break;
                    case !buttonId && isEditing:
                        child = (
                            <button style={{ width: '100%', height: '100%' }} onClick={async () => {
                                if (plugin?.app) {
                                    const { icon, id: onTapCommandId } = await chooseNewCommand(plugin);
                                    const id = Date.now().toString(36)
                                    addButton(id, icon, onTapCommandId, [i, j])
                                    setTimeout(() => setSelectedButtonId(id), 0)
                                }
                            }}>+</button>
                        );
                        break;
                    case buttonId && !isEditing:
                        child = buttonId && (
                            <div className='gay-button-container'>
                                <GayButton buttonId={buttonId} />
                            </div>
                        );
                        break;
                    case !buttonId && !isEditing:
                        child = buttonId && (
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
            gap: `${gridGap}px ${gridGap}px`,
            padding: `${gridPadding}px`,
        }}>
            {Grid()}
        </div>
    );
};

export default ButtonGrid;