(row, column) => cell;
(row) => { start, end };

{
    row,
    columns: {
        start,
        end,
    },
}














* If it is in the window, it means that it already fits => do not change anything
* If it is not in the window, it means that the cursor is either above or below the current window, and that you can rebuild the window from scratch:
    * if it is above, put current line at the top of the window
    * if it is below, put current line at the bottom of the window

Screen line data structure where each line has its own offset (inside a window)

Also, window data structure

Screen line class
* First visualizable column
* Last visualizable column (in most cases these 2 will be 0 and line.length - 1 respectively) (or you can do first column and length)

(Need to keep track of a variable which contains the number of available lines, and you need to update it as you add screen lines to the window)

You need

* start row (which is displayed on top of the screen)

* rewrite from scratch screen.js


* do it like vim: if the screen has n writable lines, select the relevant n lines (you can get them by taking the lines in the interval [rowOffset - rowOffset + n (-1?)]
* start printing the first (that is, get the screen positions). Then check if the second fits. If it does, "print" it. If it doesn't, stop there.
* if the cursor goes on a line, it must be visualized. If it doesn't fit, you have to adjust the rowOffset until it does.
* the only case when you visualize a fraction of a line (e.g. half a line) is when the line is bigger than the entire screen
* if a line is bigger than the entire screen alone, then you need to handle it differently: you have to be able to display a portion of a line

# challenges

* understand how to handle all the above cases uniformly
* understand how to handle cursor in all of this
* understand how to handle visual line

# possible solutions

* change model by adding some more metadata
