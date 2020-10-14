class Screen {
    constructor(width, height, columnSize, rowSize) {
        this._width = width;
        this._height = height;
        this._columnSize = columnSize;
        this._rowSize = rowSize;
        this._rowOffset = 0;
        this.leftPadding = 3;
        this._computeNumberOfCells();
    }

    _computeNumberOfCells() {
        this._ncolumns = Math.floor(this._width / this._columnSize);
        this._nrows = Math.floor(this._height / this._rowSize);
    }

    get nwritableColumns() {
        return this.ncolumns - this.leftPadding;
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

    getNumbersPositions(lines) {
        let result = [];
        for (let i = 0, row = 0; i < lines.getRows(); i++) {
            result.push(row);
            row += Math.max(1, Math.ceil(lines.getColumns(i) / this.screen.nwritableColumns));
        }
        return result;
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
        let lineNumberDigits = `${lines.getRows() - 1}`.length;
        this.screen.leftPadding = lineNumberDigits + 2;
    }

    adjustScreen(editor) {
        const {cursor, lines} = editor;
        this.adjustScreenOffset({cursor});
        this.adjustLeftPadding({lines});
    }
}

class Drawer {
    constructor(screenService, editor) {
        this.screenService = screenService;
        this.editor = editor;
        this.updateDrawData();
    }

    updateDrawData() {
        const {cursor, lines} = this.editor;
        this.cursorDrawData = this.screenService.getCursorScreenPosition(cursor);
        this.lineDrawData = this.screenService.getLinesScreenPositions(lines);
        this.numberDrawData = this.screenService.getNumbersPositions(lines);
    }

    drawLineNumbers() {
        this.numberDrawData
        .forEach((e, i) => {
            const {x, y} = this.screenService.cellToPixels(i === this.editor.cursor.row ? 0 : 1, e);
            text(i, x, y, this.screenService.screen.columnSize, this.screenService.screen.rowSize);
        });
    }

    drawTildes() {
        let tildeIndex = this.numberDrawData[this.numberDrawData.length - 1] + 1; 
        while (tildeIndex < this.screenService.screen.nrows) {
            const {x, y} = this.screenService.cellToPixels(0, tildeIndex++);
            text('~', x, y, this.screenService.screen.columnSize, this.screenService.screen.rowSize);
        }
    }

    drawCursor() {
        fill(100);
        // bottleneck?
        const {x, y} = this.screenService.cellToPixels(this.cursorDrawData.column, this.cursorDrawData.row);
        rect(x, y, this.screenService.screen.columnSize, this.screenService.screen.rowSize);
    }

    drawLines() {
        textFont("monospace");
        textAlign(LEFT, CENTER);
        textSize(20);
        fill(255);

        this.lineDrawData.forEach(e => {
            const {x, y} = this.screenService.cellToPixels(e.position.column, e.position.row);
            text(e.character, x, y, this.screenService.screen.columnSize, this.screenService.screen.rowSize);
        });
    }
}
