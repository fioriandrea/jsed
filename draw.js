const setFont = (hrcanvas) => {
    hrcanvas.context2d.font = `${baseFontSize}px monospace`;
    hrcanvas.context2d.textAlign = 'left';
    hrcanvas.context2d.textBaseline = 'middle';
};

const drawLines = (hrcanvas, { screen, lines }, toDrawCells, toDrawCellWrapper) => {
    hrcanvas.context2d.fillStyle = textColor;
    toDrawCells.forEach(toDrawCell => {
        let row = toDrawCell.row;
        let line = lines.getLine(toDrawCell.row);
        for (let column = toDrawCell.columns.start; column <= toDrawCell.columns.end; column++) {
            let cell = toDrawCellWrapper(row, column);
            let { x, y } = screen.cellToPixels(cell);
            hrcanvas.context2d.fillText(line.getChar(column), x, y + screen.rowSize / 2, screen.columnSize);
        }
    });
};

const drawCursor = (hrcanvas, { screen, cursor }, toDrawCellWrapper) => {

    hrcanvas.context2d.fillStyle = cursorColor;
    const cell = toDrawCellWrapper(cursor.row, cursor.column);
    const { x, y } = screen.cellToPixels(cell);
    hrcanvas.context2d.fillRect(x, y, screen.columnSize, screen.rowSize);
};

const drawVisualTrail = (hrcanvas, { screen, visualTrail }, toDrawCells, toDrawCellWrapper) => {
    hrcanvas.context2d.fillStyle = visualTrailColor;

    for (let i = 0; i < toDrawCells.length; i++) {
        let toDrawCell = toDrawCells[i];
        let row = toDrawCell.row;
        if (row < visualTrail.start.row)
            continue;
        if (row > visualTrail.end.row)
            continue;
        for (let column = toDrawCell.columns.start; column <= toDrawCell.columns.end; column++) {
            if (row === visualTrail.start.row && column < visualTrail.start.column)
                continue;
            if (row === visualTrail.end.row && column > visualTrail.end.column)
                continue;
            let cell = toDrawCellWrapper(row, column);
            let { x, y } = screen.cellToPixels(cell);
            hrcanvas.context2d.fillRect(x, y, screen.columnSize, screen.rowSize);
        }
    }
};

const drawLineNumbers = (hrcanvas, { screen, cursor, lines }, toDrawCells) => {
    hrcanvas.context2d.fillStyle = numberColor;
    let screenRow = 0;
    for (let toDrawCell of toDrawCells) {
        let row = toDrawCell.row;

        let screenColumn = row === cursor.row ? 0 : 1;
        let rowString = `${row}`;
        let { x, y } = screen.cellToPixels({
            row: screenRow,
            column: screenColumn,
        });
        hrcanvas.context2d.fillText(rowString, x, y + screen.rowSize / 2, screen.columnSize * rowString.length);

        let line = lines.getLine(row);
        let rowsToSkip = screenRows(screen, line);
        screenRow += rowsToSkip;
    }
};