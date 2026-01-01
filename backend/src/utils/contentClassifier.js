import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';

// Set ffmpeg path from static bundle
if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

/**
 * Get video metadata and duration
 * @param {string} videoPath - Path to video file
 * @returns {Promise<Object>} - Video metadata
 */
export const getVideoMetadata = (videoPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        const duration = metadata.format.duration || 0;
        const bitrate = metadata.format.bit_rate || 0;
        const size = metadata.format.size || 0;

        resolve({
          duration, // seconds
          bitrate,
          size,
          format: metadata.format.format_name,
        });
      }
    });
  });
};

/**
 * Apply rule-based classification to video content
 * @param {Object} videoPath - Path to video file
 * @param {Object} frameAnalysis - Frame analysis data from frameAnalyzer
 * @returns {Promise<Object>} - Classification result
 */
export const classifyContent = async (videoPath, frameAnalysis) => {
  const reasons = [];
  let riskScore = 0;

  try {
    // Try to get metadata, but don't fail if ffprobe is unavailable
    let metadata = null;
    try {
      metadata = await getVideoMetadata(videoPath);
      console.log('Video metadata:', metadata);
    } catch (metadataErr) {
      console.warn('Could not get video metadata via ffprobe:', metadataErr.message);
      // Continue without metadata - we have frame analysis which is sufficient
      metadata = {
        duration: 0,
        bitrate: 0,
        size: 0,
        format: 'unknown',
      };
    }
    console.log('Frame analysis:', frameAnalysis);

    // Start with baseline score based on safe video characteristics
    // If a video has normal characteristics, it should get a positive base score
    riskScore = 20; // Base score (neutral)

    // Rule 1: Video Duration
    // Videos > 1 hour might be suspicious (could indicate spam/bulk content)
    if (metadata.duration > 3600) {
      reasons.push('Very long video (>1 hour)');
      riskScore += 15;
    } else if (metadata.duration > 0) {
      // Reasonable duration = reduce risk
      riskScore -= 10;
    }

    // Rule 2: Bitrate anomaly
    // Very low bitrate suggests poor quality or compression issues
    if (metadata.bitrate && metadata.bitrate < 500000) {
      reasons.push('Low bitrate (quality issues)');
      riskScore += 12;
    } else if (metadata.bitrate && metadata.bitrate > 500000) {
      // Good bitrate = reduce risk
      riskScore -= 5;
    }

    // Rule 3: Scene changes analysis
    if (frameAnalysis) {
      console.log('Analyzing frame data...');
      
      // Rule 3a: Too many rapid scene changes (might indicate flashing/strobe)
      if (frameAnalysis.sceneChangeRate > 0.5) {
        reasons.push('High scene change frequency (rapid cuts)');
        riskScore += 20;
      } else if (frameAnalysis.sceneChangeRate < 0.1) {
        // Minimal scene changes = reduce risk
        riskScore -= 5;
      }

      // Rule 3b: Dark content analysis
      if (frameAnalysis.avgDarkPercentage > 50) {
        reasons.push(`Excessive dark content (${frameAnalysis.avgDarkPercentage.toFixed(1)}%)`);
        riskScore += 15;
      } else if (frameAnalysis.avgDarkPercentage > 40) {
        reasons.push(`High dark content (${frameAnalysis.avgDarkPercentage.toFixed(1)}%)`);
        riskScore += 10;
      } else if (frameAnalysis.avgDarkPercentage < 30) {
        // Low dark content = reduce risk
        riskScore -= 5;
      }

      // Rule 3c: Red content analysis (violence, blood)
      if (frameAnalysis.avgRedPercentage > 20) {
        reasons.push(`High red content detected (${frameAnalysis.avgRedPercentage.toFixed(1)}% - potential violence)`);
        riskScore += 25;
      } else if (frameAnalysis.avgRedPercentage > 10) {
        reasons.push(`Elevated red content (${frameAnalysis.avgRedPercentage.toFixed(1)}%)`);
        riskScore += 15;
      } else if (frameAnalysis.avgRedPercentage < 5) {
        // Low red content = reduce risk
        riskScore -= 5;
      }

      // Rule 3d: Frames with extreme characteristics
      if (frameAnalysis.highDarkPercentage > 60) {
        reasons.push(`Many frames with extreme darkness (${frameAnalysis.highDarkPercentage.toFixed(1)}%)`);
        riskScore += 12;
      }

      if (frameAnalysis.highRedPercentage > 40) {
        reasons.push(`Many frames with high red content (${frameAnalysis.highRedPercentage.toFixed(1)}%)`);
        riskScore += 18;
      }

      // Rule 3e: Brightness extremes
      if (frameAnalysis.avgBrightness < 50) {
        reasons.push(`Extremely dark video (avg brightness: ${frameAnalysis.avgBrightness.toFixed(1)})`);
        riskScore += 12;
      } else if (frameAnalysis.avgBrightness < 80) {
        reasons.push(`Overall very dark video (avg brightness: ${frameAnalysis.avgBrightness.toFixed(1)})`);
        riskScore += 8;
      } else if (frameAnalysis.avgBrightness > 200) {
        reasons.push(`Extremely bright video (avg brightness: ${frameAnalysis.avgBrightness.toFixed(1)})`);
        riskScore += 8;
      } else {
        // Normal brightness range
        riskScore -= 3;
      }
    } else {
      // Frame analysis failed - reduce trust but don't mark as dangerous
      console.warn('Frame analysis returned null');
      riskScore = 15; // Reset to lower baseline
    }

    // Rule 4: File metadata check
    // Suspicious file names or metadata
    const suspiciousPatterns = /promo|click|watch|subscribe|viral|trending/i;
    if (suspiciousPatterns.test(videoPath)) {
      reasons.push('Suspicious file naming');
      riskScore += 10;
    }

    // Normalize risk score to 0-100
    riskScore = Math.min(100, Math.max(0, Math.round(riskScore)));

    // Determine classification
    let classification = 'safe';
    if (riskScore > 75) {
      classification = 'flagged';
    } else if (riskScore > 50) {
      classification = 'warning';
    }

    if (reasons.length === 0) {
      reasons.push('Video passed all safety checks');
    }

    console.log(`Classification complete: ${classification} (score: ${riskScore})`);

    return {
      classification,
      score: 100-riskScore,
      reasons,
      metadata: {
        duration: metadata.duration,
        bitrate: metadata.bitrate,
        size: metadata.size,
      },
      frameAnalysis: frameAnalysis || null,
    };
  } catch (err) {
    console.error('Classification error:', err);
    return {
      classification: 'safe',
      score: 0,
      reasons: ['Unable to perform full analysis - defaulting to safe'],
      metadata: null,
      frameAnalysis: null,
    };
  }
};

export default { getVideoMetadata, classifyContent };
