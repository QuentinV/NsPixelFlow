import { createEvent, createStore } from 'effector';
import { MeshEffect, RenderComponent, RenderSettings } from '../api/projects';
import { loadProjectFromStorageFx } from './projects';

export const $render = createStore<RenderSettings>({});
export const updateRenderSettings = createEvent<RenderSettings>();
export const updateRenderComponent = createEvent<RenderComponent>();
export const deleteRenderComponent = createEvent<string>();
export const updateMeshEffect = createEvent<{
    componentIndex: number;
    effect: MeshEffect;
}>();
export const deleteMeshEffect = createEvent<number>(); // component index

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
    }))
    .on(updateMeshEffect, (state, obj) => ({
        ...state,
        components: state.components?.map((c, i) => {
            if (i === obj.componentIndex) {
                c.effects = [obj.effect];
            }
            return c;
        }),
    }))
    .on(deleteMeshEffect, (state, index) => ({
        ...state,
        components:
            state.components?.map((c, i) => {
                if (i === index) delete c.effects;
                return c;
            }) ?? [],
    }));
