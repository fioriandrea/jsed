let lines;
let cursor;
let screen;
let screenService;
let editor;
let drawer;

let blinker;
let keyRecorder;

let hrcanvas;

const width = () => Math.max(100, getWindowWidth());
const height = () => Math.max(100, getWindowHeight());

function updateScreenData() {
    screenService.adjustScreen(editor);
}

function windowResized() {
    hrcanvas.setSize(width(), height());
    screen.width = width();
    screen.height = height();
    updateScreenData();
    screenService.adjustScreenLines();
    drawEditor();
}

function setup() {
    hrcanvas = new HRCanvas(appendCanvas(), width(), height());

    lines = new Lines();
    cursor = new Cursor(lines, 0, 0);
    visualTrail = new VisualTrail(cursor);
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
                this.cursor.trailingColumns = 1;
            else
                this.cursor.trailingColumns = 0;
            this.cursor.handleEdges();
        }
    };
    screenService = new ScreenService(screen, editor);
    drawer = new Drawer(screenService, editor, hrcanvas);

    blinker = new Blinker(blinkPeriod);
    keyRecorder = new KeyRecorder();
    keyRecorder.bind(window);
    window.addEventListener("keydown", e => {
        controls[editor.mode].keyPressed(e.key, editor);
        updateScreenData();
    });
    window.addEventListener("resize", windowResized);
}

function drawEditor() {
    hrcanvas.context2d.fillStyle = backgroundColor;
    hrcanvas.context2d.fillRect(0, 0, hrcanvas.width, hrcanvas.height);

    if (keyRecorder.isKeyDown()) {
        blinker.reset();
        drawer.drawCursor();
    } else {
        if (blinker.output())
            drawer.drawCursor();
    }
    drawer.drawLines();
    drawer.drawLineNumbers();
    drawer.drawTildes();
    drawer.drawVisualTrail();
}

function draw() {
    drawEditor();

    window.requestAnimationFrame(draw);
}

setup();
window.requestAnimationFrame(draw);