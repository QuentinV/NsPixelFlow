import { createEffect, createStore } from 'effector';
import { BaseProject, getProject } from '../api/projects';

export const $project = createStore<BaseProject | null>(null);

export const loadProjectFromStorageFx = createEffect(
    async ({ id }: { id: string }) => getProject(id)
);

$project.on(loadProjectFromStorageFx.doneData, (_, project) => project);
