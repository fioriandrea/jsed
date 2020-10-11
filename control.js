const insertKeyBindings = {
    'ArrowUp': ({cursor,screenService}) => {
        cursor.row--;
        screenService.adjustScreenOffset(cursor);
    },
    'ArrowDown': ({cursor, screenService}) => {
        cursor.row++,
        screenService.adjustScreenOffset(cursor);
    },
    'ArrowLeft': ({cursor, screenService}) => {
        cursor.column--,
        screenService.adjustScreenOffset(cursor);
    },
    'ArrowRight': ({cursor, screenService}) => {
        cursor.column++,
        screenService.adjustScreenOffset(cursor);
    },
    'Backspace': ({cursor, lines, screenService}) => {
        let previousLineLen = lines.raw[cursor.row - 1] ? lines.raw[cursor.row - 1].length : 0;
        if (lines.deleteCharacter(cursor.row, cursor.column, false)) {
            cursor.row--;
            cursor.column = previousLineLen;
        } else {
            cursor.column--;
        }
        screenService.adjustScreenOffset(cursor);
    },
    'Delete': ({cursor, lines}) => lines.deleteCharacter(cursor.row, cursor.column, true),
    'Enter': ({cursor, lines, screenService}) => {
        lines.insertNewLine(cursor.row, cursor.column);
        cursor.row++;
        cursor.column = 0;
        screenService.adjustScreenOffset(cursor);
    },
    'Control': () => {},
    'Alt': () => {},
    'OS': () => {},
    'AltGraph': () => {},
    'Shift': () => {},
    'CapsLock': () => {},
    'Escape': () => {},
    'F1': () => {},
    'F2': () => {},
    'F3': () => {},
    'F4': () => {},
    'F5': () => {},
    'F6': () => {},
    'F7': () => {},
    'F8': () => {},
    'F9': () => {},
    'F10': () => {},
    'Insert': () => {},
};

insertKeyBindings['\n'] = insertKeyBindings['Enter'];
insertKeyBindings['\r'] = insertKeyBindings['Enter'];
insertKeyBindings['Return'] = insertKeyBindings['Enter'];

const insertKeyControl = (key, editor) => {
    if (insertKeyBindings[key]) {
        insertKeyBindings[key](editor);
    } else {
        let {cursor, lines, screenService} = editor;
        lines.insertCharacters(cursor.row, cursor.column, key);
        cursor.column++;
        screenService.adjustScreenOffset(cursor);
    }
};

const commandControl = (keys, commands, editor) => {
    // todo
    /*
        {
            'd': {
                sons: {
                    'd': {
                        action: deleteLine,
                        sons: {},
                    },
                },
            },
        }
    */
    let node = commands[keys[0]];
    for (let i = 1; i < keys.length && node !== undefined; i++) {
        node = node.sons[keys[i]];
    }

    if (node !== undefined)
        node.action(editor);
};