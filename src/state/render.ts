import { createEvent, createStore } from 'effector';
import { RenderComponent } from '../api/projects';
import { loadProjectFromStorageFx } from './projects';

export const $render = createStore<RenderComponent[]>([]);
export const updateRenderSettings = createEvent<RenderComponent[]>();

$render
    .on(
        loadProjectFromStorageFx.doneData,
        (_, project) => project?.settings?.render ?? []
    )
    .on(updateRenderSettings, (_, render) => render);
