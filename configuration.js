const cursorColor = 'rgb(255, 255, 255)';
const backgroundColor = 'rgb(0, 0, 0)';
const textColor = 'rgb(255, 255, 255)';
const tildeColor = 'rgb(200, 200, 200)';
const numberColor = 'rgb(255, 255, 255)';

const baseFontSize = 20;
const columnSize = 13;
const rowSize = 30;

const blinkPeriod = 2000;
const chordDelay = 1000;

const insertKeyBindings = {
        'ArrowUp': ({cursor}) => cursor.row--,
        'ArrowDown': ({cursor}) => cursor.row++,
        'ArrowLeft': ({cursor}) => cursor.column--,
        'ArrowRight': ({cursor}) => cursor.column++,
        'Backspace': ({cursor, lines}) => {
                let previousLineLen = lines.raw[cursor.row - 1] ? lines.raw[cursor.row - 1].length : 0;
                if (lines.deleteCharacter(cursor.row, cursor.column, false) === '\n') {
                        cursor.row--;
                        cursor.column = previousLineLen;
                } else {
                        cursor.column--;
                }
        },
        'Delete': ({cursor, lines}) => lines.deleteCharacter(cursor.row, cursor.column, true),
        'Enter': ({cursor, lines}) => {
                lines.insertNewLine(cursor.row, cursor.column);
                cursor.row++;
                cursor.column = 0;
        },
        'Escape': (editor) => editor.mode = 'normal',
        'Control': () => {},
        'Alt': () => {},
        'OS': () => {},
        'AltGraph': () => {},
        'Shift': () => {},
        'CapsLock': () => {},
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

const normalKeyChords = new TagTrie();
normalKeyChords.addNode(['i'], (editor) => editor.mode = 'insert');
normalKeyChords.addNode(['d', 'd'], ({cursor, lines}) => {
        lines.deleteLines(cursor.row);
        cursor.handleEdges();
});
normalKeyChords.addNode(['d', 'w'], ({cursor, lines}) => {
        lines.deleteWords(cursor.row, cursor.column, 1, true);
});
normalKeyChords.addNode(['d', 'b'], ({cursor, lines}) => {
        lines.deleteWord(cursor.row, cursor.column, false);
        cursor.handleEdges();
});
normalKeyChords.addNode(['k'], ({cursor}) => cursor.row--);
normalKeyChords.addNode(['j'], ({cursor}) => cursor.row++);
normalKeyChords.addNode(['h'], ({cursor}) => cursor.column--);
normalKeyChords.addNode(['l'], ({cursor}) => cursor.column++);
normalKeyChords.addNode(['x'], ({cursor, lines}) => {
        lines.deleteCharacter(cursor.row, cursor.column, true);
});
normalKeyChords.addNode(['s'], (editor) => {
        const {cursor, lines} = editor;
        lines.deleteCharacter(cursor.row, cursor.column, true);
        editor.mode = 'insert';
});
normalKeyChords.addNode(['a'], (editor) => {
        editor.cursor.column++;
        editor.mode = 'insert';
});
normalKeyChords.addNode(['^'], ({cursor}) => {
        cursor.column = 0;
});
normalKeyChords.addNode(['$'], ({cursor, lines}) => {
        cursor.column = lines.getColumns(cursor.row);
});
normalKeyChords.addNode(['I'], (editor) => {
        normalKeyChords.getNode(['^']).payload(editor);
        editor.mode = 'insert';
});
normalKeyChords.addNode(['A'], (editor) => {
        normalKeyChords.getNode(['$']).payload(editor);
        editor.mode = 'insert';
});
normalKeyChords.addNode(['o'], (editor) => {
        const {cursor, lines} = editor;
        lines.insertLine(cursor.row + 1);
        cursor.row++;
        cursor.column = 0;
        editor.mode = 'insert';
});
normalKeyChords.addNode(['O'], (editor) => {
        const {cursor, lines} = editor;
        lines.insertLine(cursor.row);
        cursor.row;
        cursor.column = 0;
        editor.mode = 'insert';
});
normalKeyChords.addNode(['g', 'g'], ({cursor}) => {
        cursor.row = 0;
        cursor.column = 0;
});
normalKeyChords.addNode(['G'], ({cursor, lines}) => {
        cursor.row = lines.getRows() - 1;
        cursor.column = lines.getColumns(cursor.row);
});