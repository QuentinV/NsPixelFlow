const recordVideo = () => {
    console.log('record video called');

    const canvas = document.querySelector('canvas');

    const stream = canvas.captureStream(30); // 30 FPS
    const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm; codecs=vp9'
    });

    const recordedChunks = [];

    recorder.ondataavailable = event => {
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
    }, 1 * 60 * 1000);
}

document.querySelector('#recordBtn').addEventListener('click', () => {
    recordVideo();
});