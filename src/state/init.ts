import { createEffect, sample, attach } from 'effector';
import { $audio, AudioManager, audioManager } from './audio';
import {
    Audio,
    BaseProject,
    Project,
    RenderSettings,
    updateProject,
} from '../api/projects';
import { $project } from './projects';
import { rendererManager, WebGLRenderer } from '../components/Renderer/webgl';
import { $render } from './render';
import { invokeSaveAsDialog, RecordRTCPromisesHandler } from 'recordrtc';
import { BPMManager } from './bpm';

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

export const recordFx = attach({
    source: {
        $project,
    },
    mapParams: (params: { duration?: number; fps?: number }, { $project }) => ({
        ...params,
        project: $project ?? undefined,
    }),
    effect: createEffect(
        async ({
            project,
            duration,
        }: {
            duration?: number;
            project?: Project;
        }): Promise<void> => {
            const progressElem = document.getElementById('recordProgress')!;
            const progressStatusElem = document.getElementById(
                'recordProgressStatus'
            )!;
            const recordProgressTimeElem =
                document.getElementById('recordProgressTime')!;

            progressStatusElem.innerText = 'Initialize recording';
            progressElem.style.display = 'flex';

            if (
                !project ||
                !project.settings?.render ||
                !project.settings?.audio
            ) {
                console.error('Project or settings are not defined');
                return;
            }

            const renderSettings = project.settings.render;
            const audioSettings = project.settings.audio[0];

            // instantiate managers
            const bpmManager = new BPMManager();
            const audioManager = new AudioManager({ bpmManager });
            const renderer = new WebGLRenderer({ audioManager });

            // Create canvas
            const width = renderSettings.width ?? 1024;
            const height = renderSettings.height ?? 768;
            progressStatusElem.innerText = 'Initialize canvas';
            const canvasContainer = document.createElement('div');
            canvasContainer.style.width = width + 'px';
            canvasContainer.style.height = height + 'px';
            canvasContainer.style.position = 'absolute';
            canvasContainer.style.right = -width + 10 + 'px';
            canvasContainer.style.bottom = -height + 10 + 'px';
            document.body.appendChild(canvasContainer);

            // video stream
            await audioManager.load(audioSettings);

            progressStatusElem.innerText = 'Initialize video stream';
            renderer.init(canvasContainer);
            renderer.updateState(renderSettings);

            const canvas = canvasContainer.querySelector('canvas')!;
            const videoStream = canvas.captureStream(renderSettings.fps ?? 30);

            const stream = new MediaStream();
            stream.addTrack(videoStream.getVideoTracks()[0]);

            // Add audio tracks to the stream
            progressStatusElem.innerText = 'Routing audio buffer into stream';

            const audioBuffer = audioManager.getClonedBuffer();
            if (audioBuffer) {
                const audioCtx = new AudioContext();
                const audioDestination =
                    audioCtx.createMediaStreamDestination();

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
                    duration = Math.ceil(decodedData.duration);
                }

                audioDestination.stream.getAudioTracks().forEach((track) => {
                    stream.addTrack(track);
                });
            }

            // Recorder setup
            progressStatusElem.innerText = 'Initialize recorder';
            const recorder = new RecordRTCPromisesHandler(stream, {
                type: 'video',
                mimeType: 'video/webm;codecs=vp9',
            });

            await audioManager.play();
            renderer.play();

            recorder.startRecording();
            progressStatusElem.innerText = 'Recording in progress please wait';

            // Sleep and update progress time
            const sleep = (s: number) => new Promise((r) => setTimeout(r, s));
            let time = 0;
            const interval = setInterval(() => {
                time += 1;
                recordProgressTimeElem.innerText = (duration ?? 0) - time + 's';
            }, 1000);
            await sleep((duration ?? 0) * 1000);
            clearInterval(interval);

            await recorder.stopRecording();
            canvasContainer.remove();
            audioManager.pause();

            progressStatusElem.innerText = 'Recording completed';

            let blob = await recorder.getBlob();
            invokeSaveAsDialog(blob);

            progressElem.style.display = 'none';
        }
    ),
});
