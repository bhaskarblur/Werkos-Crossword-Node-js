export function findWordPositions(grid, word) {
    var positions = [];

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
        { dr: -1, dc: 1 },    // Diagonal (bottom-left to top-right)
        { dr: -1, dc: -1 },   // Diagonal (bottom-right to top-left)
    ];

    // Helper function to check if a word starts at a position in a given direction
    function checkWord(startIndex, direction) {
        const [dr, dc] = [direction.dr, direction.dc];
        const wordPositions = [];

        for (let i = 0; i < word.length; i++) {
            const row = Math.floor(startIndex / numCols) + i * dr;
            const col = (startIndex % numCols) + i * dc;
            const index = row * numCols + col;

            if (
                row < 0 || row >= numRows ||
                col < 0 || col >= numCols ||
                flatGrid[index] !== word[i]
            ) {
                return [];
            }

            wordPositions.push(index);
        }

        return wordPositions;
    }

    // Iterate through the flattened grid
    for (let index = 0; index < flatGrid.length; index++) {
        for (const direction of directions) {
            const wordPositions = checkWord(index, direction);

            if (wordPositions.length === word.length) {
                // positions[word] = wordPositions;
                positions = wordPositions;
            }
        }
    }

    if (!positions || positions.length !== word.length) {
        return "Cannot find the word";
    }

    return positions;
}
