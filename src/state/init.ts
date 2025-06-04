import { createEffect, sample, attach } from 'effector';
import { $audio, AudioManager, audioManager } from './audio';
import {
    Audio,
    BaseProject,
    FFmpegEncoderSettings,
    Project,
    RenderSettings,
    updateProject,
} from '../api/projects';
import { $project } from './projects';
import { rendererManager, WebGLRenderer } from '../components/Renderer/webgl';
import { $render } from './render';
import { invokeSaveAsDialog, RecordRTCPromisesHandler } from 'recordrtc';
import { BPMManager } from './bpm';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

const sleep = (s: number) => new Promise((r) => setTimeout(r, s));

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

interface RecordParams {
    updateStatus: (text: string) => void;
    renderSettings: RenderSettings;
    audioSettings: Audio;
    duration?: number;
    encoderSettings?: any;
}

type RecordType = 'mediaRecorder' | 'ffmpeg';

const instantiateManagers = async ({
    audioSettings,
}: {
    audioSettings: Audio;
}) => {
    const bpmManager = new BPMManager();
    const audioManager = new AudioManager({ bpmManager });
    const renderer = new WebGLRenderer({ audioManager });

    await audioManager.load(audioSettings);

    return { bpmManager, audioManager, renderer };
};

const appendRecordingCanvas = ({
    width,
    height,
    renderer,
}: {
    width?: number;
    height?: number;
    renderer: WebGLRenderer;
}) => {
    const w = width ?? 1024;
    const h = height ?? 768;
    const canvasContainer = document.createElement('div');
    canvasContainer.style.width = width + 'px';
    canvasContainer.style.height = height + 'px';
    canvasContainer.style.position = 'absolute';
    canvasContainer.style.right = -w + 10 + 'px';
    canvasContainer.style.bottom = -h + 10 + 'px';
    document.body.appendChild(canvasContainer);

    renderer.init(canvasContainer);

    return {
        canvasContainer,
        canvas: canvasContainer.querySelector('canvas')!,
    };
};

const recordWithMediaRecorder = async ({
    updateStatus,
    renderSettings,
    audioSettings,
    duration,
    encoderSettings,
}: RecordParams) => {
    const { audioManager, renderer } = await instantiateManagers({
        audioSettings,
    });

    updateStatus('Initialize canvas');
    const { canvas, canvasContainer } = appendRecordingCanvas({
        width: renderSettings?.width,
        height: renderSettings?.height,
        renderer,
    });

    // video stream
    updateStatus('Initialize video stream');
    await renderer.updateState(renderSettings);

    const videoStream = canvas.captureStream(encoderSettings?.fps ?? 30);

    const stream = new MediaStream();
    stream.addTrack(videoStream.getVideoTracks()[0]);

    // Add audio tracks to the stream
    updateStatus('Routing audio buffer into stream');

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
            duration = Math.ceil(decodedData.duration);
        }

        audioDestination.stream.getAudioTracks().forEach((track) => {
            stream.addTrack(track);
        });
    }

    // Recorder setup
    updateStatus('Initialize recorder');
    const recorder = new RecordRTCPromisesHandler(stream, {
        type: 'video',
        mimeType: 'video/webm;codecs=vp9',
    });

    await audioManager.play();
    renderer.play();

    recorder.startRecording();
    updateStatus('Recording in progress please wait');

    // Sleep and update progress time
    let time = 0;
    const interval = setInterval(() => {
        time += 1;
        updateStatus(`Progress: ${(duration ?? 0) - time + 's'}`);
    }, 1000);
    await sleep((duration ?? 0) * 1000);
    clearInterval(interval);

    await recorder.stopRecording();
    canvasContainer.remove();
    audioManager.pause();

    updateStatus('Recording completed');

    let blob = await recorder.getBlob();
    invokeSaveAsDialog(blob);
};

