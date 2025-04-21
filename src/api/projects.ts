import { execQuery } from './db';

export interface Project {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

export const listProjects = async () => {
    const projects = await execQuery('projects', (s: IDBObjectStore) =>
        s.getAll()
    );
    return projects;
};
