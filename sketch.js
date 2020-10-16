let lines;
let cursor;
let screen;
let screenService;
let editor;
let drawer;

let blinker;

function updateScreenData() {
    screenService.adjustScreen(editor);
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    lines = new Lines();
    cursor = new Cursor(lines, 0, 0);
    screen = new Screen(width, height, columnSize, rowSize);
    editor = {
        lines,
        cursor,
        mode: 'insert',
    };
    screenService = new ScreenService(screen, editor);
    drawer = new Drawer(screenService, editor);

    blinker = new Blinker(blinkPeriod);
    window.addEventListener("keydown", e => {
        controls[editor.mode].keyPressed(e.key, editor);
        updateScreenData();
    });
}

function drawEditor() {
    if (keyIsPressed) {
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
    background(backgroundColor);
    drawEditor();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    screen.width = windowWidth;
    screen.height = windowHeight;
    updateScreenData();
    drawEditor();
}
