import React from 'react';
import { AudioLoader } from './AudioLoader';
import { useUnit } from 'effector-react';
import { $audio } from '../../../state/audio';

export const AudioSettings = () => {
    const audio = useUnit($audio);
    return (
        <div className="flex gap-3 align-items-center">
            <AudioLoader />
            {!!audio && (
                <div className="border-1 p-2 pl-4 pr-4 relative">
                    {audio.name} / {audio.duration?.toFixed(2)}s
                </div>
            )}
        </div>
    );
};
