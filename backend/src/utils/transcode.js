import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import fs from 'fs';
import path from 'path';

if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

/**
 * Transcode input video to MP4 (H.264 + AAC)
 * @param {string} inputPath
 * @param {string} outputPath
 * @param {{onProgress?: function}} options
 * @returns {Promise<void>}
 */
export const transcodeToMp4 = (inputPath, outputPath, options = {}) => {
  const { onProgress } = options;

  return new Promise((resolve, reject) => {
    // Ensure output directory exists
    const outDir = path.dirname(outputPath);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    ffmpeg(inputPath)
      .outputOptions(['-c:v libx264', '-preset veryfast', '-crf 23', '-c:a aac', '-movflags +faststart'])
      .on('progress', (progress) => {
        if (onProgress) onProgress(progress);
      })
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .save(outputPath);
  });
};

export default { transcodeToMp4 };
