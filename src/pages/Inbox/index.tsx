import React from 'react';
import { Button } from 'primereact/button';
import { InstallButton } from '../../components/InstallButton';

export const InboxPage = () => {
    return (
        <>
            <div className="absolute top-0 right-0 pt-5 pr-5">
                <InstallButton />
            </div>
            <div className="flex align-items-center gap-4 justify-content-center w-full h-full flex-wrap">
                <div className="flex flex-column gap-4 align-items-center">
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
            </div>
        </>
    );
};
