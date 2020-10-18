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
    constructor(keyBindings, defaultKeyBinding, keyChords, delay=1000) {
        this.timeout = new Timeout(delay);
        this.keyChordControl = new KeyChordControl(keyChords || new TagTrie());
        this.keyBindings = keyBindings || {};
        this.defaultKeyBinding = defaultKeyBinding || (() => {});
    }

    keyPressed(key, editor) {
        if (!this.timeout.output()) {
            this.timeout.reset();
            this.keyChordControl.cleanBuffer();
        }
        let node = this.keyChordControl.keyPressed(key, editor);
        if (!node) {
            if (this.keyBindings[key]) {
                this.keyBindings[key](editor);
            } else {
                this.defaultKeyBinding(key, editor);
            }
        }
    }
}

const controls = {
    'insert': new ModeControl(insertKeyBindings, (key, editor) => {
            let {cursor, lines} = editor;
            lines.insertCharacters(cursor.row, cursor.column, key);
            cursor.column++;
    }),
    'normal': new ModeControl(null, null, normalKeyChords, chordDelay),
    'visual': new ModeControl(null, null, visualKeyChords, chordDelay),
};