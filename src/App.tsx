import React, { createContext, useRef } from 'react';
import 'primereact/resources/themes/lara-dark-amber/theme.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import './theme.css';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { InboxPage } from './pages/Inbox';
import { EditorPage } from './pages/Editor';
import { Toast, ToastMessage } from 'primereact/toast';

const ToastContext = createContext<(toastMessage: ToastMessage) => void>(
    () => {}
);

export const App = () => {
    const toast = useRef<Toast>(null);

    const sendToast = (toastMessage: ToastMessage) => {
        toast.current?.show(toastMessage);
    };

    return (
        <>
            <ToastContext.Provider value={sendToast}>
                <HashRouter>
                    <Routes>
                        <Route index element={<InboxPage />} />
                        <Route path="/project/:id" element={<EditorPage />} />
                    </Routes>
                </HashRouter>
                <Toast ref={toast} position="top-right" className="w-25rem" />
            </ToastContext.Provider>
        </>
    );
};
