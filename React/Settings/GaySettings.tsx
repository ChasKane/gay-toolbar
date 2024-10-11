import React from 'react';
import SliderInputGroup from './SliderInputGroup';
import { settingsAtom, useEditor, usePlugin, useSettings } from 'React/StateManagement';
import ChooseIconModal from 'ChooseIconModal';
import AddCommandModal from 'addCommandModal';



const GaySettings = () => {
    const { setIsEditing, selectedButtonName, setSelectedButtonName } = useEditor();

    return (
        <div className='gay-settings-container'>
            {selectedButtonName ? <ButtonSettings /> : <GridSettings />}
            <div className='tab-bar'>
                <button onClick={() => { setIsEditing(false); setSelectedButtonName('') }} onMouseDown={e => e.preventDefault()}>X</button>
            </div>
        </div >
    );
};

const GridSettings: React.FC = () => {
    const { numCols, numRows, rowHeight, setSettings } = useSettings();
    return (
        <form method='POST' onSubmit={e => {
            e.preventDefault()
            const newSettings: { [key: string]: number } = {}
            new FormData(e.target as HTMLFormElement).forEach((v, k) => {
                newSettings[k] = Number(v)
            })
            setSettings(newSettings)
        }}>
            <SliderInputGroup text="Number of Columns" value={numCols} name='numCols' bounds={[1, 20]} />
            <SliderInputGroup text="Number of Rows" value={numRows} name='numRows' bounds={[1, 10]} />
            <SliderInputGroup text="Row Height in Pixels" value={rowHeight} name='rowHeight' bounds={[5, 70]} />
            <button role='submit' onMouseDown={e => e.preventDefault()}>Save</button>
        </form>
    )
};

const ButtonSettings: React.FC = () => {
    const plugin = usePlugin(state => state.plugin)
    const { setIsEditing, selectedButtonName, setSelectedButtonName } = useEditor();
    const { updateButton, deleteButton } = useSettings(state => state);
    if (!plugin) return null;

    return (
        <div style={{ backgroundColor: 'pink' }}>
            <input type='color' onChange={e => updateButton(selectedButtonName, { backgroundColor: e.target.value })}></input>
            <button >Edit Name</button>
            <button onClick={async () => updateButton(selectedButtonName, { icon: await new ChooseIconModal(plugin).awaitSelection() })}>Edit Icon</button>
            <button onClick={async () => updateButton(selectedButtonName, { onClickCommandId: (await new AddCommandModal(plugin).awaitSelection())?.id })}>Edit onTap Command</button>
            <button onClick={() => { deleteButton(selectedButtonName); setSelectedButtonName(''); }}>Delete Button</button>
        </div >
    );
};

export default GaySettings;