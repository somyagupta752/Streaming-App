import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ffmpegStatic from 'ffmpeg-static';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Set ffmpeg path from static bundle
if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
  console.log('FFmpeg path set to:', ffmpegStatic);
}

/**
 * Extract frames from video at regular intervals
 * @param {string} videoPath - Path to video file
 * @param {number} interval - Interval in seconds between frames
 * @param {number} maxFrames - Maximum number of frames to extract
 * @returns {Promise<string[]>} - Array of paths to extracted frames
 */
export const extractFrames = (videoPath, interval = 2, maxFrames = 30) => {
  return new Promise((resolve, reject) => {
    console.log(`Starting frame extraction: ${videoPath} (interval: ${interval}s, max: ${maxFrames})`);
    
    const framesDir = path.join(__dirname, '../../temp_frames');
    
    // Create temp directory if it doesn't exist
    if (!fs.existsSync(framesDir)) {
      fs.mkdirSync(framesDir, { recursive: true });
    }

    const jobId = Date.now();
    const jobFramesDir = path.join(framesDir, jobId.toString());
    
    if (!fs.existsSync(jobFramesDir)) {
      fs.mkdirSync(jobFramesDir, { recursive: true });
    }

    const jobFramePattern = path.join(jobFramesDir, `frame_%04d.png`);

    try {
      ffmpeg(videoPath)
        .outputOptions([
          `-vf fps=1/${interval}`,
          '-vframes', maxFrames.toString(),
        ])
        .output(jobFramePattern)
        .on('start', (cmdline) => {
          console.log('FFmpeg command:', cmdline);
        })
        .on('end', () => {
          console.log('Frame extraction completed');
          // Get all extracted frames
          fs.readdir(jobFramesDir, (err, files) => {
            if (err) {
              console.error('Error reading frames directory:', err);
              reject(err);
            } else {
              const frames = files
                .filter(f => f.endsWith('.png'))
                .map(f => path.join(jobFramesDir, f))
                .sort();
              console.log(`Extracted ${frames.length} frames`);
              resolve(frames);
            }
          });
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          reject(err);
        })
        .run();
    } catch (err) {
      console.error('Frame extraction error:', err);
      reject(err);
    }
  });
};

/**
 * Clean up extracted frames
 * @param {string[]} framePaths - Array of frame paths to delete
 */
export const cleanupFrames = (framePaths) => {
  try {
    framePaths.forEach(framePath => {
      if (fs.existsSync(framePath)) {
        fs.unlinkSync(framePath);
      }
    });

    // Clean up parent directory if empty
    if (framePaths.length > 0) {
      const dir = path.dirname(framePaths[0]);
      try {
        fs.rmdirSync(dir);
      } catch (e) {
        // ignore if directory not empty
      }
    }
  } catch (err) {
    console.warn('Failed to cleanup frames:', err.message || err);
  }
};

export default { extractFrames, cleanupFrames };
