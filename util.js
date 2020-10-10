const milliseconds = () => window.performance.now();

class Blinker {
    constructor(period, dutyCycle=0.5, startOn=true) {
        this.period = period;
        this.dutyCycle = dutyCycle;
        this.onCondition = startOn ? (delta) => delta <= this.period * this.dutyCycle :
            (delta) => delta >= this.period * (1 - this.dutyCycle);
        this.millis = milliseconds();
    }

    reset() {
        this.millis = milliseconds();
    }

    execute(fn, args=[]) {
        let delta = milliseconds() - this.millis;
        if (this.onCondition(delta)) {
            fn(...args);
        }
        if (delta >= this.period) {
            this.millis = milliseconds();
        }
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
