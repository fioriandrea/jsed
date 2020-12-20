/**
 * Like native array splice, but can also delete backwards.
 * @param array The array to splice
 * @param start Index to start splicing from
 * @param deleteCount Number of elements to be deleted
 * @param toInsert Elements to be inserted
 * @param forwards If true, behaviour is the same as normal splice. Otherwise, 
 * it deletes backwards **excluding** the element at start (i.e. array[start] is not deleted).
 * It is like hitting backspace in Vim.
 */
const spliceBothWays = (array, start, deleteCount, toInsert, forwards = true) => {
    if (!forwards) {
        deleteCount = Math.min(start, deleteCount);
        start = start - deleteCount;
    }
    return array.splice(start, deleteCount, ...toInsert);
};

const isSpace = char => char === ' ' || char === '\n' || char === '\t' || char === '\r' || char === '\b';

const compareCells = (cell0, cell1) => {
    let rowDiff = cell0.row - cell1.row;
    let columnDiff = cell0.column - cell1.column;
    return rowDiff !== 0 ? rowDiff : columnDiff;
};

const charArraysToLines = (chArrays) => new Lines(
    chArrays.map(charr => new Line(charr)),
);

class Line {
    constructor(raw = []) {
        this.raw = raw;
    }

    clone() {
        return new Line([...this.raw]);
    }

    toString() {
        return this.raw.join("");
    }

    get length() {
        return this.raw.length;
    }

    getChar(pos) {
        return this.raw[pos] || '';
    }

    getRange(start, end) {
        if (end === undefined) {
            end = this.length;
        }
        return new Line(this.raw.slice(start, end));
    }

    getLengthRange(start, count) {
        return this.getRange(start, start + count);
    }

    pushChars(chars) {
        return this.raw.push(...chars);
    }

    insertChars(pos, chars) {
        return this.raw.splice(pos, 0, ...chars);
    }

    deleteChars(pos, deleteCount, forwards = true) {
        return new Line(spliceBothWays(this.raw, pos, deleteCount, [], forwards));
    }

    deleteCharRange(start, end) {
        return this.deleteChars(start, end - start, true);
    }

    concat(line) {
        this.raw.push(...line.raw);
        return this;
    }

    isSpace(pos) {
        return isSpace(this.getChar(pos));
    }

    skipSpaces(pos, forwards = true) {
        let increment = forwards ? 1 : -1;
        while (this.isSpace(pos))
            pos += increment;
        return pos;
    }

    wordStart(pos) {
        pos = this.skipSpaces(pos, false);
        while (pos >= 0 && !this.isSpace(pos))
            pos--;
        return ++pos;
    }

    wordEnd(pos) {
        pos = this.skipSpaces(pos, true);
        while (pos < this.length && !this.isSpace(pos))
            pos++;
        return pos;
    }

    previousWordStart(pos) {
        pos = this.wordStart(pos) - 1;
        pos = this.wordStart(pos);
        return pos;
    }

    nextWordStart(pos) {
        pos = this.wordEnd(pos);
        pos = this.skipSpaces(pos);
        return pos;
    }

    getWord(pos, forwards = true) {
        let start = forwards ? pos : this.wordStart(pos);
        let end = forwards ? this.wordEnd(pos) : pos;
        return this.getRange(start, end);
    }

    deleteWord(pos, forwards = true) {
        let start = forwards ? pos : this.previousWordStart(pos);
        let end = forwards ? this.nextWordStart(pos) : pos;
        return this.deleteCharRange(start, end);
    }
}

class Lines {
    constructor(lines) {
        this.lines = lines || [new Line()];
    }

    clone() {
        return new Lines(this.lines.map(l => l.clone()));
    }

    toString() {
        return this.lines.map(e => e.toString()).join('\n');
    }

    insertChars(row, column, ...chars) {
        return this.getLine(row).insertChars(column, ...chars);
    }

    getLine(i) {
        return this.lines[i];
    }

    get length() {
        return this.lines.length;
    }

    getLineLength(i) {
        return this.getLine(i).length;
    }

    getChar(row, column) {
        return this.getLine(row).getChar(column);
    }

    deleteLines(row, count, forwards = true) {
        let deleted = new Lines(spliceBothWays(this.lines, row, count, [], forwards));
        if (this.lines.length === 0) {
            this.lines.push(new Line());
        }
        return deleted;
    }

    insertLinesArray(row, lines) {
        this.lines.splice(row, 0, ...lines);
    }

