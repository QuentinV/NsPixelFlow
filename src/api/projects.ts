import { execQuery } from './db';
import { v4 as uuid } from 'uuid';

export interface Project {
    id?: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    rendererSettings?: RendererSettings;
    audioSettings?: AudioSettings;
}

export interface RendererSettings {
    view: { width: number; height: number };
}

export interface AudioSettings {}

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
