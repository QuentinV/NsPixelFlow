import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { InstallButton } from '../../components/InstallButton';
import { listProjects, newProject, Project } from '../../api/projects';
import { DataScroller } from 'primereact/datascroller';
import { useNavigate } from 'react-router-dom';

export const InboxPage = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const navigate = useNavigate();

    const fetchProjects = async () => setProjects(await listProjects());
    useEffect(() => {
        fetchProjects();
    }, []);

    const handleNewProject = async () => {
        const id = await newProject({});
        navigate(`/projects/${id}`);
    };

    const itemTemplate = (data: Project) => {
        return (
            <div className="flex gap-4 p-3 align-items-center">
                <div className="font-bold text-900">{data.name ?? data.id}</div>
                <div className="ml-auto">
                    <Button
                        icon="pi pi-folder-open"
                        label="Open"
                        size="small"
                        onClick={() => navigate(`/projects/${data.id}`)}
                    />
                </div>
            </div>
        );
    };

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
                            className="p-button-outlined"
                            icon="pi pi-folder-plus"
                            label="New project"
                            size="large"
                            onClick={() => handleNewProject()}
                        />
                    </div>
                </div>
                {!!projects?.length && (
                    <div className="w-20rem mb-3">
                        <h2 className="mb-3 text-center">Projects</h2>
                        <DataScroller
                            value={projects}
                            itemTemplate={itemTemplate}
                            rows={5}
                            inline
                            scrollHeight="220px"
                            emptyMessage="No projects yet"
                        />
                    </div>
                )}
            </div>
        </>
    );
};
