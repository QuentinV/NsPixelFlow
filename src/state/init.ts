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
        const canvas = rendererManager
            .getRootElement()
            ?.querySelector('canvas');

        if (!canvas) {
            console.error('Canvas not found in renderer root element');
            return;
        }

        console.log('canvas', canvas, fps);
        const videoStream = canvas.captureStream(fps);

        const stream = new MediaStream();
        stream.addTrack(videoStream.getVideoTracks()[0]);

        // Add audio tracks to the stream
        const audioContext = audioManager.getListener()?.context;
        if (audioContext) {
            const audioDestination =
                audioContext.createMediaStreamDestination();
            const source = audioContext.createBufferSource();
            source.buffer = audioManager.audio?.buffer!; // Set the decoded buffer
            source.connect(audioDestination); // Connect to destination
            source.connect(audioContext.destination); // Connect to speakers for local playback
            source.start();

            audioDestination.stream.getAudioTracks().forEach((track) => {
                stream.addTrack(track);
            });
            if (!duration) {
                duration = audioManager.settings.duration;
            }
        }

        console.log(stream);

        /*const recorder = new MediaRecorder(stream, {
            mimeType: 'video/mp4', //; codecs=vp9',
        });*/
        let recorder = new RecordRTCPromisesHandler(stream, {
            type: 'video',
            mimeType: 'video/webm;codecs=vp9',
        });

        /*const recordedChunks: Blob[] = [];
        recorder.ondataavailable = (event) => {
            console.log('record datqsdqsda', event);
            if (event.data.size > 0) {
                console.log('record data');
                recordedChunks.push(event.data);
            }
        };

        recorder.onerror = (event) => console.log('error', event);

        recorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'video/mp4' });
            const url = URL.createObjectURL(blob);

            // auto download the video
            const a = document.createElement('a');
            a.href = url;
            a.download = 'recorded-video.mp4';
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(url);
        };

        console.log('Starting recording duration = ', duration);
        recorder.start();*/
        recorder.startRecording();

        const sleep = (s: number) => new Promise((r) => setTimeout(r, s));
        await sleep((duration ?? 0) * 1000);

        console.log('Stopping recording');
        await recorder.stopRecording();

        let blob = await recorder.getBlob();
        invokeSaveAsDialog(blob);
    }
);
