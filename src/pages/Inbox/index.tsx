import React from 'react';
import { Button } from 'primereact/button';

export const InboxPage = () => {
    return (
        <div className="flex align-items-center gap-4 justify-content-center w-full h-full flex-wrap">
            <div>
                <img src="logo-transparent.png" alt="Logo" />
            </div>
            <div>
                <Button
                    icon="pi pi-folder-plus"
                    label="New project"
                    size="large"
                />
            </div>
        </div>
    );
};
