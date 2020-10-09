const milliseconds = () => window.performance.now();

class Blinker {
    constructor(period, dutyCycle=0.5, startOn=false) {
        this.period = period;
        this.dutyCycle = dutyCycle;
        this.startOn = false;
        this.millis = milliseconds();
    }

    execute(fn, args=[]) {
        let delta = milliseconds() - this.millis;
        if (delta >= this.period * (1 - this.dutyCycle)) {
            fn(...args);
        }
        if (delta >= this.period) {
            this.millis = milliseconds();
        }
    }
}

class StartCoolDown {
    constructor(delay) {
        this.delay = delay;
        this.firstExecution = null;
    }

    execute(fn, args=[]) {
        const currentMillis = milliseconds();
        if (this.firstExecution === null || currentMillis - this.firstExecution > this.delay) {
            if (this.firstExecution === null)
                this.firstExecution = currentMillis;
            fn(...args);
        }
    }

    reset() {
        this.firstExecution = null;
    }
}

class CoolDown {
    constructor(delay) {
        this.delay = delay;
        this.lastExecution = null;
    }

    execute(fn, args=[]) {
        const currentMillis = millis();
        if (this.lastExecution === null || currentMillis - this.lastExecution > this.delay) {
            fn(...args);
            this.lastExecution = currentMillis;
        }
    }
}
