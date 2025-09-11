import { pipeline } from '@xenova/transformers';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import fs from 'fs';
import wav from 'node-wav'; // Import the new library

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

let classifier;
try {
    console.log('Loading emotion detection model...');
    classifier = await pipeline('audio-classification', 'Xenova/wav2vec2-base-superb-ks');
    console.log('Emotion detection model loaded successfully.');
} catch (e) {
    console.error("Failed to load emotion model.", e);
}

function convertAudio(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .audioCodec('pcm_s16le').audioChannels(1).audioFrequency(16000)
            .toFormat('wav')
            .on('end', () => resolve())
            .on('error', (err) => reject(new Error(`FFMPEG conversion error: ${err.message}`)))
            .save(outputPath);
    });
}

export async function detectEmotion(audioFilePath) {
    if (!classifier) {
        console.warn("Emotion classifier is not available.");
        return 'unknown';
    }

    const convertedPath = `${audioFilePath}.wav`;

    try {
        // Convert the uploaded audio to the required WAV format
        await convertAudio(audioFilePath, convertedPath);

        // Read the converted WAV file into a buffer
        const wavBuffer = fs.readFileSync(convertedPath);

        // Decode the WAV buffer using node-wav
        const decoded = wav.decode(wavBuffer);

        // The decoded audio data is a Float32Array, which is exactly what the model needs
        const audioData = decoded.channelData[0];

        // Pass the raw audio data directly to the classifier
        const result = await classifier(audioData);

        const primaryEmotion = result.reduce((prev, current) => (prev.score > current.score) ? prev : current);
        return primaryEmotion.label;

    } catch (error) {
        console.error('Error detecting emotion:', error);
        return 'unknown';
    } finally {
        // Clean up both temporary files
        if (fs.existsSync(audioFilePath)) fs.unlinkSync(audioFilePath);
        if (fs.existsSync(convertedPath)) fs.unlinkSync(convertedPath);
    }
}   