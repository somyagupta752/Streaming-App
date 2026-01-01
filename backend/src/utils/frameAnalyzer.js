import sharp from 'sharp';

/**
 * Analyze a single frame for dark and red pixels using sharp
 * @param {string} framePath - Path to frame image
 * @returns {Promise<Object>} - Frame analysis data
 */
export const analyzeFrame = async (framePath) => {
  try {
    console.log('Analyzing frame:', framePath);
    const metadata = await sharp(framePath).metadata();
    const { width, height, channels, space } = metadata;
    
    console.log(`Frame metadata: ${width}x${height}, channels: ${channels}, space: ${space}`);
    
    // Convert to RGB if needed and get raw data
    let image = sharp(framePath);
    
    // Ensure RGB or RGBA
    if (space !== 'srgb') {
      image = image.toColorspace('srgb');
    }
    
    const rawData = await image
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    const data = rawData.data;
    const pixelSize = rawData.info.channels; // Should be 4 (RGBA)
    
    let darkPixels = 0;
    let redPixels = 0;
    let redIntensity = 0;
    let brightnessSum = 0;
    let processedPixels = 0;

    // Analyze every pixel
    for (let i = 0; i < data.length; i += pixelSize) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      if (a === 0) continue; // Skip fully transparent pixels

      // Calculate brightness (luminance)
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      brightnessSum += brightness;
      processedPixels++;

      // Count dark pixels (brightness < 50)
      if (brightness < 50) {
        darkPixels++;
      }

      // Count red-dominant pixels (R > 150 and R > G+30 and R > B+30)
      if (r > 150 && r > g + 30 && r > b + 30) {
        redPixels++;
        redIntensity += r - Math.max(g, b);
      }
    }

    if (processedPixels === 0) {
      console.warn('No pixels processed in frame');
      return null;
    }

    const darkPercentage = (darkPixels / processedPixels) * 100;
    const redPercentage = (redPixels / processedPixels) * 100;
    const avgBrightness = brightnessSum / processedPixels;
    const avgRedIntensity = redPixels > 0 ? redIntensity / redPixels : 0;

    const result = {
      darkPercentage: parseFloat(darkPercentage.toFixed(2)),
      redPercentage: parseFloat(redPercentage.toFixed(2)),
      avgBrightness: parseFloat(avgBrightness.toFixed(2)),
      avgRedIntensity: parseFloat(avgRedIntensity.toFixed(2)),
      totalPixels: processedPixels,
      width,
      height,
      hasHighDarkContent: darkPercentage > 40,
      hasHighRedContent: redPercentage > 15,
    };

    console.log('Frame analysis result:', result);
    return result;
  } catch (err) {
    console.error('Frame analysis error:', err.message || err);
    return null;
  }
};

/**
 * Analyze multiple frames for patterns
 * @param {string[]} framePaths - Array of frame paths
 * @returns {Promise<Object>} - Analysis summary
 */
export const analyzeFrames = async (framePaths) => {
  const analyses = [];
  let sceneChanges = 0;

  for (let i = 0; i < framePaths.length; i++) {
    const analysis = await analyzeFrame(framePaths[i]);
    if (analysis) {
      analyses.push(analysis);

      // Detect scene changes (large brightness changes)
      if (i > 0 && analyses.length > 1) {
        const prevAnalysis = analyses[i - 1];
        const brightnessDiff = Math.abs(
          analysis.avgBrightness - prevAnalysis.avgBrightness
        );
        if (brightnessDiff > 100) {
          sceneChanges++;
        }
      }
    }
  }

  if (analyses.length === 0) {
    return null;
  }

  // Calculate averages
  const avgDarkPercentage =
    analyses.reduce((sum, a) => sum + a.darkPercentage, 0) / analyses.length;
  const avgRedPercentage =
    analyses.reduce((sum, a) => sum + a.redPercentage, 0) / analyses.length;
  const avgBrightness =
    analyses.reduce((sum, a) => sum + a.avgBrightness, 0) / analyses.length;

  // Count frames with high dark/red content
  const framesWithHighDark = analyses.filter(a => a.hasHighDarkContent).length;
  const framesWithHighRed = analyses.filter(a => a.hasHighRedContent).length;
  const highDarkPercentage = (framesWithHighDark / analyses.length) * 100;
  const highRedPercentage = (framesWithHighRed / analyses.length) * 100;

  return {
    totalFrames: analyses.length,
    sceneChanges,
    sceneChangeRate: sceneChanges / analyses.length,
    avgDarkPercentage,
    avgRedPercentage,
    avgBrightness,
    framesWithHighDark,
    framesWithHighRed,
    highDarkPercentage,
    highRedPercentage,
  };
};

export default { analyzeFrame, analyzeFrames };