    insertLines(row, lines) {
        this.insertLinesArray(row, lines.lines);
    }

    insertNewLine(row, pos) {
        let line = this.getLine(row);
        let deleted = line.deleteChars(pos, Infinity);
        this.insertLinesArray(row + 1, [deleted]);
    }

    concatLines(row0, row1) {
        this.getLine(row0).concat(this.getLine(row1));
        this.deleteLines(row1, 1);
    }

    deleteChars(row, column, count, forwards = true) {
        // delete chars as if there was a new line between lines
        let deletedLines = [];
        let line = this.getLine(row);
        const mergeAction = () => {
            if (forwards) {
                if (row < this.length - 1) {
                    line.concat(this.getLine(row + 1));
                    this.deleteLines(row + 1, 1);
                    return true;
                }
            } else {
                if (row > 0) {
                    row--;
                    line = this.getLine(row);
                    line.concat(this.getLine(row + 1));
                    this.deleteLines(row + 1, 1);
                    column = line.length;
                    return true;
                }
            }
            return false;
        };
        while (count > 0) {
            let deleted = line.deleteChars(column, count, forwards);
            if (!deleted.length) {
                count--;
                if (!mergeAction()) {
                    break;
                }
            } else {
                deletedLines.push(deleted);
                if (!forwards)
                    column = 0;
            }
            count -= deleted.length;
        }
        return new Lines(deletedLines);
    }

    deleteCharRange(startRow, startColumn, endRow, endColumn) {
        let count = 0;
        let row = startRow;
        while (row <= endRow) {
            let toAdd = this.getLineLength(row);
            if (row === startRow) {
                toAdd -= startColumn + 1;
            }
            if (row === endRow) {
                toAdd -= this.getLineLength(row) - (endColumn + 1);
            }
            count += toAdd;
            row++;
        }
        return this.deleteChars(startRow, startColumn, count, true);
    }

    getCharRange(startRow, startColumn, endRow, endColumn) {
        let lines = [];
        let row = startRow;
        while (row <= endRow) {
            let line = this.getLine(row);
            let firstColumn = 0;
            let lastColumn = line.length;
            if (row === startRow)
                firstColumn = startColumn;
            if (row === endRow)
                lastColumn = endColumn + 1;
            lines.push(line.getRange(firstColumn, lastColumn));
            row++;
        }
        return new Lines(lines);
    }

    getLineRange(startRow, endRow) {
        return new Lines(this.lines.slice(startRow, endRow));
    }

    getLinesLength(startRow, startColumn, count) {
        let lines = [];
        let line = this.getLine(startRow++).getRange(startColumn);
        while (count > 0) {
            lines.push(line.getRange(0, count));
            count -= lines[lines.length - 1].length;
            line = this.getLine(startRow++);
        }
        return new Lines(lines);
    }

    deleteWord(row, column) {
        let deleted = this.getLine(row).deleteWord(column);
        if (!deleted.length && row + 1 < this.length) {
            this.concatLines(row, row + 1);
        }
        return deleted;
    }
}

class Cursor {
    constructor(lines, column = 0, row = 0) {
        this.lines = lines;
        this._column = column;
        this._row = row;
        this._trailingColumn = true;
        this.handleEdges();
    }

    get row() {
        return this._row;
    }

    set row(r) {
        this._row = r;
        this.handleEdges();
    }

    get column() {
        return this._column;
    }

    set column(c) {
        this._column = c;
        this.handleEdges();
    }

    get trailingColumns() {
        return this._trailingColumn ? 1 : 0;
    }

    handleEdges() {
        this._row = Math.min(this._row, this.lines.length - 1);
        this._row = Math.max(this._row, 0);
        this._column = Math.min(this._column, this.lines.getLineLength(this._row) + this.trailingColumns - 1);
        this._column = Math.max(this._column, 0);
    }
}

class VisualTrail {
    constructor(start, end) {
        this._start = start || { row: 0, column: 0 };
        this._end = end || { row: 0, column: 0 };
    }

    set start(s) {
        this._start = s;
    }

    set end(e) {
        this._end = e;
    }

    get start() {
        return compareCells(this._start, this._end) <= 0 ? this._start : this._end;
    }

    get end() {
        return compareCells(this._start, this._end) > 0 ? this._start : this._end;
    }
}

const Clipboard = (() => {
    let data;

    return {
        read() {
            return data.clone();
        },
        write(d) {
            data = d;
        },
    };
})();
