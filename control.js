class KeyChordControl {
    constructor(keyChords) {
        this.keyChords = keyChords;
        this.keyBuffer = [];
    }

    keyPressed(key, editor) {
        this.keyBuffer.push(key);
        let node = this.keyChords.getNode(this.keyBuffer);
        if (node && node.payload) {
            node.payload(editor);
            if (isObjEmpty(node.sons))
                this.cleanBuffer();
        }
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

const insertControl = new InsertControl();