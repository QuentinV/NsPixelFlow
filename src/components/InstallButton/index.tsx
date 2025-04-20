import React, { useEffect, useState } from 'react';

export const InstallButton = () => {
    const [pwaPrompt, setPwaPrompt] = useState<any | null>(null);

    useEffect(() => {
        if (
            (window?.navigator as any)?.standalone ||
            window?.matchMedia('(display-mode: standalone)')?.matches
        ) {
            return;
        }
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            setPwaPrompt(e);
        });
    }, []);

    return (
        <>
            {!!pwaPrompt && (
                <span
                    className="text-green-500 cursor-pointer hover:text-primary flex align-items-center gap-2"
                    onClick={() => {
                        pwaPrompt.prompt();
                        pwaPrompt.userChoice.then(() => setPwaPrompt(null));
                    }}
                >
                    <i className="pi pi-cloud-download text-2xl" />
                    <span>Install</span>
                </span>
            )}
        </>
    );
};
