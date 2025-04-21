import React, { useContext, useEffect, useState } from 'react';
import { audioManager } from '../../state/audio';
import { useParams } from 'react-router';
import { getProject, Project } from '../../api/projects';
import { Renderer } from '../../components/Renderer';
import { Designer } from '../../components/Designer';
import { ToastContext } from '../../context';

export const EditorPage = () => {
    const { id } = useParams<{ id: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const sendToast = useContext(ToastContext);

    useEffect(() => {
        if (!id) return;
        (async () => {
            const data = await getProject(id);
            setProject(data);
            await audioManager.load(data.audio);
            sendToast({
                severity: 'success',
                summary: 'Project loaded',
            });
        })();
    }, [id]);

    return (
        <div>
            <Renderer />
            {!!project && <Designer project={project} />}
        </div>
    );
};
