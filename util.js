const spliceArray = (array, start, deleteCount, toInsert) => {
    const deleted = [];

    deleteCount = Math.min(deleteCount, array.length - start);
    for (let i = start; i < start + deleteCount; i++)
        deleted.push(array[i]);

    if (toInsert.length > deleteCount) {
        let distance = toInsert.length - deleteCount;
        array.length += distance;

        for (let i = array.length - 1; i >= start + toInsert.length; i--) {
            array[i] = array[i - distance];
        }

        deleteCount = toInsert.length;
    }
    
    for (let i = start + toInsert.length; i < start + deleteCount; i++) {
        let j = i + (deleteCount - toInsert.length);
        array[i] = array[j];
    }

    for (let i = start; i < start + toInsert.length; i++) {
        array[i] = toInsert[i - start];
    }

    array.length = array.length - deleteCount + toInsert.length;

    return deleted;
};

// If forwards is true, behaviour is the same as normal splice. Otherwise, 
// it deletes backwards **excluding** the element at start (i.e. array[start] is not deleted).
// It is like hitting backspace in Vim.
const spliceBothWays = (array, start, deleteCount, toInsert, forwards = true) => {
    if (!forwards) {
        deleteCount = Math.min(start, deleteCount);
        start = start - deleteCount;
    }
    return spliceArray(array, start, deleteCount, toInsert);
};

const isSpace = char => char === ' ' || char === '\n' || char === '\t' || char === '\r' || char === '\b';

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

const downloadTextFile = (text, filename='file.txt') => {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.click();
};
