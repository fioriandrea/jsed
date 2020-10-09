let lines;
let cursor;
let screen;
let insertControl;
let drawer;

let blinker;
let cooldown;
let startcooldown;

let previousKey = null;

function setup() {
    createCanvas(400, 400);

    lines = [["c"], ["c", "i", "a", "o"], [], ["c", "i", "l", "a", "c", "c", "a"], ["c", "0", "m", "e"],];
    cursor = new Cursor(lines, 0, 0);
    screen = new Screen(width, height, 35, 13);
    insertControl = new InsertControl(screen, cursor, lines);
    drawer = new Drawer(screen, cursor, lines);

    blinker = new Blinker(2000);
    cooldown = new CoolDown(40);
    startcooldown = new StartCoolDown(500);
}

function draw() {
    background(0);

    blinker.execute(() => drawer.drawCursor());
    drawer.drawLines();

    if (keyIsPressed) {
        startcooldown.execute(() => cooldown.execute(() => insertControl.handleKey(key)));
    } else {
        startcooldown.reset();
    }
}
