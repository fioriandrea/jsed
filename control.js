class InsertControl {
    constructor(screen, cursor, lines) {
        this.screen = screen;
        this.lines = lines;
        this.cursor = cursor;
    }

    handleKey(c) {
        print(c.charCodeAt(0), c);
        switch (c) {
            case 'ArrowUp':
                this.cursor.row--;
                break;
            case 'ArrowDown':
                this.cursor.row++;
                break;
            case 'ArrowLeft':
                this.cursor.column--;
                break;
            case 'ArrowRight':
                this.cursor.column++;
                break;
            case 'Backspace':
                if (this.cursor.column === 0 && this.cursor.row !== 0) {

                    this.cursor.row--;
                    this.cursor.column = this.lines[this.cursor.row].length;
                    this.lines[this.cursor.row].push(...this.lines[this.cursor.row + 1]);
                    this.lines.splice(this.cursor.row + 1, 1);
                } else if (this.cursor.column !== 0) {
                    this.lines[cursor.row].splice(this.cursor.column - 1, 1);
                    this.cursor.column--;
                }
                break;
            case '\n':
            case '\r':
            case 'Enter':
            case 'Return':
                this.lines.splice(this.cursor.row + 1, 0, []);
                for (let i = this.cursor.column; i < this.lines[this.cursor.row].length; i++) {
                    this.lines[this.cursor.row + 1]
                        .push(this.lines[this.cursor.row][i]);
                }
                this.lines[this.cursor.row].splice(this.cursor.column);
                this.cursor.row++;
                this.cursor.column = 0;
                break;
            case 'Delete':
            case 'Control':
            case 'Alt':
            case 'OS':
            case 'AltGraph':
            case 'Shift':
            case 'Escape':
            case 'F1':
            case 'F2':
            case 'F3':
            case 'F4':
            case 'F5':
            case 'F6':
            case 'F7':
            case 'F8':
            case 'F9':
            case 'F10':
            case 'Insert':
                break;
            default:
                this.lines[this.cursor.row].splice(this.cursor.column, 0, c);
                this.cursor.column++;
                break;
        }
    } 
}
