import React from 'react';
import './style.css';
import { useUnit } from 'effector-react';
import { $project } from '../../state/projects';
import { AudioLoader } from './AudioLoader';
import { Button } from 'primereact/button';
import { pauseFx, playFx } from '../../state/init';

interface DesignerProps {}

export const Designer: React.FC<DesignerProps> = ({}) => {
    const project = useUnit($project);

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
                <h3>Animations</h3>
            </div>
            <div className="flex gap-4 align-items-center">
                <h3>Audio</h3>
                <div>
                    <AudioLoader />
                </div>
            </div>
        </div>
    );
};
