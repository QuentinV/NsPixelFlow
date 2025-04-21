import { attach, createEffect, createEvent, sample } from 'effector';
import { $audio, audioManager } from './audio';
import { Audio, BaseProject, Project, updateProject } from '../api/projects';
import { $project } from './projects';
import { rendererManager } from '../components/Renderer/webgl';

interface SaveEffectParams {
    $audio: Audio | null;
    $project: BaseProject | null;
}

sample({
    source: { $audio, $project },
    target: createEffect(async ({ $audio, $project }: SaveEffectParams) => {
        if (!$project || !$audio) return;
        const project: Project = {
            ...$project,
            settings: {
                audio: [$audio],
                view: { width: 512, height: 512 },
                render: [],
            },
        };
        console.log('Saving project', project);

        await updateProject(project);
    }),
});

export const playFx = createEffect(async () => {
    audioManager.play();

    /*
    const update = ({ audioManager, instances }) => {
        requestAnimationFrame(() => update({ audioManager, instances }))
        audioManager.update()
        instances.forEach( i => i.update());
    }*/
});

export const pauseFx = createEffect(async () => {
    audioManager.pause();
});

export const recordFx = createEffect(
    async ({ duration, fps = 30 }: { duration: number; fps: number }) => {
        const canvas = rendererManager
            .getRootElement()
            ?.querySelector('canvas');

        if (!canvas) {
            console.error('Canvas not found in renderer root element');
            return;
        }

        const stream = canvas.captureStream(fps);

        // Add audio tracks to the stream
        const audioContext = audioManager.getListener()?.context;
        if (audioContext) {
            audioContext
                .createMediaStreamDestination()
                .stream.getAudioTracks()
                .forEach((track) => {
                    stream.addTrack(track);
                });
        }

        const recorder = new MediaRecorder(stream, {
            mimeType: 'video/webm; codecs=vp9',
        });

        const recordedChunks: Blob[] = [];
        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        recorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);

            // auto download the video
            const a = document.createElement('a');
            a.href = url;
            a.download = 'recorded-video.webm';
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(url);
        };

        console.log('Starting recording');
        recorder.start();

        setTimeout(() => {
            console.log('Stopping recording');
            recorder.stop();
        }, duration * 1000);
    }
);
