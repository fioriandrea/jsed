const getWindowWidth = () => window.innerWidth;

const getWindowHeight = () => window.innerHeight;

const devicePixelRatio = () => window.devicePixelRatio;

const appendCanvas = (parent) => {
    parent = parent || document.querySelector('body');
    let canvas = document.createElement('canvas');
    parent.appendChild(canvas);
    return canvas;
};

const isObjEmpty = obj => Object.keys(obj).length === 0 && obj.constructor === Object;

const milliseconds = () => window.performance.now();

class HRCanvas {
    constructor(canvas, width, height) {
        this.canvas = canvas;
        this.setSize(width, height);
    }

    get context2d() {
        return this.canvas.getContext('2d');
    }

    setSize(width, height) {
        this.canvas.width = width * devicePixelRatio();
        this.canvas.height = height * devicePixelRatio();
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        this.context2d.setTransform(devicePixelRatio(), 0, 0, devicePixelRatio(), 0, 0);
        this.width = width;
        this.height = height;
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

class TagTrie {
    constructor() {
        this.raw = this._makeEmptyNode();
    }

    _makeEmptyNode() {
        return {
            sons: {},
        };
    }

    _getChordsDfs(node, current, container) {
        if (isObjEmpty(node.sons)) {
            container.push([...current]);
            return;
        }
        for (let son in node.sons) {
            if (!node.sons.hasOwnProperty(son))
                continue;
            current.push(son);
            this._getChordsDfs(node.sons[son], current, container);
            current.pop();
        }
    }

    getChords() {
        let container = [];
        this._getChordsDfs(this.raw, [], container);
        return container;
    }

    merge(tagTrie) {
        tagTrie.getChords()
        .forEach(e => this.addNode(e, tagTrie.getNode(e).payload));
    }

    getNode(path) {
        let node = this.raw.sons[path[0]];

        for (let i = 1; i < path.length && node !== undefined; i++)
            node = node.sons[path[i]];
        
        return node;
    }

    addNode(path, payload=undefined) {
        let i = 0;
        let node = this.raw;

        while (i < path.length) {
            let dummy = node.sons[path[i]];
            if (!dummy)
                break;
            node = dummy;
            i++;
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

class KeyRecorder {
    constructor() {
        this.key = null;
    }

    keyDown(e) {
        this.key = e.key;
    }

    keyUp(e) {
        this.key = null;
    }

    isKeyDown() {
        return this.key !== null;
    }

    bind(element) {
        element.addEventListener('keydown', e => this.keyDown(e));
        element.addEventListener('keyup', e => this.keyUp(e));
    }
}

class Observable {
    constructor() {
        this.observers = [];
    }

    addObserver(obs) {
        this.observers.push(obs);
    }

    removeObserver(obj) {
        this.observers = this.observers.filter(o => o !== obj);
    }

    notifyAll(payload) {
        this.observers.forEach(o => o.respondToNotify(payload));
    }
}

const downloadTextFile = (text, filename='file.txt') => {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.click();
};