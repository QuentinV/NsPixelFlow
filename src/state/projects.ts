import { createEffect, createStore } from 'effector';
import { getProject, Project } from '../api/projects';

export const $project = createStore<Project | null>(null);

export const loadProjectFromStorageFx = createEffect(
    async ({ id }: { id: string }) => getProject(id)
);

$project.on(loadProjectFromStorageFx.doneData, (_, project) => project);
