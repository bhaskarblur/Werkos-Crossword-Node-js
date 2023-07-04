export function generateCrossword(wordsToMark, alphabets) {
  const width = 14; // Number of columns
  const height = 11; // Number of rows

  // Create an empty crossword grid
  const crossword = [];
  for (let i = 0; i < height; i++) {
    crossword.push(Array(width).fill(' '));
  }

  // Helper function to check if a word can be placed at a given position
  function canPlaceWord(word, startX, startY, stepX, stepY) {
    // Check if word fits within the crossword grid
    if (
      startX + stepX * (word.length - 1) < 0 ||
      startX + stepX * (word.length - 1) >= width ||
      startY + stepY * (word.length - 1) < 0 ||
      startY + stepY * (word.length - 1) >= height
    ) {
      return false;
    }

    // Check if word overlaps with any existing letters
    for (let i = 0; i < word.length; i++) {
      const x = startX + i * stepX;
      const y = startY + i * stepY;
      if (crossword[y][x] !== ' ' && crossword[y][x] !== word[i]) {
        return false;
      }
    }

    return true;
  }

  // Helper function to place a word at a given position
  function placeWord(word, startX, startY, stepX, stepY) {
    for (let i = 0; i < word.length; i++) {
      crossword[startY + i * stepY][startX + i * stepX] = word[i];
    }
  }

  // Place all words horizontally, vertically, and diagonally
  wordsToMark.forEach(word => {
    let direction;
    let startX, startY, stepX, stepY;
    let placed = false;

    while (!placed) {
      direction = Math.floor(Math.random() * 8); // Random direction: 0 to 7

      if (direction === 0) {
        // Place horizontally left to right
        startX = Math.floor(Math.random() * (width - word.length + 1));
        startY = Math.floor(Math.random() * height);
        stepX = 1;
        stepY = 0;
      } else if (direction === 1) {
        // Place horizontally right to left
        startX = Math.floor(Math.random() * (width - word.length + 1)) + word.length - 1;
        startY = Math.floor(Math.random() * height);
        stepX = -1;
        stepY = 0;
      } else if (direction === 2) {
        // Place vertically top to bottom
        startX = Math.floor(Math.random() * width);
        startY = Math.floor(Math.random() * (height - word.length + 1));
        stepX = 0;
        stepY = 1;
      } else if (direction === 3) {
        // Place vertically bottom to top
        startX = Math.floor(Math.random() * width);
        startY = Math.floor(Math.random() * (height - word.length + 1)) + word.length - 1;
        stepX = 0;
        stepY = -1;
      } else if (direction === 4) {
        // Place diagonally top-left to bottom-right
        startX = Math.floor(Math.random() * (width - word.length + 1));
        startY = Math.floor(Math.random() * (height - word.length + 1));
        stepX = 1;
        stepY = 1;
      } else if (direction === 5) {
        // Place diagonally bottom-right to top-left
        startX = Math.floor(Math.random() * (width - word.length + 1)) + word.length - 1;
        startY = Math.floor(Math.random() * (height - word.length + 1)) + word.length - 1;
        stepX = -1;
        stepY = -1;
      } else if (direction === 6) {
        // Place diagonally top-right to bottom-left
        startX = Math.floor(Math.random() * (width - word.length + 1)) + word.length - 1;
        startY = Math.floor(Math.random() * (height - word.length + 1));
        stepX = -1;
        stepY = 1;
      } else {
        // Place diagonally bottom-left to top-right
        startX = Math.floor(Math.random() * (width - word.length + 1));
        startY = Math.floor(Math.random() * (height - word.length + 1)) + word.length - 1;
        stepX = 1;
        stepY = -1;
      }

      if (canPlaceWord(word, startX, startY, stepX, stepY)) {
        placeWord(word, startX, startY, stepX, stepY);
        placed = true;
      }
    }
  });

  // Fill the remaining empty spaces with random alphabets
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      if (crossword[i][j] === ' ') {
        const randomIndex = Math.floor(Math.random() * alphabets.length);
        crossword[i][j] = alphabets[randomIndex];
      }
    }
  }

  // Convert the crossword grid to JSON
  const crosswordJSON = JSON.stringify(crossword);

  return crossword;
}