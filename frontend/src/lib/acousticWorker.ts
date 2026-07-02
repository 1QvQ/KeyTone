// Web Worker for Acoustic Analysis calculations
// By running this in a separate thread, we ensure complex math doesn't block the UI thread

self.addEventListener('message', (e: MessageEvent) => {
  const { dataArray, sampleRate, bufferLength, thresholds } = e.data;

  let totalAmplitude = 0;
  let weightedSum = 0;

  for (let i = 0; i < bufferLength; i++) {
    // Nyquist frequency is sampleRate / 2
    const freq = (i * (sampleRate / 2)) / bufferLength;
    const amplitude = dataArray[i];
    
    // Filter out extreme lows (rumble) and extreme highs (hiss)
    if (freq > 50 && freq < 10000 && amplitude > 0) {
      weightedSum += freq * amplitude;
      totalAmplitude += amplitude;
    }
  }

  if (totalAmplitude === 0) {
    self.postMessage({ error: 'No audio data detected' });
    return;
  }

  const dominantFreq = Math.round(weightedSum / totalAmplitude);
  
  let profile = 'UNKNOWN';
  if (dominantFreq <= thresholds.THOCKY_MAX) {
    profile = 'THOCKY';
  } else if (dominantFreq <= thresholds.CREAMY_MAX) {
    profile = 'CREAMY';
  } else {
    profile = 'CLACKY';
  }

  // Send the result back to the main thread
  self.postMessage({ dominantFreq, profile });
});
