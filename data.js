// ============================================
// MODULE: DATA VISUALIZER
// Audio & Data Visualization Engine
// ============================================

export class DataVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.animationId = null;
        this.isActive = false;
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        if (!this.canvas) return;
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }

    start() {
        if (this.isActive) return;
        this.isActive = true;
        this.animate();
    }

    stop() {
        this.isActive = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.clear();
    }

    animate() {
        if (!this.isActive) return;

        this.ctx.fillStyle = 'rgba(5, 5, 8, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw visualization based on mode
        this.drawCircularWaveform();

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    drawCircularWaveform() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = 50;

        this.ctx.beginPath();
        this.ctx.strokeStyle = '#00f0ff';
        this.ctx.lineWidth = 2;

        for (let i = 0; i < 360; i += 5) {
            const angle = (i * Math.PI) / 180;
            // Simulate waveform data
            const amplitude = Math.sin(Date.now() * 0.005 + i * 0.1) * 20 + 
                            Math.sin(Date.now() * 0.01 + i * 0.05) * 10;
            
            const x = centerX + Math.cos(angle) * (radius + amplitude);
            const y = centerY + Math.sin(angle) * (radius + amplitude);

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }

        this.ctx.closePath();
        this.ctx.stroke();

        // Draw glow
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#00f0ff';
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;

        // Draw center orb
        const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 30);
        gradient.addColorStop(0, 'rgba(0, 240, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 240, 255, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawBars() {
        if (!this.analyser) return;

        this.analyser.getByteFrequencyData(this.dataArray);

        const barWidth = (this.canvas.width / this.dataArray.length) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < this.dataArray.length; i++) {
            barHeight = this.dataArray[i] / 2;

            const r = barHeight + 25 * (i / this.dataArray.length);
            const g = 250 * (i / this.dataArray.length);
            const b = 50;

            this.ctx.fillStyle = `rgb(${r},${g},${b})`;
            this.ctx.fillRect(x, this.canvas.height - barHeight, barWidth, barHeight);

            x += barWidth + 1;
        }
    }

    connectToAudioSource(stream) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        
        const source = this.audioContext.createMediaStreamSource(stream);
        source.connect(this.analyser);
        
        this.analyser.fftSize = 256;
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}