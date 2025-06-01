import { createEffect, sample } from 'effector';
import { $audio, audioManager } from './audio';
import {
    Audio,
    BaseProject,
    Project,
    RenderSettings,
    updateProject,
} from '../api/projects';
import { $project } from './projects';
import { rendererManager } from '../components/Renderer/webgl';
import { $render } from './render';
import { invokeSaveAsDialog, RecordRTCPromisesHandler } from 'recordrtc';

interface SaveEffectParams {
    $audio: Audio | null;
    $render: RenderSettings;
    $project: BaseProject | null;
}

sample({
    source: { $audio, $project, $render },
    target: createEffect(
        async ({ $audio, $project, $render }: SaveEffectParams) => {
            if (!$project || !$audio) return;
            const project: Project = {
                ...$project,
                settings: {
                    audio: [$audio],
                    render: $render,
                },
            };
            console.log('Saving project', project);

            await updateProject(project);
        }
    ),
});

export const playFx = createEffect(async () => {
    await audioManager.play();
    rendererManager.play();
    /*
    const update = ({ audioManager, instances }) => {
        requestAnimationFrame(() => update({ audioManager, instances }))
        audioManager.update()
        instances.forEach( i => i.update());
    }*/
});

export const pauseFx = createEffect(async () => {
    audioManager.pause();
    rendererManager.pause();
});

export const recordFx = createEffect(
    async ({
        duration,
        fps = 30,
    }: {
        duration?: number;
        fps?: number;
    }): Promise<void> => {
        const progressElem = document.getElementById('recordProgress')!;
        const progressStatusElem = document.getElementById(
            'recordProgressStatus'
        )!;

        progressStatusElem.innerText = 'Initialize recording';
        progressElem.style.display = 'flex';

        const canvas = rendererManager
            .getRootElement()
            ?.querySelector('canvas');

        if (!canvas) {
            console.error('Canvas not found in renderer root element');
            return;
        }

        progressStatusElem.innerText = 'Initialize canvas capture';
        const videoStream = canvas.captureStream(fps);

        const stream = new MediaStream();
        stream.addTrack(videoStream.getVideoTracks()[0]);

        // Add audio tracks to the stream
        progressStatusElem.innerText = 'Loading audio buffer';
        const audioBuffer = audioManager.getClonedBuffer();
        if (audioBuffer) {
            const audioCtx = new AudioContext();
            const audioDestination = audioCtx.createMediaStreamDestination();

            const decodedData: AudioBuffer = await new Promise((res) => {
                audioCtx.decodeAudioData(audioBuffer, (decodedData) => {
                    const source = audioCtx.createBufferSource();
                    source.buffer = decodedData;
                    source.connect(audioDestination);
                    source.start();
                    res(decodedData);
                });
            });

            if (!duration) {
                duration = decodedData.duration;
            }

            audioDestination.stream.getAudioTracks().forEach((track) => {
                stream.addTrack(track);
            });
        }

        const recorder = new RecordRTCPromisesHandler(stream, {
            type: 'video',
            mimeType: 'video/webm;codecs=vp9',
        });

        recorder.startRecording();
        progressStatusElem.innerText = 'Recording in progress please wait';

        const sleep = (s: number) => new Promise((r) => setTimeout(r, s));
        await sleep((duration ?? 0) * 1000);

        await recorder.stopRecording();

        progressStatusElem.innerText = 'Recording completed';

        let blob = await recorder.getBlob();
        invokeSaveAsDialog(blob);

        progressElem.style.display = 'none';
    }
);
