// ============================================
// MODULE: NOTIFICATION MANAGER
// Rich Notification System
// ============================================

export class NotificationManager {
    constructor() {
        this.container = document.getElementById('notification-center');
        this.permission = 'default';
        this.soundEnabled = true;
        this.init();
    }

    init() {
        // Request permission for system notifications
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                this.permission = permission;
            });
        }
    }

    show(options) {
        const {
            title,
            message,
            type = 'info',
            duration = 5000,
            actions = [],
            icon = null
        } = options;

        // Create DOM notification
        const notif = document.createElement('div');
        notif.className = `notification ${type}`;
        
        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };

        notif.innerHTML = `
            <div class="notification-icon">${icon || icons[type]}</div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
                ${actions.length > 0 ? `
                    <div class="notification-actions">
                        ${actions.map(a => `<button onclick="${a.handler}">${a.label}</button>`).join('')}
                    </div>
                ` : ''}
            </div>
            <button class="notification-close">&times;</button>
        `;

        // Add to container
        this.container.appendChild(notif);

        // Auto-remove
        const timeout = setTimeout(() => {
            this.remove(notif);
        }, duration);

        // Close button
        notif.querySelector('.notification-close').addEventListener('click', () => {
            clearTimeout(timeout);
            this.remove(notif);
        });

        // Play sound if enabled
        if (this.soundEnabled) {
            this.playSound(type);
        }

        // Show system notification if permitted and app hidden
        if (this.permission === 'granted' && document.hidden) {
            this.showSystemNotification(title, message);
        }

        return notif;
    }

    remove(notif) {
        notif.style.animation = 'notification-out 0.3s ease forwards';
        setTimeout(() => notif.remove(), 300);
    }

    playSound(type) {
        // Create simple beep sounds
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        const frequencies = {
            info: 800,
            success: 1200,
            warning: 600,
            error: 400
        };

        oscillator.frequency.value = frequencies[type] || 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.5);
    }

    showSystemNotification(title, body) {
        new Notification(title, {
            body,
            icon: '/jarvis-icon.png',
            badge: '/jarvis-badge.png'
        });
    }

    // Specialized notifications
    notifyLowBattery() {
        this.show({
            title: 'Power Warning',
            message: 'System battery is running low. Please connect to power.',
            type: 'warning',
            duration: 10000
        });
    }

    notifyUpdateAvailable() {
        this.show({
            title: 'Update Available',
            message: 'A new version of J.A.R.V.I.S. is available.',
            type: 'info',
            actions: [
                { label: 'Update', handler: 'location.reload()' },
                { label: 'Later', handler: '' }
            ]
        });
    }

    notifySecurityAlert(message) {
        this.show({
            title: 'Security Alert',
            message,
            type: 'error',
            duration: 15000
        });
    }
}