import React, { useContext } from 'react';
import { loadAudioFileFx } from '../../../../state/audio';
import { ToastContext } from '../../../../context';
import { Button } from 'primereact/button';

export const AudioLoader = () => {
    const ref = React.useRef<HTMLInputElement>(null);
    const sendToast = useContext(ToastContext);

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;
        await loadAudioFileFx(file);

        sendToast({
            severity: 'success',
            summary: 'Audio loaded successfully!',
        });
    };

    return (
        <>
            <input
                type="file"
                accept="audio/*"
                onChange={(event) => handleFileChange(event)}
                className="hidden"
                ref={ref}
            />
            <Button
                label="Upload"
                icon="pi pi-file-plus"
                size="small"
                onClick={() => ref.current?.click()}
            />
        </>
    );
};
