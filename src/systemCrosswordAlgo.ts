// Function to check if a word can be placed at a specific position in the grid
function canPlaceWord(grid, word, row, col, direction) {
    const wordLength = word.length;
    const numRows = grid.length;
    const numCols = grid[0].length;
  
    // Check if the word fits in the grid based on the given direction
    if (
      (direction === 'horizontal' && col + wordLength > numCols) ||
      (direction === 'vertical' && row + wordLength > numRows)
    ) {
      return false;
    }
  
    // Check if the word conflicts with existing letters in the grid
    for (let i = 0; i < wordLength; i++) {
      const cellRow = direction === 'horizontal' ? row : row + i;
      const cellCol = direction === 'horizontal' ? col + i : col;
  
      if (grid[cellRow][cellCol] !== ' ' && grid[cellRow][cellCol] !== word[i]) {
        return false;
      }
    }
  
    return true;
  }
  
  // Function to place a word in the grid at a specific position
  function placeWord(grid, word, row, col, direction) {
    const wordLength = word.length;
  
    for (let i = 0; i < wordLength; i++) {
      const cellRow = direction === 'horizontal' ? row : row + i;
      const cellCol = direction === 'horizontal' ? col + i : col;
  
      grid[cellRow][cellCol] = word[i];
    }
  }
  
  // Function to generate a random crossword grid
 export function generateCrosswordGrid(words, alphabetList) {
    const numRows = 14;
    const numCols = 11;
  
    // Create an empty grid filled with empty spaces
    const grid = Array.from({ length: numRows }, () =>
      Array.from({ length: numCols }, () => ' ')
    );
  
    // Sort the words by length in descending order
    words.sort((a, b) => b.length - a.length);
  
    // Place the first word horizontally at the center of the grid
    const centerRow = Math.floor(numRows / 2);
    const centerCol = Math.floor(numCols / 2);
    const firstWord = words[0];
    placeWord(grid, firstWord, centerRow, centerCol - Math.floor(firstWord.length / 2), 'horizontal');
  
    // Place the remaining words randomly in the grid
    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      let placed = false;
  
      while (!placed) {
        const row = Math.floor(Math.random() * numRows);
        const col = Math.floor(Math.random() * numCols);
        const direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';
  
        if (canPlaceWord(grid, word, row, col, direction)) {
          placeWord(grid, word, row, col, direction);
          placed = true;
        }
      }
    }
  
    // Fill the remaining empty spaces with random alphabets
    for (let i = 0; i < numRows; i++) {
      for (let j = 0; j < numCols; j++) {
        if (grid[i][j] === ' ') {
          const randomIndex = Math.floor(Math.random() * alphabetList.length);
          grid[i][j] = alphabetList[randomIndex];
        }
      }
    }
  
    return grid;
  }
  
  // Function to convert the grid to a JSON representation
  export function gridToJSON(grid) {
    const numRows = grid.length;
    const numCols = grid[0].length;
  
    const jsonGrid = [];
    for (let i = 0; i < numRows; i++) {
      const row = [];
      for (let j = 0; j < numCols; j++) {
        row.push(grid[i][j]);
      }
      jsonGrid.push(row);
    }
  
    return jsonGrid;
  }