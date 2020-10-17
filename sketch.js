let lines;
let cursor;
let screen;
let screenService;
let editor;
let drawer;

let blinker;
let keyRecorder;

let hrcanvas;

function updateScreenData() {
    screenService.adjustScreen(editor);
}

function windowResized() {
    hrcanvas.setSize(getWindowWidth(), getWindowHeight());
    screen.width = getWindowWidth();
    screen.height = getWindowHeight();
    updateScreenData();
    drawEditor();
}

function setup() {
    hrcanvas = new HRCanvas(appendCanvas(), getWindowWidth(), getWindowHeight());

    lines = new Lines();
    cursor = new Cursor(lines, 0, 0);
    screen = new Screen(hrcanvas.width, hrcanvas.height, columnSize, rowSize);
    editor = {
        lines,
        cursor,
        mode: 'insert',
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
}

function draw() {
    drawEditor();

    window.requestAnimationFrame(draw);
}

setup();
window.requestAnimationFrame(draw);