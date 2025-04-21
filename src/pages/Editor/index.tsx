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
        <div>
            <Renderer />
            <Designer />
        </div>
    );
};
