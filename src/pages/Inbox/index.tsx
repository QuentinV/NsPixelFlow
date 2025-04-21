import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { InstallButton } from '../../components/InstallButton';
import { listProjects, Project } from '../../api/projects';
import { DataScroller } from 'primereact/datascroller';

export const InboxPage = () => {
    const [projects, setProjects] = useState<Project[]>([]);

    const fetchProjects = async () => setProjects(await listProjects());
    useEffect(() => {
        fetchProjects();
    }, []);

    const itemTemplate = (data: Project) => {
        return (
            <div className="flex gap-4 p-3 align-items-center">
                <div className="font-bold text-900">{data.name}</div>
                <div className="ml-auto">
                    <Button
                        icon="pi pi-folder-open"
                        label="Open"
                        size="small"
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
                            icon="pi pi-folder-plus"
                            label="New project"
                            size="large"
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
