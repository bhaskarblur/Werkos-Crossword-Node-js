export function generateCrossword(words, alphabetList) {
  const rows = 14; // Number of rows in the grid
  const cols = 11; // Number of columns in the grid
  //const alphabetList = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // List of alphabet characters

  // Initialize an empty grid
  const grid = Array.from({ length: rows }, () => Array(cols).fill(''));

  // Helper function to check if a word can be placed at the given position
  function canPlaceWord(word, startX, startY, stepX, stepY) {
    const wordLength = word.length;

    // Check if the word fits in the grid
    if (
      startX + stepX * wordLength < 0 ||
      startX + stepX * wordLength >= cols ||
      startY + stepY * wordLength < 0 ||
      startY + stepY * wordLength >= rows
    ) {
      return false;
    }

    // Check if the word overlaps with existing letters
    for (let i = 0; i < wordLength; i++) {
      const x = startX + stepX * i;
      const y = startY + stepY * i;

      if (grid[y][x] !== '' && grid[y][x] !== word.charAt(i)) {
        return false;
      }
    }

    return true;
  }

  // Helper function to place a word at the given position
  function placeWord(word, startX, startY, stepX, stepY) {
    for (let i = 0; i < word.length; i++) {
      const x = startX + stepX * i;
      const y = startY + stepY * i;

      grid[y][x] = word.charAt(i);
    }
  }

  // Shuffle the words randomly
  words = words.sort(() => Math.random() - 0.5);

  // Place the words horizontally, vertically, and diagonally
  for (const word of words) {
    let placed = false;

    // Try placing the word in all directions until successful
    for (let attempts = 0; attempts < 10 && !placed; attempts++) {
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

      if (canPlaceWord(word, startX, startY, stepX, stepY)) {
        placeWord(word, startX, startY, stepX, stepY);
        placed = true;
      }
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