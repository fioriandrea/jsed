let lines;
let cursor;
let screen;
let editor;

let toDrawCells;
let screenLineCells;

let keyRecorder;

let hrcanvas;

const width = () => Math.max(100, getWindowWidth());
const height = () => Math.max(100, getWindowHeight());

function updateScreenData() {
    screen.adjustLeftPadding(lines);
}

function windowResized() {
    hrcanvas.setSize(width(), height());
    screen.width = width();
    screen.height = height();
    updateScreenData();
    drawEditor();
}

function setup() {
    hrcanvas = new HRCanvas(appendCanvas(), width(), height());

    lines = new Lines();
    cursor = new Cursor(lines, 0, 0);
    visualTrail = new VisualTrail();
    visualTrail.end = cursor;
    screen = new Screen(hrcanvas.width, hrcanvas.height, columnSize, rowSize);
    editor = {
        lines,
        cursor,
        visualTrail,
        _mode: 'insert',
        get mode() {
            return this._mode;
        },
        set mode(m) {
            this._mode = m;
            if (m === 'insert')
                this.cursor.trailingColumn = true;
            else
                this.cursor.trailingColumn = false;
            this.cursor.handleEdges();
        },
        screen,
    };
    toDrawCells = getToDrawCells([{
        row: 0, 
        columns: {
            start: 0,
            end: lines.getLine(0).length - 1,
        },
    }], editor);

    keyRecorder = new KeyRecorder();
    keyRecorder.bind(window);
    window.addEventListener("keydown", e => {
        controls[editor.mode].keyPressed(e.key, editor);
        updateScreenData();
        drawEditor();
    });
    window.addEventListener("resize", windowResized);
}

function drawEditor() {
    hrcanvas.context2d.fillStyle = backgroundColor;
    hrcanvas.context2d.fillRect(0, 0, hrcanvas.width, hrcanvas.height);
    setFont(hrcanvas);

    toDrawCells = getToDrawCells(toDrawCells, editor);
    const toDrawCellWrapper = getToDrawCellWrapper(toDrawCells);
    
    drawLines(hrcanvas, editor, toDrawCells, toDrawCellWrapper);
    drawCursor(hrcanvas, editor, toDrawCellWrapper);
    drawLineNumbers(hrcanvas, editor, toDrawCells);
    if (editor.mode === 'visual') {
        drawVisualTrail(hrcanvas, editor, toDrawCells, toDrawCellWrapper);
    }
}

setup();
drawEditor();