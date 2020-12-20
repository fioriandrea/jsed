class KeyChordControl {
    constructor(keyChords) {
        this.keyChords = keyChords;
        this.keyBuffer = [];
    }

    keyPressed(key, editor) {
        this.keyBuffer.push(key);
        let node = this.keyChords.getNode(this.keyBuffer);
        if (!node) {
            this.cleanBuffer();
        } else if (node.payload) {
            node.payload(editor);
            if (isObjEmpty(node.sons))
                this.cleanBuffer();
        }

        return node;
    }

    cleanBuffer() {
        this.keyBuffer = [];
    }
}

class ModeControl {
    constructor(keyChords, defaultKeyBinding, delay=1000) {
        this.timeout = new Timeout(delay);
        this.keyChordControl = new KeyChordControl(keyChords || new TagTrie());
        this.defaultKeyBinding = defaultKeyBinding || (() => {});
    }

    keyPressed(key, editor) {
        if (!this.timeout.output()) {
            this.keyChordControl.cleanBuffer();
            this.timeout.reset();
        }
        let node = this.keyChordControl.keyPressed(key, editor);
        if (!node) {
            this.defaultKeyBinding(key, editor);
        }
    }
}

const controls = {
    'insert': new ModeControl(insertKeyChords, (key, editor) => {
            let {cursor, lines} = editor;
            lines.insertChars(cursor.row, cursor.column, [key]);
            cursor.column++;
    }, chordDelay),
    'normal': new ModeControl(normalKeyChords, (() => {}), chordDelay),
    'visual': new ModeControl(visualKeyChords, (() => {}), chordDelay),
};