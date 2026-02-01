// ============================================
// MODULE: CALCULATOR
// Advanced Mathematical Engine
// ============================================

export class Calculator {
    constructor() {
        this.display = '0';
        this.previousValue = null;
        this.operation = null;
        this.newNumber = true;
        this.history = [];
        this.memory = 0;
    }

    input(value) {
        if (this.isNumber(value)) {
            this.handleNumber(value);
        } else if (this.isOperator(value)) {
            this.handleOperator(value);
        } else if (value === 'C') {
            this.clear();
        } else if (value === '⌫') {
            this.backspace();
        } else if (value === '=') {
            this.calculate();
        } else if (value === '%') {
            this.percentage();
        } else if (value === '.') {
            this.decimal();
        }
    }

    isNumber(val) {
        return !isNaN(val) && val !== '.';
    }

    isOperator(val) {
        return ['+', '-', '*', '/'].includes(val);
    }

    handleNumber(num) {
        if (this.newNumber) {
            this.display = num;
            this.newNumber = false;
        } else {
            this.display = this.display === '0' ? num : this.display + num;
        }
    }

    handleOperator(op) {
        if (this.operation && !this.newNumber) {
            this.calculate();
        }
        
        this.previousValue = parseFloat(this.display);
        this.operation = op;
        this.newNumber = true;
    }

    calculate() {
        if (this.operation === null || this.previousValue === null) return;

        const current = parseFloat(this.display);
        let result;

        switch(this.operation) {
            case '+':
                result = this.previousValue + current;
                break;
            case '-':
                result = this.previousValue - current;
                break;
            case '*':
                result = this.previousValue * current;
                break;
            case '/':
                result = current === 0 ? 'Error' : this.previousValue / current;
                break;
            default:
                return;
        }

        // Add to history
        this.history.push({
            expression: `${this.previousValue} ${this.operation} ${current}`,
            result: result
        });

        this.display = String(this.formatResult(result));
        this.previousValue = null;
        this.operation = null;
        this.newNumber = true;
    }

    formatResult(num) {
        if (typeof num !== 'number') return num;
        if (Number.isInteger(num)) return num;
        return parseFloat(num.toFixed(8));
    }

    clear() {
        this.display = '0';
        this.previousValue = null;
        this.operation = null;
        this.newNumber = true;
    }

    backspace() {
        if (this.display.length > 1) {
            this.display = this.display.slice(0, -1);
        } else {
            this.display = '0';
        }
    }

    percentage() {
        const current = parseFloat(this.display);
        this.display = String(current / 100);
    }

    decimal() {
        if (!this.display.includes('.')) {
            this.display += '.';
        }
    }

    // Advanced functions
    square() {
        const current = parseFloat(this.display);
        this.display = String(current * current);
    }

    sqrt() {
        const current = parseFloat(this.display);
        this.display = String(Math.sqrt(current));
    }

    power(exp) {
        const current = parseFloat(this.display);
        this.display = String(Math.pow(current, exp));
    }

    // Memory functions
    memoryStore() {
        this.memory = parseFloat(this.display);
    }

    memoryRecall() {
        this.display = String(this.memory);
    }

    memoryClear() {
        this.memory = 0;
    }

    memoryAdd() {
        this.memory += parseFloat(this.display);
    }

    getDisplay() {
        return this.display;
    }

    // Natural language calculation
    evaluateExpression(expression) {
        try {
            // Sanitize and evaluate
            const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
            // eslint-disable-next-line no-new-func
            const result = Function('"use strict";return (' + sanitized + ')')();
            return this.formatResult(result);
        } catch (e) {
            return 'Error';
        }
    }
}