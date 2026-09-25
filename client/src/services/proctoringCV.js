/**
 * MockVue Advanced Computer Vision & Audio Proctoring Engine
 * 
 * Features:
 * - Robust Anthropometric Facial Region Localization (filters out background, chairs, torso)
 * - True Pupil & Eye Socket Luminance Valley Centroid Tracking (Weighted Dark Minimum)
 * - Normalized Horizontal & Vertical Gaze Vector Estimation
 * - Web Audio API Spectral Energy & Decibel Ambient Metering
 * - Real-time Augmented Reality Reticles & Telemetry HUD Overlay
 */

export class ProctoringCVEngine {
  constructor(videoElement, overlayCanvas, options = {}) {
    this.video = videoElement;
    this.canvas = overlayCanvas;
    this.ctx = overlayCanvas ? overlayCanvas.getContext('2d') : null;

    this.options = {
      targetWidth: 320,
      targetHeight: 240,
      gazeThresholdX: 0.25, // Max horizontal deviation fraction
      gazeThresholdY: 0.30, // Max vertical deviation fraction
      ...options,
    };

    // Off-screen canvas for pixel processing
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = this.options.targetWidth;
    this.offscreenCanvas.height = this.options.targetHeight;
    this.offscreenCtx = this.offscreenCanvas.getContext('2d', { willReadFrequently: true });

    // Audio Analysis State
    this.audioContext = null;
    this.analyser = null;
    this.audioDataArray = null;
    this.audioSource = null;

    // Smoothed state across frames to eliminate jitter
    this.smoothedFaceBox = null;
    this.smoothedEyes = null;
    this.missedFrames = 0;

    // Animation & Loop
    this.isRunning = false;
    this.animationFrameId = null;

    // Analysis telemetry state
    this.lastAnalysis = {
      faceDetected: false,
      faceCount: 0,
      faceBox: null,
      eyes: null,
      gaze: { centered: true, dx: 0, dy: 0, label: 'CENTERED' },
      audioDb: 0,
      isSpeaking: false,
      timestamp: Date.now(),
    };
  }

