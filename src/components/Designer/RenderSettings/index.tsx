import React, { useState } from 'react';
import { InputNumber } from 'primereact/inputnumber';
import { useUnit } from 'effector-react';
import {
    $render,
    deleteRenderComponent,
    updateRenderComponent,
} from '../../../state/render';
import { Button } from 'primereact/button';
import { Sidebar } from 'primereact/sidebar';
import { RenderCompForm } from './RenderCompForm';
import { RenderComponent } from '../../../api/projects';

export const RenderSettings = () => {
    const renderSettings = useUnit($render);
    const [visibleEditCompIndex, setVisibleEditCompIndex] = useState<
        number | null
    >(null);

    const save = (state: RenderComponent) => {
        updateRenderComponent(state);
        setVisibleEditCompIndex(null);
    };

    const onDelete = (state: RenderComponent) => {
        deleteRenderComponent(state.id);
        setVisibleEditCompIndex(null);
    };

    return (
        <>
            <Sidebar
                visible={visibleEditCompIndex !== null}
                onHide={() => setVisibleEditCompIndex(null)}
                position="right"
            >
                <RenderCompForm
                    onSave={save}
                    onDelete={onDelete}
                    defaultState={
                        renderSettings?.components?.[visibleEditCompIndex ?? -1]
                    }
                />
            </Sidebar>
            <div className="flex flex-column gap-2">
                <div className="w-full flex gap-4">
                    <div className="flex gap-4 align-items-center">
                        <label htmlFor="width">Width:</label>
                        <InputNumber placeholder="width" />
                    </div>
                    <div className="flex gap-4 align-items-center">
                        <label htmlFor="height">Height:</label>
                        <InputNumber placeholder="height" />
                    </div>
                    <div className="flex gap-4 align-items-center">
                        <label htmlFor="fps">FPS:</label>
                        <InputNumber placeholder="fps" className="w-2rem" />
                    </div>
                </div>
                <div className="flex gap-3 align-items-center">
                    <Button
                        icon="pi pi-plus"
                        onClick={() => setVisibleEditCompIndex(-1)}
                        size="small"
                    />
                    {renderSettings?.components?.map((component, index) => (
                        <div
                            key={index}
                            className="border-1 p-2 cursor-pointer"
                            onClick={() => setVisibleEditCompIndex(index)}
                        >
                            {component.type}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};
