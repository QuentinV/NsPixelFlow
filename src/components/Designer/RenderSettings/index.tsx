import React, { useState } from 'react';
import { InputNumber } from 'primereact/inputnumber';
import { useUnit } from 'effector-react';
import {
    $render,
    deleteMeshEffect,
    deleteRenderComponent,
    updateMeshEffect,
    updateRenderComponent,
} from '../../../state/render';
import { Button } from 'primereact/button';
import { Sidebar } from 'primereact/sidebar';
import { RenderCompForm } from './RenderCompForm';
import { MeshEffect, RenderComponent } from '../../../api/projects';
import { RenderCompEffectForm } from './RenderCompEffectForm';

export const RenderSettings = () => {
    const renderSettings = useUnit($render);
    const [visibleEditCompIndex, setVisibleEditCompIndex] = useState<
        number | null
    >(null);
    const [visibleEditCompEffectIndex, setVisibleEditCompEffectIndex] =
        useState<number | null>(null);

    const save = (state: RenderComponent) => {
        updateRenderComponent(state);
        setVisibleEditCompIndex(null);
    };

    const onDelete = (state: RenderComponent) => {
        deleteRenderComponent(state.id);
        setVisibleEditCompIndex(null);
    };

    const saveEffect = (state: MeshEffect) => {
        if (visibleEditCompEffectIndex === null) return;
        if (state?.type === undefined) {
            deleteMeshEffect(visibleEditCompEffectIndex);
        } else {
            updateMeshEffect({
                componentIndex: visibleEditCompEffectIndex,
                effect: state,
            });
        }
        setVisibleEditCompEffectIndex(null);
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
            <Sidebar
                visible={visibleEditCompEffectIndex != null}
                onHide={() => setVisibleEditCompEffectIndex(null)}
                position="right"
            >
                <RenderCompEffectForm
                    onSave={saveEffect}
                    defaultState={
                        renderSettings?.components?.[
                            visibleEditCompEffectIndex ?? -1
                        ]?.effects?.[0]
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
                            className="border-1 p-2 cursor-pointer pl-4 pr-4 relative"
                            onClick={() => setVisibleEditCompIndex(index)}
                        >
                            {component.type}
                            <i
                                className="absolute top-0 right-0 pi pi-sparkles"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setVisibleEditCompEffectIndex(index);
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};
