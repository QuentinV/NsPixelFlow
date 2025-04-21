import { createEffect, sample } from 'effector';
import { $audio } from './audio';
import { Audio, BaseProject, Project, updateProject } from '../api/projects';
import { $project } from './projects';

interface SaveEffectParams {
    $audio: Audio | null;
    $project: BaseProject | null;
}

sample({
    source: { $audio, $project },
    target: createEffect(async ({ $audio, $project }: SaveEffectParams) => {
        if (!$project || !$audio) return;
        console.log('Saving project with audio:', $audio, $project);
        const project: Project = {
            ...$project,
            settings: {
                audio: [$audio],
                view: { width: 512, height: 512 },
                render: [],
            },
        };

        await updateProject(project);
    }),
});
