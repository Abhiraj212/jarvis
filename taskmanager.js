// ============================================
// MODULE: TASK MANAGER
// Advanced Task & Reminder System
// ============================================

export class TaskManager {
    constructor(memory) {
        this.memory = memory;
        this.tasks = [];
        this.reminders = [];
        this.categories = ['personal', 'work', 'shopping', 'health', 'finance'];
        this.loadTasks();
    }

    async loadTasks() {
        const stored = await this.memory.getFact('tasks');
        if (stored) {
            this.tasks = stored;
        }
        this.renderTasks();
    }

    async saveTasks() {
        await this.memory.setFact('tasks', this.tasks);
    }

    addTask(text, options = {}) {
        const task = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            text,
            completed: false,
            createdAt: Date.now(),
            dueDate: options.dueDate || null,
            priority: options.priority || 'medium',
            category: options.category || 'personal',
            tags: options.tags || [],
            reminders: options.reminders || []
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();

        // Schedule reminders
        if (task.dueDate) {
            this.scheduleReminder(task);
        }

        return task;
    }

    completeTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? Date.now() : null;
            this.saveTasks();
            this.renderTasks();
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        this.renderTasks();
    }

    editTask(id, updates) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            Object.assign(task, updates);
            this.saveTasks();
            this.renderTasks();
        }
    }

    getTasks(filter = 'all') {
        switch(filter) {
            case 'active':
                return this.tasks.filter(t => !t.completed);
            case 'completed':
                return this.tasks.filter(t => t.completed);
            case 'today':
                const today = new Date().setHours(0,0,0,0);
                return this.tasks.filter(t => {
                    if (!t.dueDate) return false;
                    const due = new Date(t.dueDate).setHours(0,0,0,0);
                    return due === today;
                });
            case 'overdue':
                const now = Date.now();
                return this.tasks.filter(t => {
                    return !t.completed && t.dueDate && t.dueDate < now;
                });
            default:
                return this.tasks;
        }
    }

    scheduleReminder(task) {
        if (!task.dueDate) return;

        const reminderTime = new Date(task.dueDate).getTime() - (15 * 60 * 1000); // 15 min before
        
        if (reminderTime > Date.now()) {
            setTimeout(() => {
                this.triggerReminder(task);
            }, reminderTime - Date.now());
        }
    }

    triggerReminder(task) {
        if (window.jarvis?.modules?.notifications) {
            window.jarvis.modules.notifications.show({
                title: 'Task Reminder',
                message: task.text,
                type: 'warning',
                duration: 10000
            });
        }

        if (window.jarvis?.speak) {
            window.jarvis.speak(`Reminder: ${task.text}`);
        }
    }

    renderTasks() {
        const container = document.getElementById('task-list');
        if (!container) return;

        const filter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
        const tasks = this.getTasks(filter);

        container.innerHTML = tasks.map(task => `
            <li class="task-item priority-${task.priority} ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                    onchange="jarvis.modules.taskManager.completeTask('${task.id}')">
                <span class="task-content">${this.escapeHtml(task.text)}</span>
                ${task.dueDate ? `<span class="task-due">${new Date(task.dueDate).toLocaleDateString()}</span>` : ''}
                <button class="task-delete" onclick="jarvis.modules.taskManager.deleteTask('${task.id}')">×</button>
            </li>
        `).join('');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Natural language task creation
    parseTaskFromText(text) {
        // Extract due date
        const datePatterns = [
            /\b(tomorrow|today|tonight)\b/i,
            /\b(next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/i,
            /\b(in\s+(\d+)\s+(days?|hours?|minutes?))\b/i,
            /\b(at\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\b/i
        ];

        let dueDate = null;
        for (const pattern of datePatterns) {
            const match = text.match(pattern);
            if (match) {
                dueDate = this.parseDate(match[0]);
                break;
            }
        }

        // Extract priority
        let priority = 'medium';
        if (/\b(urgent|asap|important|critical)\b/i.test(text)) priority = 'urgent';
        else if (/\b(low priority|whenever|someday)\b/i.test(text)) priority = 'low';

        // Clean text
        const cleanText = text.replace(/\b(remind me to|add task|todo)\b/gi, '').trim();

        return { text: cleanText, dueDate, priority };
    }

    parseDate(text) {
        const now = new Date();
        
        if (text.toLowerCase().includes('tomorrow')) {
            return new Date(now.setDate(now.getDate() + 1)).setHours(9,0,0,0);
        }
        if (text.toLowerCase().includes('today')) {
            return now.setHours(17,0,0,0);
        }
        
        // Add more parsing logic...
        return null;
    }
}