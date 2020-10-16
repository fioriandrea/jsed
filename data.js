class Lines extends Observable {
    constructor(raw=[[]]) {
        super();
        this.raw = raw;
    }

    getCharacter(row, column) {
        return this.raw[row][column];
    }

    getRows() {
        return this.raw.length;
    }

    getRow(i) {
        return this.raw[i];
    }

    getColumns(row) {
        return this.raw.length ? this.raw[row].length : 0;
    }

    insertCharacters(row, pos, ...chars) {
        this.raw[row].splice(pos, 0, ...chars);
        this.notifyAll({
            modify: [row],
        });
    }

    insertLine(row, chars=[]) {
        this.raw.splice(row, 0, chars);
        this.notifyAll({
            insert: [row],
        });
    }
    
    insertNewLine(row, pos) {
        this.insertLine(row + 1);
        for (let i = pos; i < this.raw[row].length; i++) {
            this.raw[row + 1].push(this.raw[row][i]);
        }
        this.raw[row].splice(pos);
        this.notifyAll({
            modify: [row, row + 1],
        });
    }

    joinRows(row0, row1) {
        if (row0 < 0 || row1 >= this.getRows())
            return;
        this.raw[row0].push(...this.raw[row1]);
        this.raw.splice(row1, 1);
        this.notifyAll({
            modify: [row0],
            delete: [row1],
        });
    }

    deleteCharacter(row, start, forwards=true) {
        const toReturn = forwards ? this._deleteCharacterForwards(row, start) :
         this._deleteCharacterBackwards(row, start);
        return toReturn;
    }

    deleteLines(start, count=1, forwards=true) {
        let toReturn;
        if (this.raw.length === 1) {
            toReturn = this.raw[0];
            this.raw[0] = [];
            this.notifyAll({
                modify: [0],
            });
        } else {
            toReturn = forwards ? this._deleteLinesForwards(start, count) :
                this._deleteLinesBackwards(start, count);
        }
        return toReturn;
    }

    deleteWords(row, column, count=1, forwards=true) {
        let toReturn = [];
        while (count-- > 0)
            toReturn.push(...this._deleteWordStep(row, column, forwards ? 1 : -1));
        this.notifyAll({
            modify: [row],
        });
        return toReturn;
    }

    _deleteWordStep(row, column, step) {
        let original = column;

        while (column < this.getColumns(row) && column >= 0 && !isSpace(this.getCharacter(row, column))) 
            column += step;
        while (column < this.getColumns(row) && column >= 0 && isSpace(this.getCharacter(row, column))) 
            column += step;
        
        return this.raw[row].splice(original, Math.abs(column - original));

    }

    _deleteCharacterForwards(row, start) {
        let toReturn;
        if (this.raw[row].length === start) {
            this.joinRows(row, row + 1);
            toReturn = '\n';
        } else {
            toReturn = this.raw[row].splice(start, 1);
            this.notifyAll({
                modify: [row],
            });
        }
        return toReturn;
    }

    _deleteCharacterBackwards(row, start) {
        let toReturn;
        if (start === 0) {
            this.joinRows(row - 1, row);
            toReturn = '\n';
        } else {
            toReturn = this.raw[row].splice(start - 1, 1);
            this.notifyAll({
                modify: [row],
            });
        }
        return toReturn;
    }

    _deleteLinesForwards(start, count=1) {
        let toReturn = this.raw.splice(start, count);
        this.notifyAll({
            delete: new Array(count).fill(0).map((e, i) => i + start),
        });
        return toReturn;
    }

    _deleteLinesBackwards(start, count=1) {
        let toReturn = this.raw.splice(start - count, count);
        this.notifyAll({
            delete: new Array(count).fill(0).map((e, i) => start - i),
        });
        return toReturn;
    }
}

class Cursor extends Observable {
    constructor(lines, column=0, row=0) {
        super();
        this.lines = lines;
        this._column = column;
        this._row = row;
        this.handleEdges();
    }

    get row() {
        return this._row;
    }

    set row(r) {
        let original = this._row;
        this._row = r;
        this.handleEdges();
        if (original !== this._row)
            this.notifyAll();
    }

    get column() {
        return this._column;
    }

    set column(c) {
        let original = this._column;
        this._column = c;
        this.handleEdges();
        if (original !== this._column)
            this.notifyAll();
    }

    handleEdges() {
        this._row = Math.max(this._row, 0);
        this._row = Math.min(this._row, this.lines.getRows() - 1);
        this._column = Math.max(this._column, 0);
        this._column = Math.min(this._column, this.lines.getColumns(this._row));
    }
}
