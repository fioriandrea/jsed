// Lines is an array of char arrays.
// Each subarray represents a line of text

class Cursor {
    constructor(lines, column=0, row=0) {
        this.screen = screen;
        this.lines = lines;
        this._column = column;
        this._row = row;
        this._handleEdges();
    }

    get row() {
        return this._row;
    }

    set row(r) {
        this._row = r;
        this._handleEdges();
    }

    get column() {
        return this._column;
    }

    set column(c) {
        this._column = c;
        this._handleEdges();
    }

    _handleEdges() {
        this._row = Math.max(this._row, 0);
        this._row = Math.min(this._row, this.lines.length - 1);
        this._column = Math.max(this._column, 0);
        this._column = Math.min(this._column , this.lines[this._row].length);
    }
}
