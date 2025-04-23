import React, { useState, ReactNode } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { RenderComponent } from '../../../api/projects';
import { v4 as uuid } from 'uuid';
import { Button } from 'primereact/button';
import { useForm } from './hooks';

const types: { value: string }[] = [
    'box',
    'triangle',
    'cylinder',
    'drawing',
    'custom',
    'text',
].map((t) => ({ value: t }));

interface RenderCompFormProps {
    onSave: (state: RenderComponent) => void;
    onDelete: (state: RenderComponent) => void;
    defaultState?: RenderComponent;
}

export const RenderCompForm: React.FC<RenderCompFormProps> = ({
    onSave,
    onDelete,
    defaultState,
}) => {
    const [state, setState] = useState<RenderComponent>(
        defaultState ?? {
            id: uuid(),
        }
    );
    const { renderBoolean, renderNumber, renderString } =
        useForm<RenderComponent>(state, setState);

    const renderForm = () => {
        if (!state?.type) return null;
        switch (state.type) {
            case 'box':
                return (
                    <>
                        {renderBoolean({
                            key: 'keepRotate',
                            label: 'Keep rotate',
                        })}
                        {renderNumber({
                            key: 'rotateDuration',
                            label: 'Rotate duration',
                        })}
                        {renderBoolean({
                            key: 'rotateYoyo',
                            label: 'Rotate yoyo',
                        })}
                        {renderNumber({
                            key: 'widthMin',
                            label: 'Min width',
                        })}
                        {renderNumber({
                            key: 'widthMax',
                            label: 'Max width',
                        })}
                        {renderNumber({
                            key: 'heightMin',
                            label: 'Min height',
                        })}
                        {renderNumber({
                            key: 'heightMax',
                            label: 'Max height',
                        })}
                        {renderNumber({
                            key: 'depthMin',
                            label: 'Min depth',
                        })}
                        {renderNumber({
                            key: 'depthMax',
                            label: 'Max depth',
                        })}
                    </>
                );
            case 'triangle':
                return (
                    <>
                        {renderBoolean({
                            key: 'keepRotate',
                            label: 'Keep rotate',
                        })}
                        {renderNumber({
                            key: 'rotateDuration',
                            label: 'Rotate duration',
                        })}
                    </>
                );
            case 'cylinder':
                return (
                    <>
                        {renderNumber({
                            key: 'heightMin',
                            label: 'Min height',
                        })}
                        {renderNumber({
                            key: 'heightMax',
                            label: 'Max height',
                        })}
                        {renderNumber({
                            key: 'radialMin',
                            label: 'Min radial',
                        })}
                        {renderNumber({
                            key: 'radialMax',
                            label: 'Max radial',
                        })}
                    </>
                );
            case 'drawing':
                return (
                    <>
                        {renderNumber({
                            key: 'increaseDetails',
                            label: 'Increase details',
                        })}
                    </>
                );
            case 'custom':
                return (
                    <>
                        {renderBoolean({
                            key: 'keepRotate',
                            label: 'Keep rotate',
                        })}
                        {renderNumber({
                            key: 'rotateDuration',
                            label: 'Rotate duration',
                        })}
                    </>
                );
            case 'text':
                return (
                    <>
                        {renderString({
                            key: 'font',
                            label: 'Font',
                        })}
                        {renderString({
                            key: 'text',
                            label: 'Text',
                        })}
                    </>
                );
        }
    };

    return (
        <div className="p-3 flex flex-column gap-4">
            <div className="flex gap-4">
                <Button
                    label="Save"
                    icon="pi pi-save"
                    onClick={() => onSave(state)}
                />
                <Button
                    label="Remove"
                    icon="pi pi-times"
                    onClick={() => onDelete(state)}
                />
            </div>
            <div>
                <Dropdown
                    options={types}
                    optionLabel="value"
                    value={state.type}
                    placeholder="Type"
                    onChange={(event) =>
                        setState({ ...state, type: event.value })
                    }
                />
            </div>
            {renderNumber({
                key: 'posZ',
                label: 'position Z',
            })}
            {renderForm()}
        </div>
    );
};
