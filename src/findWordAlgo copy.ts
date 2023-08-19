export function findWordPositions(grid, word) {
    const positions = {};

    // Flatten the 2D grid into a single list
    const flatGrid = grid.flat();
    const numRows = grid.length;
    const numCols = grid[0].length;

    // Define directions for searching
    const directions = [
        { dr: 0, dc: 1 },     // Horizontal
        { dr: 1, dc: 0 },     // Vertical
        { dr: 1, dc: 1 },     // Diagonal (top-left to bottom-right)
        { dr: 1, dc: -1 },    // Diagonal (top-right to bottom-left)
    ];

    // Helper function to check if a word starts at a position in a given direction
    function checkWord(row, col, direction) {
        const [dr, dc] = [direction.dr, direction.dc];
        const wordPositions = [];

        for (let i = 0; i < word.length; i++) {
            const newRow = row + i * dr;
            const newCol = col + i * dc;

            if (
                newRow < 0 || newRow >= numRows ||
                newCol < 0 || newCol >= numCols ||
                grid[newRow][newCol] !== word[i]
            ) {
                return [];
            }

            wordPositions.push({ row: newRow, col: newCol });
        }

        return wordPositions;
    }

    // Iterate through the grid
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            for (const direction of directions) {
                const wordPositions = checkWord(row, col, direction);

                if (wordPositions.length === word.length) {
                    positions[word] = wordPositions;
                }
            }
        }
    }

    if (!positions[word]) {
        return "Cannot find the word";
    }

    return positions;
}