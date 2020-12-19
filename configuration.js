const cursorColor = 'rgb(255, 255, 255)';
const backgroundColor = 'rgb(0, 0, 0)';
const textColor = 'rgb(255, 255, 255)';
const tildeColor = 'rgb(200, 200, 200)';
const numberColor = 'rgb(255, 255, 255)';
const visualTrailColor = 'rgba(255 , 255, 0, 0.3)';

const baseFontSize = 20;
const columnSize = 13;
const rowSize = 30;

const blinkPeriod = 2000;
const chordDelay = 1000;

const insertKeyChords = new TagTrie();
insertKeyChords.addNode(['ArrowUp'], ({ cursor }) => cursor.row--);
insertKeyChords.addNode(['ArrowDown'], ({ cursor }) => cursor.row++);
insertKeyChords.addNode(['ArrowLeft'], ({ cursor }) => cursor.column--);
insertKeyChords.addNode(['ArrowRight'], ({ cursor }) => cursor.column++);
insertKeyChords.addNode(['Backspace'], ({ cursor, lines }) => {
    let previousLineLen = lines.getLine(cursor.row - 1) ? lines.getLineLength(cursor.row - 1) : 0;
    // if was at start of line
    if (lines.deleteChars(cursor.row, cursor.column, 1, false).length === 0) {
        cursor.row--;
        cursor.column = previousLineLen;
    } else {
        cursor.column--;
    }
});
insertKeyChords.addNode(['Delete'], ({ cursor, lines }) => lines.deleteChars(cursor.row, cursor.column, 1, true));
insertKeyChords.addNode(['Enter'], ({ cursor, lines }) => {
    lines.insertNewLine(cursor.row, cursor.column);
    cursor.row++;
    cursor.column = 0;
});
insertKeyChords.addNode(['\n'], insertKeyChords.getNode(['Enter']).payload);
insertKeyChords.addNode(['\r'], insertKeyChords.getNode(['Enter']).payload);
insertKeyChords.addNode(['Return'], insertKeyChords.getNode(['Enter']).payload);
insertKeyChords.addNode(['Escape'], (editor) => editor.mode = 'normal');
insertKeyChords.addNode(['Control'], () => { });
insertKeyChords.addNode(['Alt'], () => { });
insertKeyChords.addNode(['OS'], () => { });
insertKeyChords.addNode(['AltGraph'], () => { });
insertKeyChords.addNode(['Shift'], () => { });
insertKeyChords.addNode(['CapsLock'], () => { });
insertKeyChords.addNode(['F1'], () => { });
insertKeyChords.addNode(['F2'], () => { });
insertKeyChords.addNode(['F3'], () => { });
insertKeyChords.addNode(['F4'], () => { });
insertKeyChords.addNode(['F5'], () => { });
insertKeyChords.addNode(['F6'], () => { });
insertKeyChords.addNode(['F7'], () => { });
insertKeyChords.addNode(['F8'], () => { });
insertKeyChords.addNode(['F9'], () => { });
insertKeyChords.addNode(['F10'], () => { });
insertKeyChords.addNode(['Insert'], () => { });

const movementKeyChords = new TagTrie();
movementKeyChords.addNode(['k'], ({ cursor }) => cursor.row--);
movementKeyChords.addNode(['j'], ({ cursor }) => cursor.row++);
movementKeyChords.addNode(['h'], ({ cursor }) => cursor.column--);
movementKeyChords.addNode(['l'], ({ cursor }) => cursor.column++);
movementKeyChords.addNode(['g', 'g'], ({ cursor }) => {
    cursor.row = 0;
    cursor.column = 0;
});
movementKeyChords.addNode(['G'], ({ cursor, lines }) => {
    cursor.row = lines.length - 1;
    cursor.column = lines.getLineLength(cursor.row);
});
movementKeyChords.addNode(['^'], ({ cursor }) => {
    cursor.column = 0;
});
movementKeyChords.addNode(['$'], ({ cursor, lines }) => {
    cursor.column = lines.getLineLength(cursor.row);
});

