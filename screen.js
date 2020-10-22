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

    get firstWritableRow() {
        return -this._rowOffset;
    }

    get lastWritableRow() {
        return -this._rowOffset + this._nrows - 1;
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

class ScreenLines {
    constructor(screen, lines) {
        this.screen = screen;
        this.lines = lines;
        this.lines.addObserver(this);
        this.raw = this.computeRaw();
    }

    getSpanningLines(row) {
        return this.raw[row][1] - this.raw[row][0] + 1;
    }    

    findRowContainingScreenRow(sr) {
        let left = 0;
        let right = this.raw.length - 1;
        let middle = (left + right) >>> 1;

        while (left <= right) {
            if (this.raw[middle][0] > sr) 
                right = middle - 1;
            else if (this.raw[middle][1] < sr)
                left = middle + 1;
            else 
                return middle;
            middle = (left + right) >>> 1;
        }

        return -1;
    }

    computeScreenLine(row) {
        let start = row === 0 ? 0 : this.raw[row - 1][1] + 1;
        let occupiedRows = Math.max(1, Math.ceil(this.lines.getColumns(row) / this.screen.nwritableColumns));
        let end = occupiedRows + start - 1;
        return [start, end];
    }

    computeRaw() {
        this.raw = [];
        for (let i = 0; i < this.lines.getRows(); i++)
            this.raw.push(this.computeScreenLine(i));
        return this.raw;
    }

    respondToNotify(payload) {
        this.modify(payload.modify);
        this.delete(payload.delete);
        this.insert(payload.insert);
    }

    modify(rows) {
        if (!rows)
            return;
        rows.forEach(e => {
            let newScreenLine = this.computeScreenLine(e);
            if (newScreenLine[1] !== this.raw[e][1]) {
                let takenLines = newScreenLine[1] - this.raw[e][1];
                for (let i = e + 1; i < this.raw.length; i++) {
                    this.raw[i][0] += takenLines;
                    this.raw[i][1] += takenLines;
                }
            }
            this.raw[e] = newScreenLine;
        });
    }

    delete(rows) {
        if (!rows)
            return;
        rows.forEach(e => {
            let spanningLines = this.getSpanningLines(e);
            for (let i = e + 1; i < this.raw.length; i++) {
                this.raw[i][0] -= spanningLines;
                this.raw[i][1] -= spanningLines;
            }
        });
        rows.forEach(e => this.raw.splice(e, 1));
    }

    insert(rows) {
        if (!rows)
            return;
        rows.forEach(e => {
            this.raw.splice(e, 0, this.computeScreenLine(e))
            let spanningLines = this.getSpanningLines(e);
            for (let i = e + 1; i < this.raw.length; i++) {
                this.raw[i][0] += spanningLines;
                this.raw[i][1] += spanningLines;
            }
        });
    }
}

class ScreenService {
    constructor(screen, editor) {
        this.screen = screen;
        this.editor = editor;
        this.screenLines = new ScreenLines(screen, editor.lines);
    }

    fromWritableToAbsolute({row, column}) {
        return {
            row,
            column: column + this.screen.leftPadding,
        }
    }

    fromLogicToWritable(cell) {
        let [startLine, endLine] = this.screenLines.raw[cell.row];
        let column = cell.column % this.screen.nwritableColumns;
        let row = startLine + Math.floor(this.editor.cursor.column / this.screen.nwritableColumns);
        return {row, column};
    }
    
    getCursorScreenPosition() {
        let {row, column} = this.fromLogicToWritable(this.editor.cursor);
        return this.fromWritableToAbsolute({column, row});
    }

    getLinesScreenPositionsBetween(firstRow, firstColumn, lastRow, lastColumn) {
        let result = [];
        for (let i = firstRow; i <= lastRow && this.screenLines.raw[i][0] <= this.screen.lastWritableRow; i++) {
            for (let j = 0, column = 0, row = this.screenLines.raw[i][0]; j <= this.editor.lines.getColumns(i) - 1 && row <= this.screen.lastWritableRow; j++, column++) {
                if (column !== 0 && column % this.screen.nwritableColumns === 0) {
                    row++;
                    column = 0;
                }

                if (i === firstRow && j < firstColumn)
                    continue;
                else if (i === lastRow && j > lastColumn)
                    break;

                result.push({
                    character: this.editor.lines.getCharacter(i, j),
                    position: this.fromWritableToAbsolute({row, column}),
                });
            }
        }
        return result;
    }

    getLinesScreenPositions() {
        let firstRow = this.screenLines.findRowContainingScreenRow(this.screen.firstWritableRow);
        let firstColumn = 0;
        let lastRow = this.screenLines.raw.length - 1;
        let lastColumn = this.editor.lines.getColumns(lastRow) - 1;
        return this.getLinesScreenPositionsBetween(firstRow, firstColumn, lastRow, lastColumn);
    }

    getVisualTrailPositions() {
        let first = this.editor.visualTrail.getStart();
        let second = this.editor.visualTrail.getEnd();
        let lineScreenPositions = this.getLinesScreenPositionsBetween(first.row, first.column, second.row, second.column);
        return lineScreenPositions.map(e => e.position);
    }

    getNumbersPositions() {
        let firstRow = this.screenLines.findRowContainingScreenRow(this.screen.firstWritableRow);
        let lastRow = this.screenLines.raw.length - 1;
        let result = [];
        for (let i = firstRow; i <= lastRow && this.screenLines.raw[i][0] <= this.screen.lastWritableRow; i++) {
            result.push({
                screenRow: this.screenLines.raw[i][0],
                row: i,
            });
        }
        return result;
    }

    cellToPixels(column, row) {
        return {
            x: this.screen.columnSize * column,
            y: this.screen.rowSize * (row + this.screen.rowOffset),
        }
    }

    cellToTextPixels(column, row) {
        let ctp = this.cellToPixels(column, row);
        ctp.y += this.screen.rowSize / 2;
        return ctp;
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

    adjustScreenLines() {
        this.screenLines.raw = this.screenLines.computeRaw();
    }

    adjustScreen(editor) {
        const {cursor, lines} = editor;
        this.adjustScreenOffset({cursor});
        this.adjustLeftPadding({lines});
    }
}

class Drawer {
    constructor(screenService, editor, hrcanvas) {
        this.screenService = screenService;
        this.editor = editor;
        this.canvas = hrcanvas;
    }

    setFont() {
        this.canvas.context2d.font = `${baseFontSize}px monospace`;
        this.canvas.context2d.textAlign = 'left';
        this.canvas.context2d.textBaseline = 'middle';
    }

    drawLineNumbers() {
        this.setFont();
        this.canvas.context2d.fillStyle = numberColor;
        let numberDrawData = this.screenService.getNumbersPositions();
        numberDrawData
        .forEach(e => {
            const {x, y} = this.screenService.cellToTextPixels(e.row === this.editor.cursor.row ? 0 : 1, e.screenRow);
            this.canvas.context2d.fillText(e.row, x, y, this.screenService.screen.columnSize * `${e.row}`.length);
        });
    }

    drawTildes() {
        this.setFont();
        this.canvas.context2d.fillStyle = tildeColor;
        let numberDrawData = this.screenService.getNumbersPositions();
        let tildeIndex = numberDrawData[numberDrawData.length - 1].screenRow + 1; 
        while (tildeIndex <= this.screenService.screen.lastWritableRow) {
            const {x, y} = this.screenService.cellToTextPixels(0, tildeIndex++);
            this.canvas.context2d.fillText('~', x, y, this.screenService.screen.columnSize);
        }
    }

    drawVisualTrail() {
        if (this.editor.mode !== 'visual') 
            return;
        this.canvas.context2d.fillStyle = visualTrailColor;
        let visualTrailDrawData = this.screenService.getVisualTrailPositions();
        visualTrailDrawData.forEach(e => {
            const {x, y} = this.screenService.cellToPixels(e.column, e.row);
            this.canvas.context2d.fillRect(x, y, this.screenService.screen.columnSize, this.screenService.screen.rowSize);
        });
    }

    drawCursor() {
        this.canvas.context2d.fillStyle = cursorColor;
        const {column, row} = this.screenService.getCursorScreenPosition();
        const {x, y} = this.screenService.cellToPixels(column, row);
        this.canvas.context2d.fillRect(x, y, this.screenService.screen.columnSize, this.screenService.screen.rowSize);
    }

    drawLines() {
        this.setFont();
        this.canvas.context2d.fillStyle = textColor;

        let lineDrawData = this.screenService.getLinesScreenPositions();
        lineDrawData.forEach(e => {
            const {x, y} = this.screenService.cellToTextPixels(e.position.column, e.position.row);
            this.canvas.context2d.fillText(e.character, x, y, this.screenService.screen.columnSize);
        });
    }
}
