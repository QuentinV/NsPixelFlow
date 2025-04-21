import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { getProject, Project } from '../../api/projects';
import { Renderer } from '../../components/Renderer';

export const EditorPage = () => {
    const { id } = useParams<{ id: string }>();
    const [project, setProject] = useState<Project | null>(null);

    useEffect(() => {
        if (!id) return;
        getProject(id).then((data) => {
            setProject(data);
        });
    }, [id]);

    return (
        <div>
            <Renderer settings={project?.rendererSettings} />
        </div>
    );
};
