let lines;
let cursor;
let screen;
let screenService;
let drawer;

let blinker;

function setup() {
    createCanvas(600, 400);
    lines = new Lines();
    cursor = new Cursor(lines, 0, 0);
    screen = new Screen(width, height, 47, 13);
    screenService = new ScreenService(screen);
    drawer = new Drawer(screenService, cursor, lines);

    blinker = new Blinker(2000);
    window.addEventListener("keydown", e => insertKeyControl(e.key, {cursor, lines, screenService}));
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
