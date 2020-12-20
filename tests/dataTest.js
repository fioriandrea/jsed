print("spliceBothWays tests")

it("should delete everything (forwards)", () => {
    let arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    spliceBothWays(arr, 0, Infinity, [], true);
    assert(arraysEqual(arr, []));
});

it("should delete everything (backwards)", () => {
    let arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    spliceBothWays(arr, arr.length, Infinity, [], false);
    assert(arraysEqual(arr, []));
});

it("should delete first 2 element (forwards)", () => {
    let arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    spliceBothWays(arr, 0, 2, [], true);
    assert(arraysEqual(arr, [2, 3, 4, 5, 6, 7, 8, 9]));
});

it("should delete first 2 element (backwards)", () => {
    let arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    spliceBothWays(arr, 2, 2, [], false);
    assert(arraysEqual(arr, [2, 3, 4, 5, 6, 7, 8, 9]));
});

it("should insert [-1, -2] at pos 3 (forwards)", () => {
    let arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    spliceBothWays(arr, 3, 0, [-1, -2], true);
    assert(arraysEqual(arr, [0, 1, 2, -1, -2, 3, 4, 5, 6, 7, 8, 9]));
});

it("should insert [-1, -2] at pos 3 (backwards)", () => {
    let arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    spliceBothWays(arr, 3, 0, [-1, -2], false);
    assert(arraysEqual(arr, [0, 1, 2, -1, -2, 3, 4, 5, 6, 7, 8, 9]));
});

it("should insert [-1, -2] at pos 3 deleting 2 elements (forwards)", () => {
    let arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    spliceBothWays(arr, 3, 2, [-1, -2], true);
    assert(arraysEqual(arr, [0, 1, 2, -1, -2, 5, 6, 7, 8, 9]));
});

it("should insert [-1, -2] at pos 3 deleting 2 elements (backwards)", () => {
    let arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    spliceBothWays(arr, 3, 2, [-1, -2], false);
    assert(arraysEqual(arr, [0, -1, -2, 3, 4, 5, 6, 7, 8, 9]));
});

it("should delete out of bounds (backwards)", () => {
    let arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    spliceBothWays(arr, 1, 3, [], false);
    assert(arraysEqual(arr, [1, 2, 3, 4, 5, 6, 7, 8, 9]));
});

it("should handle empty arrays", () => {
    let arr = [];
    spliceBothWays(arr, 100, 100, [], true);
    assert(arraysEqual(arr, []));

    arr = [];
    spliceBothWays(arr, 100, 100, [], false);
    assert(arraysEqual(arr, []));
    
    arr = [];
    spliceBothWays(arr, 100, 100, [1, 2], true);
    assert(arraysEqual(arr, [1, 2]));

    arr = []
    spliceBothWays(arr, 100, 100, [1, 2], false);
    assert(arraysEqual(arr, [1, 2]));
});

print("Line tests")

it("should return line from pos to end (no end given)", () => {
    let line = new Line(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);
    let range = line.getRange(5);
    assert("56789" === range.toString());
});

it("should return in-between range", () => {
    let line = new Line(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);
    let range = line.getRange(3, 7);
    assert("3456" === range.toString());
});

it("should delete in-between chars (forwards)", () => {
    let line = new Line(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);
    let deleted = line.deleteChars(3, 3, true);
    assert("0126789" === line.toString() && "345" === deleted.toString());
});

it("should delete in-between chars (backwards)", () => {
    let line = new Line(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);
    let deleted = line.deleteChars(5, 3, false);
    assert("0156789" === line.toString() && "234" === deleted.toString());
});

it("should get right word end", () => {
    let line = new Line(Array.from("ciao come va? Spero bene"));

    let pos = line.wordEnd(5);
    assert(pos === 9);

    pos = line.wordEnd(4);
    assert(pos === 9);

    pos = line.wordEnd(3);
    assert(pos === 4);
});

it("should return the right next word start", () => {
    let line = new Line(Array.from("ciao come va? Spero bene"));

    let nextWordStart = line.nextWordStart(1);
    assert(nextWordStart === 5);
});

it("should return the right previous word start", () => {
    let line = new Line(Array.from("ciao come va? Spero bene"));

    let previousWordStart = line.previousWordStart(6);
    assert(previousWordStart === 0);

    previousWordStart = line.previousWordStart(4);
    assert(previousWordStart === 0);
});

it("should return the right word start", () => {
    let line = new Line(Array.from("ciao come va? Spero bene"));

    let wordEnd = line.wordStart(7);
    assert(wordEnd === 5);
});

it("should return the right word", () => {
    let line = new Line(Array.from("ciao come va? Spero bene"));

    let word = line.getWord(5);
    assert(word.toString() === "come");

    word = line.getWord(4);
    assert(word.toString() === " come");

    word = line.getWord(3);
    assert(word.toString() === "o");

    word = line.getWord(7, false);
    assert(word.toString() === "co");
});

it("should delete word correctly", () => {
    let line = new Line(Array.from("ciao come va?    Spero bene"));
    let deleted = line.deleteWord(10);
    assert(deleted.toString() === "va?    ");

    line = new Line(Array.from("ciao come va?    Spero bene"));
    deleted = line.deleteWord(10, false);
    assert(deleted.toString() === "come ");
});

print("Lines tests")

const createLines = (strs) => {
    return new Lines(strs.map(e => new Line(Array.from(e))));
};

it("should delete char correctly (forwards)", () => {
    let linesStrings = ["01234", "5678", "9"];

    let lines = createLines(linesStrings);
    lines.deleteChars(0, 1, 3, true);
    assert(lines.toString() === ["04", "5678", "9"].join("\n"));

    lines = createLines(linesStrings);
    lines.deleteChars(0, 1, 4);
    assert(lines.toString() === ["0", "5678", "9"].join("\n"));

    lines = createLines(linesStrings);
    lines.deleteChars(0, 1, 6);
    assert(lines.toString() === ["0678", "9"].join("\n"));
});

it("should delete char correctly (backwards)", () => {
    let linesStrings = ["01234", "5678", "9"];

    let lines = createLines(linesStrings);
    lines.deleteChars(0, 4, 3, false);
    assert(lines.toString() === ["04", "5678", "9"].join("\n"));

    lines = createLines(linesStrings);
    lines.deleteChars(1, 4, 4, false);
    assert(lines.toString() === ["01234", "", "9"].join("\n"));

    lines = createLines(linesStrings);
    lines.deleteChars(1, 4, 5, false);
    assert(lines.toString() === ["01234", "9"].join("\n"));

    lines = createLines(linesStrings);
    lines.deleteChars(1, 4, 6, false);
    assert(lines.toString() === ["0123", "9"].join("\n"));
});

it("should get correct char range", () => {
    let linesStrings = ["01234", "5678", "9"];

    let lines = createLines(linesStrings);
    let linesTaken = lines.getCharRange(0, 1, 0, 2);
    assert(linesTaken.toString() === ["12"].join("\n"));

    linesTaken = lines.getCharRange(0, 1, 1, 1);
    assert(linesTaken.toString() === ["1234", "56"].join("\n"));
});

it ("should get correct lines (length given)", () => {
    let linesStrings = ["01234", "5678", "9"];

    let lines = createLines(linesStrings);
    let linesTaken = lines.getLinesLength(0, 1, 2);
    assert(linesTaken.toString() === ["12"].join("\n"));

    linesTaken = lines.getLinesLength(0, 1, 6);
    assert(linesTaken.toString() === ["1234", "56"].join("\n"));
});