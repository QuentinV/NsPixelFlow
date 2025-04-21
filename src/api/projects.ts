import { execQuery } from './db';
import { v4 as uuid } from 'uuid';

export interface Project extends BaseProject {
    settings?: Settings;
}

export interface BaseProject {
    id?: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Settings {
    view: { width: number; height: number };
    render: RenderComponent[];
    audio: Audio[];
}

export interface RenderComponent {
    id: string;
    type:
        | 'drawing'
        | 'box'
        | 'triangle'
        | 'cylinder'
        | 'custom'
        | 'random'
        | 'text';
    duration?: number;
    offset?: number;
    settings: MeshSettings;
}

export type MeshSettings =
    | BoxMeshSettings
    | TriangleMeshSettings
    | CylinderMeshSettings
    | CustomMeshSettings
    | RandomMeshSettings
    | TextMeshSettings
    | DrawingMeshSettings;

export type MeshEffectSettings =
    | BaseMeshEffectsSettings
    | MorphingEffectSettings
    | ExplosionEffectSettings
    | MatrixEffectSettings
    | TornadoEffectSettings
    | VortexEffectSettings
    | BorderEffectSettings;

export interface BaseMeshSettings {
    effects?: MeshEffectSettings[];
}
export interface DrawingMeshSettings extends BaseMeshSettings {}
export interface BoxMeshSettings extends BaseMeshSettings {}
export interface TriangleMeshSettings extends BaseMeshSettings {}
export interface CylinderMeshSettings extends BaseMeshSettings {}
export interface CustomMeshSettings extends BaseMeshSettings {}
export interface RandomMeshSettings extends BaseMeshSettings {}
export interface TextMeshSettings extends BaseMeshSettings {}

export interface BaseMeshEffectsSettings {}
export interface MorphingEffectSettings extends BaseMeshEffectsSettings {}
export interface ExplosionEffectSettings extends BaseMeshEffectsSettings {}
export interface MatrixEffectSettings extends BaseMeshEffectsSettings {}
export interface TornadoEffectSettings extends BaseMeshEffectsSettings {}
export interface VortexEffectSettings extends BaseMeshEffectsSettings {}
export interface BorderEffectSettings extends BaseMeshEffectsSettings {}

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

export const getProject = async (id: string): Promise<Project> => {
    const project = await execQuery('projects', (s: IDBObjectStore) =>
        s.get(id)
    );
    return project;
};

export const updateProject = async (project: Project) => {
    await execQuery(
        'projects',
        (s: IDBObjectStore) =>
            s.put({
                ...project,
                updatedAt: new Date(),
            }),
        'readwrite'
    );
};
