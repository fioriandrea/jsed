class Lines {
    constructor(raw=[[]]) {
        this.raw = raw;
    }

    getCharacter(row, column) {
        return this.raw[row][column];
    }

    getRows() {
        return this.raw.length;
    }

    getColumns(row) {
        return this.raw.length ? this.raw[row].length : 0;
    }

    insertCharacters(row, pos, ...chars) {
        this.raw[row].splice(pos, 0, ...chars);
    }

    insertLine(row, chars=[]) {
        this.raw.splice(row, 0, chars);
    }
    
    insertNewLine(row, pos) {
        this.insertLine(row + 1);
        for (let i = pos; i < this.raw[row].length; i++) {
            this.raw[row + 1].push(this.raw[row][i]);
        }
        this.raw[row].splice(pos);
    }

    joinRows(row0, row1) {
        if (row0 < 0 || row1 >= this.getRows())
            return;
        this.raw[row0].push(...this.raw[row1]);
        this.raw.splice(row1, 1);
    }

    deleteCharacter(row, start, forwards=true) {
        return forwards ? this._deleteCharacterForwards(row, start) :
         this._deleteCharacterBackwards(row, start);
    }

    deleteLines(start, count=1, forwards=true) {
        if (this.raw.length === 1) {
            let toReturn = this.raw[0];
            this.raw[0] = [];
            return toReturn;
        } else {
            return forwards ? this._deleteLinesForwards(start, count) :
                this._deleteLinesBackwards(start, count);
        }
    }

    _deleteCharacterForwards(row, start) {
        if (this.raw[row].length === start) {
            this.joinRows(row, row + 1);
            return '\n';
        } else {
            return this.raw[row].splice(start, 1);
        }
    }

    _deleteCharacterBackwards(row, start) {
        if (start === 0) {
            this.joinRows(row - 1, row);
            return '\n';
        } else {
            return this.raw[row].splice(start - 1, 1);
        }
    }

    _deleteLinesForwards(start, count=1) {
        return this.raw.splice(start, count);
    }

    _deleteLinesBackwards(start, count=1) {
        return this.raw.splice(start - count, count);
    }
}

class Cursor {
    constructor(lines, column=0, row=0) {
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
        this._row = Math.min(this._row, this.lines.getRows() - 1);
        this._column = Math.max(this._column, 0);
        this._column = Math.min(this._column, this.lines.getColumns(this._row));
    }
}
