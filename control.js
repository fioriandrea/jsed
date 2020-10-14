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

class InsertControl {
    constructor() {}

    keyPressed(key, editor) {
        if (insertKeyBindings[key]) {
            insertKeyBindings[key](editor);
        } else {
            let {cursor, lines, screenService} = editor;
            lines.insertCharacters(cursor.row, cursor.column, key);
            cursor.column++;
            screenService.adjustScreenOffset(cursor);
        }
    }
}

class NormalControl {
    constructor(delay=1000) {
        this.timeout = new Timeout(delay);
        this.keyChordControl = new KeyChordControl(normalKeyChords);
    }

    keyPressed(key, editor) {
        if (!this.timeout.output()) {
            this.timeout.reset();
            this.keyChordControl.cleanBuffer();
        }
        this.keyChordControl.keyPressed(key, editor);
    }
}

const controls = {
    'insert': new InsertControl(),
    'normal': new NormalControl(1000),
};