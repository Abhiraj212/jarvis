// ============================================
// VISION SYSTEM: FACE RECOGNITION
// Computer Vision with Face-API.js
// ============================================

export class VisionSystem {
    constructor(config) {
        this.config = config;
        this.video = null;
        this.canvas = null;
        this.stream = null;
        this.modelsLoaded = false;
        this.detectionInterval = null;
        this.knownFaces = new Map();
        this.currentDetections = [];
        this.isActive = false;
    }

    async initialize() {
        // Load models
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
        
        try {
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
                faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL)
            ]);
            
            this.modelsLoaded = true;
            console.log('Vision models loaded');
        } catch (error) {
            console.error('Failed to load vision models:', error);
        }
    }

    async start(onDetection) {
        if (!this.modelsLoaded) {
            await this.initialize();
        }

        this.video = document.getElementById('vision-video');
        this.canvas = document.getElementById('vision-canvas');

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: false
            });

            this.video.srcObject = this.stream;
            
            this.video.addEventListener('play', () => {
                this.canvas.width = this.video.videoWidth;
                this.canvas.height = this.video.videoHeight;
                this.startDetectionLoop(onDetection);
            });

            this.isActive = true;
        } catch (error) {
            console.error('Failed to start camera:', error);
        }
    }

    startDetectionLoop(onDetection) {
        this.detectionInterval = setInterval(async () => {
            const detections = await faceapi
                .detectAllFaces(this.video, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceExpressions()
                .withAgeAndGender()
                .withFaceDescriptors();

            this.currentDetections = detections;
            this.drawDetections(detections);
            
            if (detections.length > 0 && onDetection) {
                onDetection(this.processDetections(detections));
            }
        }, this.config.detectionInterval);
    }

    drawDetections(detections) {
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        detections.forEach(detection => {
            const box = detection.detection.box;
            const expressions = detection.expressions;
            const dominantExpression = Object.entries(expressions)
                .sort((a, b) => b[1] - a[1])[0];

            // Draw box
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 2;
            ctx.strokeRect(box.x, box.y, box.width, box.height);

            // Draw info
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(box.x, box.y - 30, box.width, 30);
            
            ctx.fillStyle = '#00f0ff';
            ctx.font = '14px monospace';
            const info = `${Math.round(detection.age)}y ${detection.gender} | ${dominantExpression[0]}`;
            ctx.fillText(info, box.x + 5, box.y - 10);

            // Draw landmarks
            detection.landmarks.positions.forEach(point => {
                ctx.fillStyle = '#00f0ff';
                ctx.fillRect(point.x - 1, point.y - 1, 2, 2);
            });
        });
    }

    processDetections(detections) {
        return detections.map(d => ({
            faceId: this.identifyFace(d.descriptor),
            age: Math.round(d.age),
            gender: d.gender,
            expressions: d.expressions,
            descriptor: d.descriptor,
            location: d.detection.box
        }));
    }

    identifyFace(descriptor) {
        // Compare with known faces
        let bestMatch = { name: 'unknown', distance: 1 };
        
        for (const [name, data] of this.knownFaces) {
            const distance = faceapi.euclideanDistance(descriptor, data.descriptor);
            if (distance < bestMatch.distance) {
                bestMatch = { name, distance };
            }
        }

        return bestMatch.distance < 0.6 ? bestMatch.name : 'unknown';
    }

    registerFace(name, descriptor) {
        this.knownFaces.set(name, {
            descriptor,
            registeredAt: Date.now(),
            encounters: 0
        });
        
        // Save to persistent storage
        this.saveKnownFaces();
    }

    saveKnownFaces() {
        const data = Array.from(this.knownFaces.entries()).map(([name, data]) => ({
            name,
            descriptor: Array.from(data.descriptor),
            registeredAt: data.registeredAt
        }));
        
        localStorage.setItem('jarvis_known_faces', JSON.stringify(data));
    }

    loadKnownFaces() {
        const stored = localStorage.getItem('jarvis_known_faces');
        if (stored) {
            const data = JSON.parse(stored);
            data.forEach(item => {
                this.knownFaces.set(item.name, {
                    descriptor: new Float32Array(item.descriptor),
                    registeredAt: item.registeredAt,
                    encounters: 0
                });
            });
        }
    }

    captureSnapshot() {
        if (!this.video) return null;
        
        const canvas = document.createElement('canvas');
        canvas.width = this.video.videoWidth;
        canvas.height = this.video.videoHeight;
        canvas.getContext('2d').drawImage(this.video, 0, 0);
        
        return canvas.toDataURL('image/jpeg');
    }

    stop() {
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
            this.detectionInterval = null;
        }

        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        this.isActive = false;
    }

    // Advanced features
    async detectEmotion() {
        if (this.currentDetections.length === 0) return null;
        
        const expressions = this.currentDetections[0].expressions;
        return Object.entries(expressions)
            .sort((a, b) => b[1] - a[1])[0];
    }

    estimateAttention() {
        // Estimate if user is looking at screen based on landmarks
        if (this.currentDetections.length === 0) return 0;
        
        const landmarks = this.currentDetections[0].landmarks;
        // Simplified attention estimation
        return 0.8; // Placeholder
    }
}