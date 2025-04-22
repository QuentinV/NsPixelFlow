import React, { useState, ReactNode } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { RenderComponent } from '../../../api/projects';
import { v4 as uuid } from 'uuid';
import { InputSwitch } from 'primereact/inputswitch';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

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

    const changeState = (event: any, key: string) => {
        const value = event.target?.value ?? event.value;
        setState({
            ...state,
            settings: {
                ...(state?.settings ?? {}),
                [key]: value,
            },
        });
    };

    const renderField = ({
        key,
        label,
        render,
    }: {
        key: string;
        label: string;
        render: ({ value, onChange }: any) => ReactNode;
    }) => (
        <div className="flex gap-2 align-items-center">
            <label>{label}</label>
            {render({
                value: (state?.settings as any)?.[key],
                onChange: (event: any) => changeState(event, key),
            })}
        </div>
    );

    const renderBoolean = ({ key, label }: { key: string; label: string }) =>
        renderField({
            key,
            label,
            render: ({ value, onChange }) => (
                <InputSwitch checked={value} onChange={onChange} />
            ),
        });

    const renderNumber = ({ key, label }: { key: string; label: string }) =>
        renderField({
            key,
            label,
            render: ({ value, onChange }) => (
                <InputNumber value={value} onChange={onChange} />
            ),
        });

    const renderString = ({ key, label }: { key: string; label: string }) =>
        renderField({
            key,
            label,
            render: ({ value, onChange }) => (
                <InputText
                    value={value}
                    onChange={onChange}
                    className="input-sm"
                />
            ),
        });

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
            {renderBoolean({
                key: 'autoRotate',
                label: 'Rotate auto',
            })}
            {renderNumber({
                key: 'posZ',
                label: 'position Z',
            })}
            {renderForm()}
        </div>
    );
};
