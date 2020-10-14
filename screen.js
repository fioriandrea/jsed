class Screen {
    constructor(width, height, ncolumns, nrows) {
        this._width = width;
        this._height = height;
        this._ncolumns = ncolumns;
        this._nrows = nrows;
        this._rowOffset = 0;
        this.leftPadding = 3;
        this._computeSize();
    }

    _computeSize() {
        this._columnSize = this._width / this._ncolumns;
        this._rowSize = this._height / this._nrows;
    }

    get nwritableColumns() {
        return this.ncolumns - this.leftPadding;
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

    get rowOffset() {
        return this._rowOffset;
    }

    set rowOffset(ro) {
        this._rowOffset = Math.min(0, ro);
    }
}

class ScreenService {
    constructor(screen) {
        this.screen = screen;
    }

    fromWritableToAbsolute({row, column}) {
        return {
            row,
            column: column + this.screen.leftPadding,
        }
    }
    
    getCursorScreenPosition(cursor) {   
        let column = cursor.column % this.screen.nwritableColumns;
        let row = Math.floor(cursor.column / this.screen.nwritableColumns);

        for (let i = 0; i < cursor.row; i++) {
            row += Math.max(1, Math.ceil(cursor.lines.getColumns(i) / this.screen.nwritableColumns));
        }

        return this.fromWritableToAbsolute({column, row});
    }

    getLinesScreenPositions(lines) {
        let result = [];
        for (let i = 0, row = 0; i < lines.getRows(); i++, row++) {      
            for (let j = 0, column = 0; j < lines.getColumns(i); j++, column++) {
                if (column !== 0 && column % this.screen.nwritableColumns === 0) {
                    row++;
                    column = 0;
                }
                result.push({
                    character: lines.getCharacter(i, j),
                    position: this.fromWritableToAbsolute({row, column}),
                });
            }
        }
        return result;
    }

    cellToPixels(column, row) {
        return {
            x: this.screen.columnSize * column,
            y: this.screen.rowSize * (row + this.screen.rowOffset),
        }
    }

    adjustScreenOffset({cursor}) {
        let {row: screenRow} = this.getCursorScreenPosition(cursor);
        if (screenRow + this.screen.rowOffset >= this.screen.nrows)
            this.screen.rowOffset = this.screen.nrows - screenRow - 1;
        else if (screenRow + this.screen.rowOffset < 0)
            this.screen.rowOffset = -screenRow;
    }

    adjustLeftPadding({lines}) {
        let lineNumberDigits = `${lines.getRows()}`.length;
        this.screen.leftPadding = lineNumberDigits + 2;
    }

    adjustScreen(editor) {
        const {cursor, lines} = editor;
        this.adjustScreenOffset({cursor});
        this.adjustLeftPadding({lines});
    }
}

class Drawer {
    constructor(screenService, cursor, lines) {
        this.screenService = screenService;
        this.cursor = cursor;
        this.lines = lines;
    }

    drawLineNumbers() {
        for (let i = 0; i < this.lines.getRows(); i++) {
            const {x, y} = this.screenService.cellToPixels(i === this.cursor.row ? 1 : 0, i);
            text(i, x, y, this.screenService.screen.columnSize, this.screenService.screen.rowSize);
        }
    }

    drawCursor() {
        fill(100);
        // bottleneck?
        let pos = this.screenService.getCursorScreenPosition(this.cursor);
        const {x, y} = this.screenService.cellToPixels(pos.column, pos.row);
        rect(x, y, this.screenService.screen.columnSize, this.screenService.screen.rowSize);
    }

    drawLines() {
        textFont("monospace");
        textAlign(LEFT, CENTER);
        textSize(20);
        fill(255);

        const lineScreenPositions = this.screenService.getLinesScreenPositions(this.lines);
        lineScreenPositions.forEach(e => {
            const {x, y} = this.screenService.cellToPixels(e.position.column, e.position.row);
            text(e.character, x, y, this.screenService.screen.columnSize, this.screenService.screen.rowSize);
        });
    }
}
