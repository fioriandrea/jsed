class Screen {
    constructor(width, height, ncolumns, nrows) {
        this._width = width;
        this._height = height;
        this._ncolumns = ncolumns;
        this._nrows = nrows;
        this._computeSize();
    }

    _computeSize() {
        this._columnSize = Math.floor(this._width / this._ncolumns);
        this._rowSize = Math.floor(this._height / this._nrows);
    }

    get width() {
        return this._width;
    }

    set width(w) {
        this._width = w;
        this._computeSize();
    }

    get height() {
        return this._height;
    }

    set height(h) {
        this._height = h;
        this._computeSize();
    }

    get ncolumns() {
        return this._ncolumns;
    }

    set ncolumns(n) {
        this._ncolumns = n;
        this._computeSize();
    }

    get nrows() {
        return this._nrows;
    }

    set nrows(n) {
        this._nrows = n;
        this._computeSize();
    }

    get rowSize() {
        return this._rowSize;
    }

    get columnSize() {
        return this._columnSize;
    }

    cellToPixels(column, row) {
        return {
            x: this.columnSize * column,
            y: this.rowSize * row,
        }
    }

    pixelsToCell(x, y) {
        return {
            column: Math.floor(x / this.columnSize),
            row: Math.floor(y / this.columnSize),
        };  
    }

    getCursorScreenPosition(cursor, lines) {   
        let column = cursor.column % this.ncolumns;
        let row = Math.floor(cursor.column / this.ncolumns);

        for (let i = 0; i < cursor.row; i++) {
            row += Math.max(1, Math.ceil(lines[i].length / this.ncolumns));
        }

        return {column, row};
    }
}

class Drawer {
    constructor(screen, cursor, lines) {
        this.screen = screen;
        this.cursor = cursor;
        this.lines = lines;
    }

    drawCursor() {
        fill(100);
        // bottleneck?
        let pos = this.screen.getCursorScreenPosition(this.cursor, this.lines);
        const {x, y} = this.screen.cellToPixels(pos.column, pos.row);
        rect(x, y, this.screen.columnSize, this.screen.rowSize);
    }

    drawLines() {
        textFont("monospace");
        textAlign(LEFT, CENTER);
        textSize(20);
        fill(255);

        for (let i = 0, row = 0; i < this.lines.length; i++, row++) {      
            for (let j = 0, column = 0; j < this.lines[i].length; j++, column++) {
                if (column !== 0 && column % this.screen.ncolumns === 0) {
                    row++;
                    column = 0;
                }
                const {x, y} = this.screen.cellToPixels(column, row);
                text(this.lines[i][j], x, y, this.screen.columnSize, this.screen.rowSize);
            }
        }
    }
}