const normalKeyChords = new TagTrie();
normalKeyChords.merge(movementKeyChords);
normalKeyChords.addNode(['i'], (editor) => editor.mode = 'insert');
normalKeyChords.addNode(['v'], (editor) => {
    editor.mode = 'visual';
    editor.visualTrail.start = { row: cursor.row, column: cursor.column };
});
normalKeyChords.addNode(['d', 'd'], ({ cursor, lines }) => {
    const deleted = lines.deleteLines(cursor.row, 1);
    Clipboard.write(deleted);
    cursor.handleEdges();
});
normalKeyChords.addNode(['y', 'y'], ({ cursor, lines }) => {
    const copied = lines.getLine(cursor.row).clone();
    Clipboard.write(new Lines([copied]));
});
normalKeyChords.addNode(['d', 'w'], ({ cursor, lines }) => {
    const deleted = lines.deleteWord(cursor.row, cursor.column);
    Clipboard.write(deleted);
});
normalKeyChords.addNode(['d', 'b'], ({ cursor, lines }) => {
    const deleted = lines.deleteWord(cursor.row, cursor.column, false);
    Clipboard.write(deleted);
    cursor.handleEdges();
});
normalKeyChords.addNode(['x'], ({ cursor, lines }) => {
    const deleted = lines.deleteChars(cursor.row, cursor.column, 1, true);
    cursor.handleEdges();
    Clipboard.write(deleted);
});
normalKeyChords.addNode(['s'], (editor) => {
    editor.mode = 'insert';
    const { cursor, lines } = editor;
    const deleted = lines.deleteChars(cursor.row, cursor.column, 1, true);
    cursor.handleEdges();
    Clipboard.write(deleted);
});
normalKeyChords.addNode(['a'], (editor) => {
    editor.mode = 'insert';
    editor.cursor.column++;
});
normalKeyChords.addNode(['I'], (editor) => {
    editor.mode = 'insert';
    normalKeyChords.getNode(['^']).payload(editor);
});
normalKeyChords.addNode(['A'], (editor) => {
    editor.mode = 'insert';
    normalKeyChords.getNode(['$']).payload(editor);
});
normalKeyChords.addNode(['o'], (editor) => {
    editor.mode = 'insert';
    const { cursor, lines } = editor;
    lines.insertLines(cursor.row + 1);
    cursor.row++;
    cursor.column = 0;
});
normalKeyChords.addNode(['O'], (editor) => {
    editor.mode = 'insert';
    const { cursor, lines } = editor;
    lines.insertLinesArray(cursor.row, [new Line()]);
    cursor.column = 0;
});
normalKeyChords.addNode(['p', 'p'], ({ lines, cursor }) => {
    const text = Clipboard.read();
    lines.insertLines(cursor.row + 1, text);
    cursor.row++;
    cursor.column = 0;
});
normalKeyChords.addNode(['P', 'P'], ({ lines, cursor }) => {
    const text = Clipboard.read();
    lines.insertLines(cursor.row, text);
    cursor.column = 0;
});
normalKeyChords.addNode(['w', 'w'], ({ lines }) => {
    downloadTextFile(lines.toString());
});

const visualKeyChords = new TagTrie();
visualKeyChords.merge(movementKeyChords);
visualKeyChords.addNode(['Escape'], (editor) => editor.mode = 'normal');
visualKeyChords.addNode(['d', 'd'], (editor) => {
    editor.mode = 'normal';
    const { lines, visualTrail } = editor;
    let { startRow, startColumn } = visualTrail.start;
    let { endRow, endColumn } = visualTrail.end;
    let chars = lines.deleteCharRange(startRow, startColumn, endRow, endColumn);
    editor.cursor.handleEdges();
    Clipboard.write(chars);
});
visualKeyChords.addNode(['y', 'y'], (editor) => {
    editor.mode = 'normal';
    const { lines, visualTrail } = editor;
    let chars = lines.getCharRange(visualTrail.start, visualTrail.end).clone();
    Clipboard.write(chars);
});