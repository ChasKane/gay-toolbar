import React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import SliderInputGroup from './SliderInputGroup';
import { activeSettingsTabAtom, buttonFamily, editingButtonNameAtom, isEditingAtom, pluginAtom, settingsAtom } from 'React/GayAtoms';
import ChooseIconModal from 'ChooseIconModal';
import AddCommandModal from 'addCommandModal';



const GaySettings = () => {
    const [_, setIsEditing] = useRecoilState(isEditingAtom);
    const [activeSettingsTab, setActiveSettingsTab] = useRecoilState(activeSettingsTabAtom);
    const [editingButtonName, setEditingButtonName] = useRecoilState(editingButtonNameAtom);

    if (!activeSettingsTab) return;

    const getActivePane = () => {
        switch (activeSettingsTab) {
            case 'grid':
                return <GridSettings />;
            case 'button':
                return <ButtonSettings />;
        }
    }

    return (
        <div className='gay-settings-container'>
            {getActivePane()}
            <div className='tab-bar'>
                <button className={`tab-item ${activeSettingsTab === 'grid' && 'tab-item-active'}`} onClick={() => { setActiveSettingsTab('grid'); }} onMouseDown={e => e.preventDefault()}>Grid Settings</button>
                <button disabled={!editingButtonName} className={`tab-item ${activeSettingsTab === 'button' && 'tab-item-active'}`} onClick={() => { setActiveSettingsTab('button'); }} onMouseDown={e => e.preventDefault()}>[{editingButtonName || 'No Button Selected'}]</button>
                <button onClick={() => { setIsEditing(false); setEditingButtonName('') }} onMouseDown={e => e.preventDefault()}>X</button>
            </div>
        </div >
    );
};

const GridSettings: React.FC = () => {
    const [settings, setSettings] = useRecoilState(settingsAtom);
    return (
        <form method='POST' onSubmit={e => {
            e.preventDefault()
            const newSettings: { [key: string]: number } = {}
            new FormData(e.target as HTMLFormElement).forEach((v, k) => {
                newSettings[k] = Number(v)
            })
            setSettings(prev => ({ ...prev, ...newSettings }))
        }}>
            <SliderInputGroup text="Number of Columns" value={settings.numCols} name='numCols' bounds={[1, 20]} />
            <SliderInputGroup text="Number of Rows" value={settings.numRows} name='numRows' bounds={[1, 10]} />
            <SliderInputGroup text="Row Height in Pixels" value={settings.rowHeight} name='rowHeight' bounds={[5, 70]} />
            <button role='submit' onMouseDown={e => e.preventDefault()}>Save</button>
        </form>
    )
};

const ButtonSettings: React.FC<{ editName: () => {} }> = ({ editName }) => {
    const plugin = useRecoilValue(pluginAtom);
    const editingButtonName = useRecoilValue(editingButtonNameAtom);
    const [buttonSettings, setButtonSettings] = useRecoilState(buttonFamily(editingButtonName))
    const { name, icon, onClickCommandId } = buttonSettings;
    if (!plugin) return null;

    return (
        <div>
            <input type='color' onChange={e => setButtonSettings({ ...buttonSettings, backgroundColor: e.target.value })}></input>
            <button onClick={editName}>Edit Name</button>
            <button onClick={async () => setButtonSettings({ ...buttonSettings, icon: await new ChooseIconModal(plugin).awaitSelection() })}>Edit Icon</button>
            <button onClick={async () => setButtonSettings({ ...buttonSettings, onClickCommandId: (await new AddCommandModal(plugin).awaitSelection())?.id })}>Edit onTap Command</button>
            {/* <button onClick={() => }>Delete Button</button> */}
        </div>
    );
};

export default GaySettings;