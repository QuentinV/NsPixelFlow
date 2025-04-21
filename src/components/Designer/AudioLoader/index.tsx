import React, { useContext } from 'react';
import { audioManager } from '../../../state/audio';
import { ToastContext } from '../../../context';
import { Button } from 'primereact/button';

export const AudioLoader = () => {
    const sendToast = useContext(ToastContext);

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;
        await audioManager.loadFromFile(file);

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
            />
            <Button label="Upload" icon="pi pi-file-plus" size="small" />
        </>
    );
};
