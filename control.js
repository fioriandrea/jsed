function insertControl(screen, cursor, lines, c) {
        print(c.charCodeAt(0), c);
        switch (c) {
            case 'ArrowUp':
                cursor.row--;
                break;
            case 'ArrowDown':
                cursor.row++;
                break;
            case 'ArrowLeft':
                cursor.column--;
                break;
            case 'ArrowRight':
                cursor.column++;
                break;
            case 'Backspace':
                if (cursor.column === 0 && cursor.row !== 0) {

                    cursor.row--;
                    cursor.column = lines[cursor.row].length;
                    lines[cursor.row].push(...lines[cursor.row + 1]);
                    lines.splice(cursor.row + 1, 1);
                } else if (cursor.column !== 0) {
                    lines[cursor.row].splice(cursor.column - 1, 1);
                    cursor.column--;
                }
                break;
            case '\n':
            case '\r':
            case 'Enter':
            case 'Return':
                lines.splice(cursor.row + 1, 0, []);
                for (let i = cursor.column; i < lines[cursor.row].length; i++) {
                    lines[cursor.row + 1]
                        .push(lines[cursor.row][i]);
                }
                lines[cursor.row].splice(cursor.column);
                cursor.row++;
                cursor.column = 0;
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
                lines[cursor.row].splice(cursor.column, 0, c);
                cursor.column++;
                break;
        }
}
