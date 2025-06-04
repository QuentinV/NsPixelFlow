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
    render?: RenderSettings;
    audio?: Audio[];
    encoder?: {
        [encoderName: string]: any; // BaseEncoderSettings
    };
}

export interface BaseEncoderSettings {
    fps?: number;
    mimeType?: string;
    codecs?: string;
}

export interface FFmpegEncoderSettings extends BaseEncoderSettings {
    preset?: 'ultrafast' | 'slow';
}

export interface RenderSettings {
    width?: number;
    height?: number;
    background?: { color?: string; image?: string };
    autoMix?: boolean;
    components?: RenderComponent[];
}

export interface RenderComponent {
    id: string;
    type?: RenderComponentType;
    duration?: number;
    offset?: number;
    settings?: MeshSettings;
    effects?: MeshEffect[];
    transitionIn?: MeshTransitionIn;
    transitionOut?: MeshTransitionOut;
}

export type RenderComponentType =
    | 'drawing'
    | 'box'
    | 'triangle'
    | 'cylinder'
    | 'custom'
    | 'random'
    | 'text';

export type MeshSettings =
    | BoxMeshSettings
    | TriangleMeshSettings
    | CylinderMeshSettings
    | CustomMeshSettings
    | RandomMeshSettings
    | TextMeshSettings
    | DrawingMeshSettings;

export type MeshTransitionIn =
    | BorderEffectSettings
    | VortexEffectSettings
    | MatrixEffectSettings
    | TornadoEffectSettings
    | ExplosionEffectSettings;

export type MeshTransitionOut = MorphingEffectSettings;

export interface BaseMeshSettings {
    posZ?: number;
    debug?: boolean;
}
export interface DrawingMeshSettings extends BaseMeshSettings {
    increaseDetails?: number;
    drawings: { colors: number[][4]; points: { x: number; y: number }[][] }[];
}
export interface BoxMeshSettings extends BaseMeshSettings {
    keepRotate?: boolean;
    rotateDuration?: number;
    rotateYoyo?: boolean;
    widthMin?: number;
    widthMax?: number;
    heightMin?: number;
    heightMax?: number;
    depthMin?: number;
    depthMax?: number;
}
export interface TriangleMeshSettings extends BaseMeshSettings {
    keepRotate?: boolean;
    rotateDuration?: number;
}
export interface CylinderMeshSettings extends BaseMeshSettings {
    heightMin?: number;
    heightMax?: number;
    radialMin?: number;
    radialMax?: number;
}
export interface CustomMeshSettings extends BaseMeshSettings {
    keepRotate?: boolean;
    rotateDuration?: number;
    segments?: {
        x?: number;
        y?: number;
        z?: number;
        w: number;
        h: number;
        d: number;
        rotate?: { x?: number; y?: number; z?: number };
    }[];
}
export interface RandomMeshSettings extends BaseMeshSettings {}
export interface TextMeshSettings extends BaseMeshSettings {
    font?: string;
    text?: string;
}

export interface BaseMeshEffectsSettings {
    animator?: 'attraction' | 'drawing';
}
export interface MorphingEffectSettings extends BaseMeshEffectsSettings {}
export interface ExplosionEffectSettings extends BaseMeshEffectsSettings {}
export interface MatrixEffectSettings extends BaseMeshEffectsSettings {}
export interface TornadoEffectSettings extends BaseMeshEffectsSettings {}
export interface VortexEffectSettings extends BaseMeshEffectsSettings {}
export interface BorderEffectSettings extends BaseMeshEffectsSettings {}

export interface MeshEffect {
    id: string;
    type?: 'reactiveParticles';
    settings?: ReactiveParticlesEffectSetting;
}

export interface ReactiveParticlesEffectSetting {
    startColor?: string | number;
    endColor?: string | number;
    color?: 'autoFull' | 'fixed';
    autoRotate?: boolean;
    maxFreqValue?: number;
    animateFrequency?: boolean;
    animateShadows?: boolean;
    varyingColors?: boolean;
    attenuateNoise?: number;
    lineWidth?: number;
    transparent?: boolean;
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
