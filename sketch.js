let lines;
let cursor;
let screen;
let screenService;
let editor;
let drawer;

let blinker;

function setup() {
    createCanvas(600, 400);
    lines = new Lines();
    cursor = new Cursor(lines, 0, 0);
    screen = new Screen(width, height, 47, 13);
    screenService = new ScreenService(screen);
    editor = {
        lines,
        cursor,
        mode: 'insert',
    };
    drawer = new Drawer(screenService, cursor, lines);

    blinker = new Blinker(2000);
    window.addEventListener("keydown", e => {
        controls[editor.mode].keyPressed(e.key, editor);
        screenService.adjustScreenOffset(cursor);
    });
}

function draw() {
    background(0);
    if (keyIsPressed) {
        blinker.reset();
        drawer.drawCursor();
    } else {
        if (blinker.output())
            drawer.drawCursor();
    }
    drawer.drawLines();
}
