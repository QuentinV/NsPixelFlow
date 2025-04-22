import { createEvent, createStore } from 'effector';
import { RenderComponent, RenderSettings } from '../api/projects';
import { loadProjectFromStorageFx } from './projects';

export const $render = createStore<RenderSettings>({});
export const updateRenderSettings = createEvent<RenderSettings>();
export const updateRenderComponent = createEvent<RenderComponent>();
export const deleteRenderComponent = createEvent<string>();

$render
    .on(
        loadProjectFromStorageFx.doneData,
        (_, project) =>
            project?.settings?.render ?? {
                width: 512,
                height: 512,
                fps: 30,
                background: { color: '#000000' },
                autoMix: false,
            }
    )
    .on(updateRenderSettings, (_, render) => render)
    .on(updateRenderComponent, (state, component) => {
        const obj = state.components?.find((c) => c.id === component.id);
        const components = obj
            ? state.components?.map((c) =>
                  c.id === component.id ? component : { ...c }
              )
            : [...(state.components ?? []), component];
        return {
            ...state,
            components,
        };
    })
    .on(deleteRenderComponent, (state, id) => ({
        ...state,
        components: state.components?.filter((c) => c.id !== id) ?? [],
    }));