const recordWithFfmpeg = async ({
    updateStatus,
    renderSettings,
    audioSettings,
    duration,
    encoderSettings,
}: RecordParams) => {
    const es = (encoderSettings ?? {}) as FFmpegEncoderSettings;

    const { renderer, audioManager } = await instantiateManagers({
        audioSettings,
    });

    updateStatus('Initialize canvas');
    appendRecordingCanvas({
        width: renderSettings?.width,
        height: renderSettings?.height,
        renderer,
    });

    updateStatus('Setup renderer');
    await renderer.updateState(renderSettings);

    renderer.play();
    audioManager.play();

    await sleep(2000);

    // Capture video from canvas faster than real time frame by frame
    updateStatus('Record canvas frames');
    const frames = await renderer.record(5);

    renderer.pause();
    audioManager.pause();

    updateStatus('Initialize ffmeg encoder');
    const ffmpeg = new FFmpeg();
    ffmpeg.on('log', ({ message }) => {
        console.log('[FFMPEG] ', message);
    });

    const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.10/dist/esm';
    try {
        await ffmpeg.load({
            coreURL: await toBlobURL(
                `${baseURL}/ffmpeg-core.js`,
                'text/javascript'
            ),
            wasmURL: await toBlobURL(
                `${baseURL}/ffmpeg-core.wasm`,
                'application/wasm'
            ),
            workerURL: await toBlobURL(
                `${baseURL}/ffmpeg-core.worker.js`,
                'text/javascript'
            ),
        });
    } catch (e) {
        throw e;
    }

    updateStatus('Write frames');
    for (let i = 0; i < frames.length; i++) {
        await ffmpeg.writeFile(`frame${i}.png`, await fetchFile(frames[i]));
    }

    await ffmpeg.writeFile(
        'audio.mp3',
        new Uint8Array(audioManager.getClonedBuffer()!)
    );

    updateStatus('Encode video');
    await ffmpeg.exec([
        '-framerate',
        '30',
        '-i',
        'frame%d.png',
        '-c:v',
        'libx264',
        '-preset',
        'ultrafast',
        'video.mp4',
    ]);

    await ffmpeg.exec([
        '-i',
        'video.mp4',
        '-i',
        'audio.mp3',
        '-c:v',
        'copy',
        '-c:a',
        'aac',
        '-shortest',
        'output.mp4',
    ]);

    const videoData = await ffmpeg.readFile('output.mp4');
    const videoBlob = new Blob([videoData as Uint8Array], {
        type: 'video/mp4',
    });

    updateStatus('Recording completed');

    invokeSaveAsDialog(videoBlob);
    //return URL.createObjectURL(videoBlob);
};

export const recordFx = attach({
    source: {
        $project,
    },
    mapParams: (
        params: {
            duration?: number;
            fps?: number;
            recordType: RecordType;
        },
        { $project }
    ) => ({
        ...params,
        project: $project ?? undefined,
    }),
    effect: createEffect(
        async ({
            project,
            duration,
            recordType,
        }: {
            duration?: number;
            project?: Project;
            recordType: RecordType;
        }): Promise<void> => {
            const progressElem = document.getElementById('recordProgress')!;
            const progressStatusElem = document.getElementById(
                'recordProgressStatus'
            )!;

            progressStatusElem.innerText = 'Initialize recording';
            progressElem.style.display = 'flex';

            const updateStatus = (text: string) => {
                progressStatusElem.innerText = text;
            };

            try {
                const renderSettings = project?.settings?.render;
                const audioSettings = project?.settings?.audio?.[0];

                if (!renderSettings || !audioSettings) {
                    throw Error('Missing project render or audio settings');
                }

                let record = undefined;
                switch (recordType) {
                    case 'mediaRecorder':
                        record = recordWithMediaRecorder;
                        break;
                    case 'ffmpeg':
                        record = recordWithFfmpeg;
                }
                await record?.({
                    audioSettings,
                    renderSettings,
                    updateStatus,
                    duration,
                    encoderSettings: project?.settings?.encoder?.[recordType],
                });

                progressElem.style.display = 'none';
            } catch (e) {
                console.error(e);
                updateStatus('An error occured with recording');
            }
        }
    ),
});
