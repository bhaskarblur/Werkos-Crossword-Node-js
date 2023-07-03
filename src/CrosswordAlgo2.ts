export function generateCrossword(words, alphabetList) {
    const rows = 14; // Number of rows in the grid
    const cols = 11; // Number of columns in the grid

    const grid = Array.from({ length: rows }, () => Array(cols).fill(''));
  
    // Place the words horizontally, vertically, and diagonally
    for (const word of words) {
      const direction = Math.floor(Math.random() * 8); // Random direction (0-7)
  
      let startX, startY;
      let stepX, stepY;
  
      if (direction === 0) {
        // Horizontal (left to right)
        startX = Math.floor(Math.random() * (cols - word.length + 1));
        startY = Math.floor(Math.random() * rows);
        stepX = 1;
        stepY = 0;
      } else if (direction === 1) {
        // Horizontal (right to left)
        startX = Math.floor(Math.random() * (cols - word.length + 1)) + word.length - 1;
        startY = Math.floor(Math.random() * rows);
        stepX = -1;
        stepY = 0;
      } else if (direction === 2) {
        // Vertical (top to bottom)
        startX = Math.floor(Math.random() * cols);
        startY = Math.floor(Math.random() * (rows - word.length + 1));
        stepX = 0;
        stepY = 1;
      } else if (direction === 3) {
        // Vertical (bottom to top)
        startX = Math.floor(Math.random() * cols);
        startY = Math.floor(Math.random() * (rows - word.length + 1)) + word.length - 1;
        stepX = 0;
        stepY = -1;
      } else if (direction === 4) {
        // Diagonal (top-left to bottom-right)
        startX = Math.floor(Math.random() * (cols - word.length + 1));
        startY = Math.floor(Math.random() * (rows - word.length + 1));
        stepX = 1;
        stepY = 1;
      } else if (direction === 5) {
        // Diagonal (bottom-right to top-left)
        startX = Math.floor(Math.random() * (cols - word.length + 1)) + word.length - 1;
        startY = Math.floor(Math.random() * (rows - word.length + 1)) + word.length - 1;
        stepX = -1;
        stepY = -1;
      } else if (direction === 6) {
        // Diagonal (top-right to bottom-left)
        startX = Math.floor(Math.random() * (cols - word.length + 1));
        startY = Math.floor(Math.random() * (rows - word.length + 1)) + word.length - 1;
        stepX = 1;
        stepY = -1;
      } else {
        // Diagonal (bottom-left to top-right)
        startX = Math.floor(Math.random() * (cols - word.length + 1)) + word.length - 1;
        startY = Math.floor(Math.random() * (rows - word.length + 1));
        stepX = -1;
        stepY = 1;
      }
  
      for (let i = 0; i < word.length; i++) {
        grid[startY + i * stepY][startX + i * stepX] = word.charAt(i);
      }
    }
  
    // Fill the remaining empty spaces with random alphabet characters
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (grid[i][j] === '') {
          const randomIndex = Math.floor(Math.random() * alphabetList.length);
          grid[i][j] = alphabetList[randomIndex];
        }
      }
    }
  
    return grid;
  }