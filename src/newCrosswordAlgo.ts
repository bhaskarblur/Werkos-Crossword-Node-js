export function initializeGrid(rows, cols) {
  const grid = [];
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      row.push('');
    }
    grid.push(row);
  }
  return grid;
}

function getRandomDirection() {
  const directions = ['horizontal', 'vertical', 'diagonal', 'diagonal_reverse'];
  return directions[Math.floor(Math.random() * directions.length)];
}

function canPlaceWord(grid, word, row, col, direction) {
  const wordLength = word.length;

  if (direction === 'horizontal') {
    if (col + (wordLength - 1) >= grid[0].length) {
      return false;
    }
    for (let i = 0; i < wordLength; i++) {
      const cell = grid[row][col + i];
      if (cell !== '' && cell !== word[i]) {
        return false;
      }
    }
  } else if (direction === 'vertical') {
    if (row + (wordLength - 1) >= grid.length) {
      return false;
    }
    for (let i = 0; i < wordLength; i++) {
      const cell = grid[row + i][col];
      if (cell !== '' && cell !== word[i]) {
        return false;
      }
    }
  } else if (direction === 'diagonal') {
    if (col + (wordLength - 1) >= grid[0].length || row + (wordLength - 1) >= grid.length) {
      return false;
    }
    for (let i = 0; i < wordLength; i++) {
      const cell = grid[row + i][col + i];
      if (cell !== '' && cell !== word[i]) {
        return false;
      }
    }
  } else if (direction === 'diagonal_reverse') {
    if (col - (wordLength - 1) < 0 || row + (wordLength - 1) >= grid.length) {
      return false;
    }
    for (let i = 0; i < wordLength; i++) {
      const cell = grid[row + i][col - i];
      if (cell !== '' && cell !== word[i]) {
        return false;
      }
    }
  }

  return true;
}

function placeWord(grid, word, row, col, direction) {
  const wordLength = word.length;

  if (direction === 'horizontal') {
    for (let i = 0; i < wordLength; i++) {
      grid[row][col + i] = word[i];
    }
  } else if (direction === 'vertical') {
    for (let i = 0; i < wordLength; i++) {
      grid[row + i][col] = word[i];
    }
  } else if (direction === 'diagonal') {
    for (let i = 0; i < wordLength; i++) {
      grid[row + i][col + i] = word[i];
    }
  } else if (direction === 'diagonal_reverse') {
    for (let i = 0; i < wordLength; i++) {
      grid[row + i][col - i] = word[i];
    }
  }
}

function fillEmptySpaces(grid, alphabetList) {
  const rows = grid.length;
  const cols = grid[0].length;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i][j] === '') {
        const randomIndex = Math.floor(Math.random() * alphabetList.length);
        grid[i][j] = alphabetList[randomIndex];
      }
    }
  }
}

export function populateGrid(grid, words, alphabetList) {
  const rows = grid.length;
  const cols = grid[0].length;
  const usedCells = new Set(); // To track used cells
  const markedWords = new Set(); // To track marked words
  const maxMarkedWords = 22; // Minimum number of marked words

  for (const word of words) {
    let placed = false;

    for (let attempt = 0; attempt < 100; attempt++) {
      const direction = getRandomDirection();

      // Generate random coordinates within grid bounds
      let row, col;
      if (direction === 'horizontal') {
        row = Math.floor(Math.random() * rows);
        col = Math.floor(Math.random() * (cols - word.length + 1));
      } else if (direction === 'vertical') {
        row = Math.floor(Math.random() * (rows - word.length + 1));
        col = Math.floor(Math.random() * cols);
      } else if (direction === 'diagonal') {
        row = Math.floor(Math.random() * (rows - word.length + 1));
        col = Math.floor(Math.random() * (cols - word.length + 1));
      } else if (direction === 'diagonal_reverse') {
        row = Math.floor(Math.random() * (rows - word.length + 1));
        col = Math.floor(Math.random() * (cols - word.length + 1)) + word.length - 1;
      }

      // Check if all cells required by the word are unused
      let canPlace = true;
      if (direction === 'horizontal') {
        for (let i = 0; i < word.length; i++) {
          const cell = grid[row][col + i];
          if (cell !== '' && cell !== word[i]) {
            canPlace = false;
            break;
          }
        }
      } else if (direction === 'vertical') {
        for (let i = 0; i < word.length; i++) {
          const cell = grid[row + i][col];
          if (cell !== '' && cell !== word[i]) {
            canPlace = false;
            break;
          }
        }
      } else if (direction === 'diagonal') {
        for (let i = 0; i < word.length; i++) {
          const cell = grid[row + i][col + i];
          if (cell !== '' && cell !== word[i]) {
            canPlace = false;
            break;
          }
        }
      } else if (direction === 'diagonal_reverse') {
        for (let i = 0; i < word.length; i++) {
          const cell = grid[row + i][col - i];
          if (cell !== '' && cell !== word[i]) {
            canPlace = false;
            break;
          }
        }
      }

      // Check if any of the cells are already used
      for (let i = 0; i < word.length; i++) {
        const cellKey = `${row + i}-${direction === 'diagonal_reverse' ? col - i : col + i}`;
        if (usedCells.has(cellKey)) {
          canPlace = false;
          break;
        }
      }

      if (canPlace) {
        // Mark the cells as used
        for (let i = 0; i < word.length; i++) {
          const cellKey = `${row + i}-${direction === 'diagonal_reverse' ? col - i : col + i}`;
          usedCells.add(cellKey);
        }

        // Check if the word should be marked
        if (markedWords.size < maxMarkedWords) {
          markedWords.add(word);
        }

        placeWord(grid, word, row, col, direction);
        placed = true;
        break;
      }
    }

    if (!placed) {
      console.log(`Unable to place word: ${word}`);
    }
  }

  // Fill the remaining empty spaces with random letters
  fillEmptySpaces(grid, alphabetList);
}

function displayGrid(grid) {
  for (const row of grid) {
    console.log(row.join(' '));
  }
}
