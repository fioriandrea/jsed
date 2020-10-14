const isObjEmpty = obj => Object.keys(obj).length === 0 && obj.constructor === Object;

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

    output() {
        let delta = milliseconds() - this.millis;
        if (delta >= this.period) {
            this.millis = milliseconds();
        }
        return this.onCondition(delta) ? 1 : 0;
    }
}

class Timeout {
    constructor(interval) {
        this.interval = interval;
        this.lastTime = null;
    }

    reset() {
        this.lastTime = null;
    }

    output() {
        if (this.lastTime === null)
            this.lastTime = milliseconds();
        if (milliseconds() - this.lastTime < this.interval)
            return 1;
        else 
            return 0;
    }
}

class CoolDown {
    constructor(delay) {
        this.delay = delay;
        this.lastExecution = null;
    }

    reset() {
        this.lastExecution = null;
    }

    output() {
        const currentMillis = millis();
        if (this.lastExecution === null || currentMillis - this.lastExecution > this.delay) {
            this.lastExecution = currentMillis;
            return 1;
        } else {
            return 0;
        }
    }
}

class TagTrie {
    constructor(raw={}) {
        this.raw = raw;
    }

    _makeEmptyNode() {
        return {
            sons: {},
        };
    }

    getNode(path) {
        let node = this.raw[path[0]];

        for (let i = 1; i < path.length && node !== undefined; i++)
            node = node[path[i]];
        
        return node;
    }

    addNode(path, payload=undefined) {
        let i = 0;
        let node = this.raw;
        let dummy = previous[path[i++]];

        while (i < path.length && dummy !== undefined) {
            node = dummy;
            dummy = node[path[i++]];
        }

        while (i < path.length) {
            node.sons[path[i]] = this._makeEmptyNode();
            node = node.sons[path[i++]];
        }

        node.payload = payload;

        return node;
    }

    setPayload(path, payload) {
        let node = this.getNode(path);
        if (node !== undefined)
            node.payload = payload;
    }
}
