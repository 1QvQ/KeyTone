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
    
    // Offload the heavy mathematical calculation to a separate Web Worker thread
    // This prevents the massive array iteration from blocking the main UI thread
    return new Promise((resolve) => {
      const worker = new Worker(new URL('./acousticWorker.ts', import.meta.url));
      
      worker.onmessage = (e) => {
        worker.terminate(); // Clean up worker after it finishes
        if (e.data.error) {
          resolve(null);
        } else {
          resolve({ dominantFreq: e.data.dominantFreq, profile: e.data.profile });
        }
      };
      
      worker.onerror = (err) => {
        console.error("Web Worker error:", err);
        worker.terminate();
        resolve(null);
      };

      // Send the massive frequency array to the background thread
      worker.postMessage({
        dataArray,
        sampleRate: ctx.sampleRate,
        bufferLength,
        thresholds: ACOUSTIC_THRESHOLDS
      });
    });
  } catch (error) {
    console.error("Audio analysis failed:", error);
    return null;
  }
}
