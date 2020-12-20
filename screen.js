class Screen {
    constructor(width, height, columnSize, rowSize) {
        this._width = width;
        this._height = height;
        this._columnSize = columnSize;
        this._rowSize = rowSize;
        this.leftPadding = 3;
        this._computeNumberOfCells();
    }

    _computeNumberOfCells() {
        this._ncolumns = Math.floor(this._width / this._columnSize);
        this._nrows = Math.floor(this._height / this._rowSize);
    }

    adjustLeftPadding(lines) {
        let lineNumberDigits = `${lines.length - 1}`.length;
        this.leftPadding = lineNumberDigits + 2;
    }

    cellToPixels({ row, column }) {
        return {
            x: this.columnSize * column,
            y: this.rowSize * row,
        };
    };

    writableToAbsolute({ row, column }) {
        return {
            row: row,
            column: column + this.leftPadding,
        };
    }

    get nwritableColumns() {
        return this.ncolumns - this.leftPadding;
    }

    get nwritableRows() {
        return this.nrows;
    }

    get nwritableCells() {
        return this.nwritableColumns * this.nwritableRows;
    }

    get width() {
        return this._width;
    }

    set width(w) {
        this._width = w;
        this._computeNumberOfCells();
    }

    get height() {
        return this._height;
    }

    set height(h) {
        this._height = h;
        this._computeNumberOfCells();
    }

    get ncolumns() {
        return this._ncolumns;
    }

    get nrows() {
        return this._nrows;
    }

    get rowSize() {
        return this._rowSize;
    }

    set rowSize(rs) {
        this._rowSize = rs;
        this._computeNumberOfCells();
    }

    get columnSize() {
        return this._columnSize;
    }

    set columnSize(cs) {
        this._columnSize = cs;
        this._computeNumberOfCells();
    }
}

const wrapWritableCell = (screen, cell) => {
    if (cell.column >= screen.nwritableColumns) {
        cell.row++;
        cell.column = 0;
    }
};

const incrementWritableCell = (screen, cell) => {
    cell.column++;
    return wrapWritableCell(screen, cell);
};

const screenRows = (screen, line) => {
    return Math.ceil((line.length + 1) / screen.nwritableColumns);
};

const makeToDrawCell = (row, start, end) => {
    return {
        row,
        columns: {
            start,
            end,
        },
    };
};

const getToDrawCellWrapper = (toDrawCells) => {
    let screenCell = {
        row: 0,
        column: 0,
    };
    let cells = [];
    for (let toDrawCell of toDrawCells) {
        let cellRow = [];
        for (let column = toDrawCell.columns.start; column <= toDrawCell.columns.end; column++) {
            let toPush = { ...screenCell };
            toPush = screen.writableToAbsolute(toPush);
            cellRow.push(toPush);
            incrementWritableCell(screen, screenCell);
        }
        let eol = { ...screenCell };
        cellRow.push(screen.writableToAbsolute(eol));
        screenCell.row++;
        screenCell.column = 0;
        cells.push(cellRow);
    }

    return (row, column) => {
        let screenRow = row - toDrawCells[0].row;
        let screenColumn = column - toDrawCells[screenRow].columns.start;
        return cells[screenRow][screenColumn];
    };
};

const smallerThanScreenCells = (oldToDraw, { screen, lines, cursor }) => {
    class WrapWindow {
        constructor(screen, lines) {
            this.screen = screen;
            this.lines = lines;
            this.availableRows = this.screen.nwritableRows;
            this.rows = [];
        }

        push(row) {
            this.rows.push(row);
            this.availableRows -= this.screenRows(row);
        }

        pop() {
            let popped = this.rows.pop();
            this.availableRows += this.screenRows(popped);
        }

        unshift(row) {
            this.rows.unshift(row);
            this.availableRows -= this.screenRows(row);
        }

        shift() {
            let shifted = this.rows.shift();
            this.availableRows += this.screenRows(shifted);
        }

        screenRows(row) {
            return screenRows(this.screen, this.lines.getLine(row));
        };

        canFit(row) {
            return this.screenRows(row) <= this.availableRows;
        };
    }

    const wrapWindowForwards = (oldToDraw, {screen, lines, cursor}) => {
        const oldFirst = oldToDraw[0];
        let wrapWindow = new WrapWindow(screen, lines);
        let row = Math.min(cursor.row, oldFirst.row);
        while (row < cursor.row && wrapWindow.canFit(row)) {
            wrapWindow.push(row++);
        }
        while (!wrapWindow.canFit(row)) {
            wrapWindow.shift();
        }
        wrapWindow.push(row++);
        while (row < lines.length && wrapWindow.canFit(row)) {
            wrapWindow.push(row++);
        }
        return wrapWindow;
    };

    const wrapWindowBackwards = (oldToDraw, {screen, lines, cursor}) => {
        const oldLast = oldToDraw[oldToDraw.length - 1];
        let wrapWindow = new WrapWindow(screen, lines);
        let row = Math.max(cursor.row, oldLast.row);
        while (row > cursor.row && wrapWindow.canFit(row)) {
            wrapWindow.unshift(row--);
        }
        while (!wrapWindow.canFit(row)) {
            wrapWindow.pop();
        }
        wrapWindow.unshift(row--);
        while (row >= 0 && wrapWindow.canFit(row)) {
            wrapWindow.unshift(row--);
        }

        let last = wrapWindow.rows[wrapWindow.rows.length - 1] + 1;
        while (last < lines.length && wrapWindow.canFit(last)) {
            wrapWindow.push(last++);
        }
        return wrapWindow;
    };


    const computeWrapWindow = (oldToDraw, {screen, lines, cursor}) => {
        const oldFirst = oldToDraw[0];
        const oldLast = oldToDraw[oldToDraw.length - 1];
        if (cursor.row > oldLast.row) {
            return wrapWindowBackwards(oldToDraw, {screen, lines, cursor});
        } else {
            return wrapWindowForwards(oldToDraw, {screen, lines, cursor});
        }
    };

    return computeWrapWindow(oldToDraw, {screen, lines, cursor})
            .rows
            .map(r => makeToDrawCell(r, 0, lines.getLineLength(r)));
};

const biggerThanScreenCells = (oldToDraw, { screen, cursor }) => {
    if (oldToDraw.length === 1 && cursor.row === oldToDraw[0].row) {
        let oldToDrawCell = oldToDraw[0];
        if (cursor.column < oldToDrawCell.columns.start) {
            oldToDrawCell.columns = {
                start: cursor.column,
                end: cursor.column + screen.nwritableCells,
            };
        } else if (cursor.column > oldToDrawCell.columns.end) {
            oldToDrawCell.columns = {
                start: cursor.column - screen.nwritableCells,
                end: cursor.column,
            };
        }
        return [oldToDrawCell];
    } else {
        return [makeToDrawCell(cursor.row, cursor.column, cursor.column + screen.nwritableCells)];
    }
};

const getToDrawCells = (oldToDraw, { screen, lines, cursor }) => {
    const currentLine = lines.getLine(cursor.row);
    if (screenRows(screen, currentLine) > screen.nwritableRows) {
        return biggerThanScreenCells(oldToDraw, { screen, lines, cursor });
    } else {
        return smallerThanScreenCells(oldToDraw, { screen, lines, cursor });
    }
};