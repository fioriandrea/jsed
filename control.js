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
            let previousLineLen = lines.raw[cursor.row - 1] ? lines.raw[cursor.row - 1].length : 0;
            if (lines.deleteCharacter(cursor.row, cursor.column, false)) {
                cursor.row--;
                cursor.column = previousLineLen;
            } else {
                cursor.column--;
            }
            break;
        case 'Delete':
            lines.deleteCharacter(cursor.row, cursor.column, true); 
            break;
        case '\n':
        case '\r':
        case 'Enter':
        case 'Return':
            lines.insertNewLine(cursor.row, cursor.column);
            cursor.row++;
            cursor.column = 0;
            break;
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
            lines.insertCharacters(cursor.row, cursor.column, c);
            cursor.column++;
            break;
    }
}
