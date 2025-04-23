import React, { useState } from 'react';
import { MeshEffect } from '../../../api/projects';
import { v4 as uuid } from 'uuid';
import { useForm } from './hooks';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';

const types: { value: string }[] = ['none', 'reactiveParticles'].map((t) => ({
    value: t,
}));

interface RenderCompEffectFormProps {
    onSave: (state: MeshEffect) => void;
    defaultState?: MeshEffect;
}

export const RenderCompEffectForm: React.FC<RenderCompEffectFormProps> = ({
    onSave,
    defaultState,
}) => {
    const [state, setState] = useState<MeshEffect>(
        defaultState ?? { id: uuid() }
    );

    const { renderBoolean, renderNumber, renderString } = useForm<MeshEffect>(
        state,
        setState
    );

    const renderForm = () => {
        if (!state?.type) return null;
        switch (state.type) {
            case 'reactiveParticles':
                return (
                    <>
                        {renderString({
                            key: 'startColor',
                            label: 'Start color',
                        })}
                        {renderString({
                            key: 'endColor',
                            label: 'End color',
                        })}
                        {renderString({
                            key: 'color',
                            label: 'Color opt',
                        })}
                        {renderBoolean({
                            key: 'autoRotate',
                            label: 'Auto rotate',
                        })}
                        {renderNumber({
                            key: 'maxFreqValue',
                            label: 'Max freq',
                        })}
                        {renderBoolean({
                            key: 'animateFrequency',
                            label: 'Animate frequency',
                        })}
                        {renderBoolean({
                            key: 'animateShadows',
                            label: 'Animate shadows',
                        })}
                        {renderBoolean({
                            key: 'varyingColors',
                            label: 'Varying colors',
                        })}
                        {renderNumber({
                            key: 'attenuateNoise',
                            label: 'Attenuate noise',
                        })}
                        {renderNumber({
                            key: 'Line width',
                            label: 'Line width',
                        })}
                        {renderBoolean({
                            key: 'transparent',
                            label: 'Transparent',
                        })}
                    </>
                );
        }
        return null;
    };

    return (
        <div className="p-3 flex flex-column gap-4">
            <div className="flex gap-4">
                <Button
                    label="Save"
                    icon="pi pi-save"
                    onClick={() => onSave(state)}
                />
            </div>
            <div>
                <Dropdown
                    options={types}
                    optionLabel="value"
                    value={state.type}
                    placeholder="Type"
                    onChange={(event) =>
                        setState({
                            ...state,
                            type:
                                event.value === 'none'
                                    ? undefined
                                    : event.value,
                        })
                    }
                />
            </div>
            {renderForm()}
        </div>
    );
};
