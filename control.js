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