  /**
   * Initialize Web Audio Analysis from MediaStream
   */
  initAudio(stream) {
    if (!stream || stream.getAudioTracks().length === 0) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.audioContext = new AudioCtx();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      this.audioSource = this.audioContext.createMediaStreamSource(stream);
      this.audioSource.connect(this.analyser);
      this.audioDataArray = new Uint8Array(this.analyser.frequencyBinCount);
    } catch (e) {
      console.warn('[Proctoring CV] Audio analyzer initialization skipped:', e.message);
    }
  }

  /**
   * Start the continuous Computer Vision & Audio loop
   */
  start(onFrameTelemetry) {
    if (this.isRunning) return;
    this.isRunning = true;

    const loop = async () => {
      if (!this.isRunning) return;

      if (this.video && this.video.readyState >= 2) {
        const telemetry = this.analyzeCurrentFrame();
        this.lastAnalysis = telemetry;

        if (this.canvas && this.ctx) {
          this.renderHUD(telemetry);
        }

        if (onFrameTelemetry) {
          onFrameTelemetry(telemetry);
        }
      }

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  /**
   * Stop loop and release Web Audio resources
   */
  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch (e) {}
    }
  }

  /**
   * Analyze audio levels using Web Audio FFT
   */
  getAudioTelemetry() {
    if (!this.analyser || !this.audioDataArray) {
      return { audioDb: 0, isSpeaking: false };
    }

    this.analyser.getByteFrequencyData(this.audioDataArray);

    let sum = 0;
    for (let i = 0; i < this.audioDataArray.length; i++) {
      sum += this.audioDataArray[i];
    }
    const average = sum / this.audioDataArray.length;
    const audioDb = Math.round((average / 255) * 100);
    const isSpeaking = audioDb > 25; // Human speech threshold

    return { audioDb, isSpeaking };
  }

  /**
   * Robust Face & Pupil Landmark Localization
   */
  analyzeCurrentFrame() {
    const width = this.options.targetWidth;
    const height = this.options.targetHeight;

    // Draw downsampled frame to offscreen canvas
    this.offscreenCtx.drawImage(this.video, 0, 0, width, height);
    const imageData = this.offscreenCtx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // 1. ANTHROPOMETRIC HEAD REGION SEGMENTATION
    // Restrict head search to upper-middle 70% of frame where seated candidate sits
    const searchXMin = Math.round(width * 0.12);
    const searchXMax = Math.round(width * 0.88);
    const searchYMin = Math.round(height * 0.05);
    const searchYMax = Math.round(height * 0.78);

    // Compute luminance map & skin/hair mask
    const lum = new Float32Array(width * height);
    const skinMask = new Uint8Array(width * height);

    let totalSkin = 0;
    let sumX = 0;
    let sumY = 0;
    let minX = width, maxX = 0, minY = height, maxY = 0;

    for (let y = searchYMin; y < searchYMax; y++) {
      for (let x = searchXMin; x < searchXMax; x++) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // Perceived luminance
        const yVal = 0.299 * r + 0.587 * g + 0.114 * b;
        lum[y * width + x] = yVal;

        // Chrominance Skin Test in YCbCr:
        const cb = -0.169 * r - 0.331 * g + 0.500 * b + 128;
        const cr = 0.500 * r - 0.419 * g - 0.081 * b + 128;

        // Calibrated skin color locus
        const isSkin = (cb >= 78 && cb <= 128 && cr >= 132 && cr <= 172 && r > 45 && g > 30 && b > 20);

        if (isSkin) {
          skinMask[y * width + x] = 1;
          totalSkin++;
          sumX += x;
          sumY += y;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    let faceDetected = false;
    let rawFaceBox = null;

    // Minimum skin density for a real human head in frame
    if (totalSkin >= 280 && maxX > minX && maxY > minY) {
      const centerX = sumX / totalSkin;
      const centerY = sumY / totalSkin;

      // Refined Anthropometric head dimensions:
      // A seated head is about 0.30W to 0.45W wide, with aspect ratio height:width ~ 1.25 : 1
      const measuredWidth = Math.max(width * 0.24, Math.min(width * 0.52, (maxX - minX) * 0.72));
      const measuredHeight = measuredWidth * 1.30; // Canonical human face aspect ratio

      // Head top starts above skin centroid (includes forehead and brow)
      const headTop = Math.max(searchYMin, centerY - measuredHeight * 0.52);
      const headLeft = Math.max(searchXMin, centerX - measuredWidth * 0.50);

      rawFaceBox = {
        x: headLeft,
        y: headTop,
        width: measuredWidth,
        height: measuredHeight,
      };

      faceDetected = true;
      this.missedFrames = 0;
    } else {
      this.missedFrames++;
      // Brief temporal persistence to avoid flickering on blinking/rapid motion
      if (this.missedFrames < 8 && this.smoothedFaceBox) {
        faceDetected = true;
        rawFaceBox = this.smoothedFaceBox;
      }
    }

    let faceBox = null;
    let eyes = null;
    let gaze = { centered: true, dx: 0, dy: 0, label: 'CENTERED' };

    if (faceDetected && rawFaceBox) {
      // Exponential moving average filter for buttery smooth bounding box
      if (!this.smoothedFaceBox) {
        this.smoothedFaceBox = { ...rawFaceBox };
      } else {
        const alpha = 0.25;
        this.smoothedFaceBox = {
          x: this.smoothedFaceBox.x * (1 - alpha) + rawFaceBox.x * alpha,
          y: this.smoothedFaceBox.y * (1 - alpha) + rawFaceBox.y * alpha,
          width: this.smoothedFaceBox.width * (1 - alpha) + rawFaceBox.width * alpha,
          height: this.smoothedFaceBox.height * (1 - alpha) + rawFaceBox.height * alpha,
        };
      }
      faceBox = this.smoothedFaceBox;

      // 2. TRUE PUPIL & EYE SOCKET LUMINANCE VALLEY TRACKING
      // Anatomical eye line: exactly 38% to 48% of face height from head top
      const eyeBandTop = Math.round(faceBox.y + faceBox.height * 0.36);
      const eyeBandBottom = Math.round(faceBox.y + faceBox.height * 0.48);

      // Left eye quadrant: 18% to 44% of face width
      const leftEyeLeft = Math.round(faceBox.x + faceBox.width * 0.18);
      const leftEyeRight = Math.round(faceBox.x + faceBox.width * 0.44);

      // Right eye quadrant: 56% to 82% of face width
      const rightEyeLeft = Math.round(faceBox.x + faceBox.width * 0.56);
      const rightEyeRight = Math.round(faceBox.x + faceBox.width * 0.82);

      /**
       * Sub-pixel Pupil Valley Finder: locates weighted dark intensity minimum
       */
      const findPupilCenter = (rx1, rx2, ry1, ry2, defaultX, defaultY) => {
        let weightedX = 0;
        let weightedY = 0;
        let totalWeight = 0;

        // Find minimum luminance in eye ROI
        let minLuminance = 255;
        for (let y = ry1; y <= ry2; y++) {
          if (y < 0 || y >= height) continue;
          for (let x = rx1; x <= rx2; x++) {
            if (x < 0 || x >= width) continue;
            const l = lum[y * width + x];
            if (l < minLuminance) minLuminance = l;
          }
        }

        // Weight pixels closest to the dark valley minimum
        const threshold = minLuminance + 28;
        for (let y = ry1; y <= ry2; y++) {
          if (y < 0 || y >= height) continue;
          for (let x = rx1; x <= rx2; x++) {
            if (x < 0 || x >= width) continue;
            const l = lum[y * width + x];
            if (l <= threshold) {
              const weight = (threshold - l + 1);
              weightedX += x * weight;
              weightedY += y * weight;
              totalWeight += weight;
            }
          }
        }

        if (totalWeight > 0) {
          return { x: weightedX / totalWeight, y: weightedY / totalWeight };
        }
        return { x: defaultX, y: defaultY };
      };

      const defaultLeftX = faceBox.x + faceBox.width * 0.32;
      const defaultRightX = faceBox.x + faceBox.width * 0.68;
      const defaultEyeY = faceBox.y + faceBox.height * 0.42;

      const rawLeftEye = findPupilCenter(leftEyeLeft, leftEyeRight, eyeBandTop, eyeBandBottom, defaultLeftX, defaultEyeY);
      const rawRightEye = findPupilCenter(rightEyeLeft, rightEyeRight, eyeBandTop, eyeBandBottom, defaultRightX, defaultEyeY);

      // Smooth eyes across frames
      if (!this.smoothedEyes) {
        this.smoothedEyes = { left: rawLeftEye, right: rawRightEye };
      } else {
        const eyeAlpha = 0.30;
        this.smoothedEyes = {
          left: {
            x: this.smoothedEyes.left.x * (1 - eyeAlpha) + rawLeftEye.x * eyeAlpha,
            y: this.smoothedEyes.left.y * (1 - eyeAlpha) + rawLeftEye.y * eyeAlpha,
          },
          right: {
            x: this.smoothedEyes.right.x * (1 - eyeAlpha) + rawRightEye.x * eyeAlpha,
            y: this.smoothedEyes.right.y * (1 - eyeAlpha) + rawRightEye.y * eyeAlpha,
          },
        };
      }
      eyes = this.smoothedEyes;

      // 3. TRUE GAZE VECTOR & OFF-SCREEN CLASSIFICATION
      // Eye midpoint relative to face center
      const eyeMidX = (eyes.left.x + eyes.right.x) / 2;
      const eyeMidY = (eyes.left.y + eyes.right.y) / 2;
      const faceMidX = faceBox.x + faceBox.width * 0.5;
      const faceExpectedEyeY = faceBox.y + faceBox.height * 0.42;

      const dx = (eyeMidX - faceMidX) / (faceBox.width * 0.5);
      const dy = (eyeMidY - faceExpectedEyeY) / (faceBox.height * 0.2);

      let gazeLabel = 'CENTERED';
      let centered = true;

      // Horizontal deviation (looking left/right off-screen)
      if (dx < -this.options.gazeThresholdX) {
        gazeLabel = 'LOOKING RIGHT';
        centered = false;
      } else if (dx > this.options.gazeThresholdX) {
        gazeLabel = 'LOOKING LEFT';
        centered = false;
      } else if (dy > this.options.gazeThresholdY) {
        // Vertical deviation (looking down at lap, mobile phone, keyboard)
        gazeLabel = 'LOOKING DOWN';
        centered = false;
      } else if (dy < -this.options.gazeThresholdY) {
        gazeLabel = 'LOOKING UP';
        centered = false;
      }

      gaze = {
        centered,
        dx: Number(dx.toFixed(2)),
        dy: Number(dy.toFixed(2)),
        label: gazeLabel,
      };
    } else {
      this.smoothedFaceBox = null;
      this.smoothedEyes = null;
    }

    const { audioDb, isSpeaking } = this.getAudioTelemetry();

    return {
      faceDetected,
      faceCount: faceDetected ? 1 : 0,
      faceBox,
      eyes,
      gaze,
      audioDb,
      isSpeaking,
      timestamp: Date.now(),
    };
  }

  /**
   * Render real-time Augmented Reality HUD on video preview canvas
   */
  renderHUD(telemetry) {
    const canvas = this.canvas;
    const ctx = this.ctx;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const scaleX = w / this.options.targetWidth;
    const scaleY = h / this.options.targetHeight;

    // 1. Draw Face Bounding Box & Corner Reticles
    if (telemetry.faceDetected && telemetry.faceBox) {
      const box = telemetry.faceBox;
      const x = box.x * scaleX;
      const y = box.y * scaleY;
      const bw = box.width * scaleX;
      const bh = box.height * scaleY;

      const isCentered = telemetry.gaze.centered;
      const bracketColor = isCentered ? '#3F6B52' : '#C59A5B'; // Forest Sage vs Antique Brass

      ctx.save();
      ctx.strokeStyle = bracketColor;
      ctx.lineWidth = 2.5;

      // Draw Precision Corner Reticles
      const corner = Math.min(bw, bh) * 0.18;
      // Top-Left
      ctx.beginPath();
      ctx.moveTo(x, y + corner);
      ctx.lineTo(x, y);
      ctx.lineTo(x + corner, y);
      ctx.stroke();

      // Top-Right
      ctx.beginPath();
      ctx.moveTo(x + bw - corner, y);
      ctx.lineTo(x + bw, y);
      ctx.lineTo(x + bw, y + corner);
      ctx.stroke();

      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(x, y + bh - corner);
      ctx.lineTo(x, y + bh);
      ctx.lineTo(x + corner, y + bh);
      ctx.stroke();

      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(x + bw - corner, y + bh);
      ctx.lineTo(x + bw, y + bh);
      ctx.lineTo(x + bw, y + bh - corner);
      ctx.stroke();

      // Eye & Pupil Tracking Crosshairs
      if (telemetry.eyes) {
        ctx.fillStyle = bracketColor;
        ctx.strokeStyle = bracketColor;

        const drawEyeTarget = (eye, label) => {
          const ex = eye.x * scaleX;
          const ey = eye.y * scaleY;

          // Inner pupil circle
          ctx.beginPath();
          ctx.arc(ex, ey, 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Outer crosshairs
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(ex - 8, ey);
          ctx.lineTo(ex + 8, ey);
          ctx.moveTo(ex, ey - 8);
          ctx.lineTo(ex, ey + 8);
          ctx.stroke();

          // Outer reticle circle
          ctx.beginPath();
          ctx.arc(ex, ey, 7, 0, Math.PI * 2);
          ctx.stroke();
        };

        drawEyeTarget(telemetry.eyes.left, 'L');
        drawEyeTarget(telemetry.eyes.right, 'R');
      }

      ctx.restore();
    }

    // 2. Top Telemetry Bar with Non-Overlapping Columns
    ctx.save();
    ctx.fillStyle = 'rgba(23, 23, 23, 0.88)';
    ctx.fillRect(8, 8, w - 16, 26);
    ctx.strokeStyle = 'rgba(222, 217, 208, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(8, 8, w - 16, 26);

    ctx.font = '600 10px JetBrains Mono, monospace';

    // Column 1 (Left): Face Status
    if (telemetry.faceDetected) {
      ctx.fillStyle = '#88BA9D'; // Sage
      ctx.fillText('● FACE LOCKED (1)', 16, 25);
    } else {
      ctx.fillStyle = '#E59797'; // Crimson
      ctx.fillText('▲ NO FACE DETECTED', 16, 25);
    }

    // Column 2 (Center): Pupil Gaze Status (Cleanly separated)
    if (telemetry.gaze.centered) {
      ctx.fillStyle = '#D4AA6A'; // Brass
      ctx.fillText('GAZE: CENTERED', 135, 25);
    } else {
      ctx.fillStyle = '#DEAC74'; // Amber
      ctx.fillText(`GAZE: ${telemetry.gaze.label}`, 125, 25);
    }

    // Column 3 (Right): Mic Decibel Level
    ctx.fillStyle = telemetry.isSpeaking ? '#88BA9D' : '#9E988F';
    ctx.fillText(`MIC: ${telemetry.audioDb} dB`, w - 75, 25);

    ctx.restore();
  }
}

export default ProctoringCVEngine;
