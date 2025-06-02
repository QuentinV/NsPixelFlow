import React, { useContext, useEffect } from 'react';
import '../../state/init';
import { useParams } from 'react-router';
import { Renderer } from '../../components/Renderer';
import { Designer } from '../../components/Designer';
import { ToastContext } from '../../context';
import { loadProjectFromStorageFx } from '../../state/projects';

export const EditorPage = () => {
    const { id } = useParams<{ id: string }>();
    const sendToast = useContext(ToastContext);

    useEffect(() => {
        if (!id) return;
        (async () => {
            await loadProjectFromStorageFx({ id });
            sendToast({
                severity: 'success',
                summary: 'Project loaded',
            });
        })();
    }, [id]);

    return (
        <div className="w-full h-full">
            <Renderer />
            <Designer />
            <div id="recordProgress">
                <div className="bg-gray-800 p-2 border-1">
                    <div className="flex justify-items-center">
                        <i className="pi pi-spin pi-spinner"></i>
                        <div id="recordProgressStatus" className="ml-2"></div>
                    </div>
                    <div
                        id="recordProgressTime"
                        className="mt-2 text-center"
                    ></div>
                </div>
            </div>
        </div>
    );
};
