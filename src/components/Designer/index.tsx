import React from 'react';
import './style.css';
import { Button } from 'primereact/button';
import { pauseFx, playFx, recordFx } from '../../state/init';
import { AudioSettings } from './AudioSettings';
import { RenderSettings } from './RenderSettings';
import { useUnit } from 'effector-react';

interface DesignerProps {}

export const Designer: React.FC<DesignerProps> = ({}) => {
    const recordPending = useUnit(recordFx.pending);
    const playPending = useUnit(playFx.pending);
    const pausePending = useUnit(pauseFx.pending);
    return (
        <div className="designer">
            <div className="flex gap-4">
                <div>Duration</div>
                <div className="ml-auto flex gap-2">
                    <Button
                        icon="pi pi-video"
                        label="Record"
                        onClick={() => recordFx({ duration: 20, fps: 60 })}
                        size="small"
                        loading={recordPending}
                    />
                    <Button
                        icon="pi pi-pause"
                        label="Pause"
                        onClick={() => pauseFx()}
                        size="small"
                        loading={pausePending}
                    />
                    <Button
                        icon="pi pi-play"
                        label="Play"
                        onClick={() => playFx()}
                        size="small"
                        loading={playPending}
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
