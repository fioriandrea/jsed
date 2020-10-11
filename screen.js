class Screen {
    constructor(width, height, ncolumns, nrows) {
        this._width = width;
        this._height = height;
        this._ncolumns = ncolumns;
        this._nrows = nrows;
        this._rowOffset = 0;
        this._computeSize();
    }

    _computeSize() {
        this._columnSize = this._width / this._ncolumns;
        this._rowSize = this._height / this._nrows;
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
    
    getCursorScreenPosition(cursor) {   
        let column = cursor.column % this.screen.ncolumns;
        let row = Math.floor(cursor.column / this.screen.ncolumns);

        for (let i = 0; i < cursor.row; i++) {
            row += Math.max(1, Math.ceil(cursor.lines.getColumns(i) / this.screen.ncolumns));
        }

        return {column, row};
    }

    getLinesScreenPositions(lines) {
        let result = [];
        for (let i = 0, row = 0; i < lines.getRows(); i++, row++) {      
            for (let j = 0, column = 0; j < lines.getColumns(i); j++, column++) {
                if (column !== 0 && column % this.screen.ncolumns === 0) {
                    row++;
                    column = 0;
                }
                result.push({character: lines.getCharacter(i, j), row, column});
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

    adjustScreenOffset(cursor) {
        let {row: screenRow} = this.getCursorScreenPosition(cursor);
        if (screenRow + this.screen.rowOffset >= this.screen.nrows)
            this.screen.rowOffset--;
        else if (screenRow + this.screen.rowOffset < 0)
            this.screen.rowOffset++;
    }
}

class Drawer {
    constructor(screenService, cursor, lines) {
        this.screenService = screenService;
        this.cursor = cursor;
        this.lines = lines;
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
            const {x, y} = this.screenService.cellToPixels(e.column, e.row);
            text(e.character, x, y, this.screenService.screen.columnSize, this.screenService.screen.rowSize);
        });
    }
}
