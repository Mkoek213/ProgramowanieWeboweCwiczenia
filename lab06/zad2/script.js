class ShootingRange {
    constructor() {
        this.score = 0;
        this.isPropagationStopped = false;
        this.disabledState = { yellow: false, red: false, blue: false };
        
        this.captureSettings = {
            blue: false,
            red: false,
            yellow: false
        };

        this.datasetToTargetKey = {
            niebieski: 'blue',
            czerwony: 'red',
            żółty: 'yellow'
        };

        this.scoreDisplay = document.getElementById('score-display');
        this.logContainer = document.getElementById('log-container');
        
        this.targets = {
            blue: { el: document.querySelector('.target-blue'), points: 1, name: 'niebieski' },
            red: { el: document.querySelector('.target-red'), points: 2, name: 'czerwony' },
            yellow: { el: document.querySelector('.target-yellow'), points: 5, name: 'żółty' }
        };
        
        this.buttons = {
            propagation: document.getElementById('btn-propagation'),
            order125: document.getElementById('btn-order-125'),
            order152: document.getElementById('btn-order-152'),
            order251: document.getElementById('btn-order-251'),
            order521: document.getElementById('btn-order-521'),
            reset: document.getElementById('btn-reset'),
            clearLog: document.getElementById('btn-clear-log')
        };

        this.handleHit = this.handleHit.bind(this);
        this.togglePropagation = this.togglePropagation.bind(this);
        this.setOrder = this.setOrder.bind(this);
        this.resetGame = this.resetGame.bind(this);
        this.clearLogs = this.clearLogs.bind(this);
    }

    init() {
        this.setOrder('1-2-5', { skipLog: true });

        this.buttons.propagation.addEventListener('click', this.togglePropagation);
        this.buttons.reset.addEventListener('click', this.resetGame);
        this.buttons.clearLog.addEventListener('click', this.clearLogs);
        
        this.buttons.order125.addEventListener('click', () => this.setOrder('1-2-5'));
        this.buttons.order152.addEventListener('click', () => this.setOrder('1-5-2'));
        this.buttons.order251.addEventListener('click', () => this.setOrder('2-5-1'));
        this.buttons.order521.addEventListener('click', () => this.setOrder('5-2-1'));
        
        this.updateButtonText();
    }

    addListeners() {
        this.targets.blue.el.addEventListener('click', this.handleHit, this.captureSettings.blue);
        this.targets.red.el.addEventListener('click', this.handleHit, this.captureSettings.red);
        this.targets.yellow.el.addEventListener('click', this.handleHit, this.captureSettings.yellow);
    }

    removeListeners() {
        this.targets.blue.el.removeEventListener('click', this.handleHit, this.captureSettings.blue);
        this.targets.red.el.removeEventListener('click', this.handleHit, this.captureSettings.red);
        this.targets.yellow.el.removeEventListener('click', this.handleHit, this.captureSettings.yellow);
    }

    handleHit(e) {
        const clickedKey = this.getTargetKeyFromElement(e.target);

        if (clickedKey && this.disabledState[clickedKey]) {
            e.stopPropagation();
            return;
        }

        if (this.isPropagationStopped) {
            e.stopPropagation();
            if (clickedKey) {
                this.addScore(clickedKey);
            }
            return;
        }

        const currentKey = this.getTargetKeyFromElement(e.currentTarget);
        if (!currentKey) return;

        if (this.disabledState[currentKey]) return;

        this.addScore(currentKey);
    }

    normalizeTargetKey(datasetName) {
        if (!datasetName) {
            return null;
        }

        return this.datasetToTargetKey[datasetName] || datasetName;
    }

    getTargetKeyFromElement(element) {
        if (!element || !element.dataset) {
            return null;
        }

        return this.normalizeTargetKey(element.dataset.name);
    }

    addScore(targetKey) {
        const target = this.targets[targetKey];
        if (!target) return;

        this.score += target.points;
        this.log(`Nacisnąłeś ${target.name} o wartości ${target.points}`);
        this.updateScoreDisplay();
        this.checkThresholds();
    }

    checkThresholds() {
        if (this.score > 50 && !this.disabledState.blue) {
            this.disableTarget('blue'); this.disableTarget('red'); this.disableTarget('yellow');
            this.log('PRÓG 50: Wszystkie cele wyłączone.');
        } else if (this.score > 30 && !this.disabledState.red) {
            this.disableTarget('red'); this.disableTarget('yellow');
            this.log('PRÓG 30: Cel czerwony i żółty wyłączony.');
        } else if (this.score > 20 && !this.disabledState.yellow) {
            this.disableTarget('yellow');
            this.log('PRÓG 20: Cel żółty wyłączony.');
        }
    }

    disableTarget(name) {
        if (this.targets[name]) {
            this.targets[name].el.classList.add('is-inactive');
            this.disabledState[name] = true;
        }
    }

    enableTarget(name) {
        if (this.targets[name]) {
            this.targets[name].el.classList.remove('is-inactive');
            this.disabledState[name] = false;
        }
    }

    togglePropagation() {
        this.isPropagationStopped = !this.isPropagationStopped;
        this.log(`Propagacja ${this.isPropagationStopped ? 'NIEAKTYWNA' : 'AKTYWNA'}`);
        this.updateButtonText();
    }

    setOrder(orderKey, options = {}) {
        const { skipLog = false } = options;

        const configurations = {
            '1-2-5': { blue: true, red: true, yellow: true },
            '1-5-2': { blue: true, red: false, yellow: true },
            '2-5-1': { blue: false, red: true, yellow: true },
            '5-2-1': { blue: false, red: false, yellow: false }
        };

        const newSettings = configurations[orderKey];
        if (!newSettings) return;

        this.removeListeners();
        this.captureSettings = newSettings;
        this.addListeners();

        this.updateTargetPoints(orderKey);

        if (!skipLog) {
            this.log(`Kolejność zmieniona na: ${orderKey}`);
        }

        this.updateOrderButtons(orderKey);
    }

    updateTargetPoints(orderKey) {
        if (typeof orderKey !== 'string') return;

        const values = orderKey.split('-').map(value => parseInt(value, 10));
        if (values.length !== 3 || values.some(Number.isNaN)) {
            return;
        }

        const [bluePoints, redPoints, yellowPoints] = values;

        const mapping = {
            blue: bluePoints,
            red: redPoints,
            yellow: yellowPoints
        };

        Object.entries(mapping).forEach(([key, points]) => {
            if (!this.targets[key]) return;
            this.targets[key].points = points;
            this.targets[key].el.dataset.points = points;
        });
    }

    resetGame() {
        this.removeListeners();
        
        this.score = 0;
        this.isPropagationStopped = false;
        this.captureSettings = { blue: false, red: false, yellow: false };
        
        Object.keys(this.targets).forEach(name => this.enableTarget(name));

        this.setOrder('1-2-5', { skipLog: true });
        this.updateScoreDisplay();
        this.updateButtonText();
        this.log('RESET GRY: Stan początkowy przywrócony.');
    }

    clearLogs() {
        this.logContainer.innerHTML = '';
    }

    log(message) {
        const logEntry = document.createElement('div');
        logEntry.className = 'log-message';
        logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        this.logContainer.prepend(logEntry);
    }

    updateScoreDisplay() {
        this.scoreDisplay.textContent = this.score;
    }

    updateButtonText() {
        this.buttons.propagation.textContent = this.isPropagationStopped 
            ? 'Propagacja nieaktywna' 
            : 'Propagacja aktywna';
    }

    updateOrderButtons(activeKey) {
        this.buttons.order125.classList.remove('active');
        this.buttons.order152.classList.remove('active');
        this.buttons.order251.classList.remove('active');
        this.buttons.order521.classList.remove('active');

        const buttonKey = 'order' + activeKey.replace(/-/g, '');
        if (this.buttons[buttonKey]) {
            this.buttons[buttonKey].classList.add('active');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new ShootingRange();
    game.init();
});