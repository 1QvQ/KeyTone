export interface AcousticAnalysisResult {
  dominantFreq: number;
  profile: string;
}

// These thresholds can be updated easily in the future
export const ACOUSTIC_THRESHOLDS = {
  THOCKY_MAX: 350, // Below this is Thocky
  CREAMY_MAX: 700, // Between 350 and 700 is Creamy/Balanced
  // Above 700 is considered Clacky/Poppy
};

export async function analyzeAudioFile(file: File): Promise<AcousticAnalysisResult | null> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // We use a regular AudioContext but do not connect it to the destination (speakers).
    // This allows us to silently process the audio.
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) {
      console.warn("Web Audio API not supported in this browser.");
      return null;
    }
    
    const ctx = new AudioCtx();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    
    // 1. Find the first amplitude peak to avoid analyzing lead-in silence
    const channelData = audioBuffer.getChannelData(0);
    let peakIndex = 0;
    const silenceThreshold = 0.05; // 5% volume threshold to detect keypress
    for (let i = 0; i < channelData.length; i++) {
      if (Math.abs(channelData[i]) > silenceThreshold) {
        peakIndex = i;
        break;
      }
    }
    const peakTime = peakIndex / audioBuffer.sampleRate;
    
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    
    const analyser = ctx.createAnalyser();
    // Use a large FFT size for better frequency resolution
    analyser.fftSize = 4096;
    
    source.connect(analyser);
    // Note: Do NOT connect analyser to ctx.destination!
    
    // Start playback exactly at the peak time instead of 0
    source.start(0, peakTime);
    
    // Wait for 150ms to capture the initial keystroke impact (the bottom-out sound)
    await new Promise((resolve) => setTimeout(resolve, 150));
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);
    
    source.stop();
    await ctx.close();
    
    // Calculate Spectral Centroid (Weighted Average Frequency)
    let totalAmplitude = 0;
    let weightedSum = 0;
    const sampleRate = ctx.sampleRate;
    
    for (let i = 0; i < bufferLength; i++) {
      // Nyquist frequency is sampleRate / 2
      const freq = (i * (sampleRate / 2)) / bufferLength;
      const amplitude = dataArray[i];
      
      // Filter out extreme lows (rumble) and extreme highs (hiss) to focus on the key switch sound
      if (freq > 50 && freq < 10000 && amplitude > 0) {
        weightedSum += freq * amplitude;
        totalAmplitude += amplitude;
      }
    }
    
    if (totalAmplitude === 0) return null;
    
    const dominantFreq = Math.round(weightedSum / totalAmplitude);
    
    let profile = 'UNKNOWN';
    if (dominantFreq <= ACOUSTIC_THRESHOLDS.THOCKY_MAX) {
      profile = 'THOCKY';
    } else if (dominantFreq <= ACOUSTIC_THRESHOLDS.CREAMY_MAX) {
      profile = 'CREAMY';
    } else {
      profile = 'CLACKY';
    }
    
    return { dominantFreq, profile };
  } catch (error) {
    console.error("Audio analysis failed:", error);
    return null;
  }
}
