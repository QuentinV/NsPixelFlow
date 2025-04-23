import React from 'react';
import './style.css';
import { Button } from 'primereact/button';
import { pauseFx, playFx } from '../../state/init';
import { AudioSettings } from './AudioSettings';
import { RenderSettings } from './RenderSettings';

interface DesignerProps {}

export const Designer: React.FC<DesignerProps> = ({}) => {
    return (
        <div className="designer">
            <div className="flex gap-4">
                <div>Duration</div>
                <div className="ml-auto flex gap-2">
                    <Button
                        icon="pi pi-pause"
                        label="Pause"
                        onClick={() => pauseFx()}
                        size="small"
                    />
                    <Button
                        icon="pi pi-play"
                        label="Play"
                        onClick={() => playFx()}
                        size="small"
                    />
                </div>
            </div>
            <div className="flex gap-4 align-items-center">
                <h3 className="w-6rem">Render</h3>
                <RenderSettings />
            </div>
            <div className="flex gap-4 align-items-center mt-2">
                <h3 className="w-6rem">Audio</h3>
                <AudioSettings />
            </div>
        </div>
    );
};
