let lines;
let cursor;
let screen;
let drawer;

let blinker;

function setup() {
    createCanvas(600, 400);
    lines = new Lines();
    cursor = new Cursor(lines, 0, 0);
    screen = new Screen(width, height, 47, 13);
    drawer = new Drawer(screen, cursor, lines);

    blinker = new Blinker(2000);
    window.addEventListener("keydown", e => insertKeyControl(e.key, {cursor, lines}));
}

function draw() {
    background(0);
    if (keyIsPressed) {
        blinker.reset();
        drawer.drawCursor();
    } else {
        blinker.execute(() => drawer.drawCursor());
    }
    drawer.drawLines();
}
