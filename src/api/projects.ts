import { execQuery } from './db';
import { v4 as uuid } from 'uuid';

export interface Project {
    id?: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    settings?: Settings;
}

export interface Settings {
    view: { width: number; height: number };
    render: RenderComponent[];
    audio: Audio[];
}

export interface RenderComponent {
    id: string;
    type: 'image' | 'video' | 'text';
    duration?: number;
    offset?: number;
    children?: RenderComponent[];
}

export interface Audio {
    name?: string;
    data?: string;
    offset?: number;
    duration?: number;
    volume?: number;
}

export const listProjects = async () => {
    const projects = await execQuery('projects', (s: IDBObjectStore) =>
        s.getAll()
    );
    return projects;
};

export const newProject = async ({ name }: { name?: string }) => {
    const id = uuid();
    await execQuery(
        'projects',
        (s: IDBObjectStore) =>
            s.put({
                id,
                name,
                createdAt: new Date(),
                updatedAt: new Date(),
            }),
        'readwrite'
    );
    return id;
};

export const getProject = async (id: string) => {
    const project = await execQuery('projects', (s: IDBObjectStore) =>
        s.get(id)
    );
    return project;
};
