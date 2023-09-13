import { cleanWord } from "./helper";

// Function to initialize a grid with a given value
function initializeGrid(rows, cols, value) {
  const grid = [];
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      row.push(value);
    }
    grid.push(row);
  }
  return grid;
}

function getRandomDirection() {
  const directions = ['horizontal', 'vertical', 'diagonal_up_right', 'diagonal_down_right'];
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
  } else if (direction === 'diagonal_up_right') {
    if (col + (wordLength - 1) >= grid[0].length || row - (wordLength - 1) < 0) {
      return false;
    }
    for (let i = 0; i < wordLength; i++) {
      const cell = grid[row - i][col + i];
      if (cell !== '' && cell !== word[i]) {
        return false;
      }
    }
  } else if (direction === 'diagonal_down_right') {
    if (col + (wordLength - 1) >= grid[0].length || row + (wordLength - 1) >= grid.length) {
      return false;
    }
    for (let i = 0; i < wordLength; i++) {
      const cell = grid[row + i][col + i];
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
  } else if (direction === 'diagonal_up_right') {
    for (let i = 0; i < wordLength; i++) {
      grid[row - i][col + i] = word[i];
    }
  } else if (direction === 'diagonal_down_right') {
    for (let i = 0; i < wordLength; i++) {
      grid[row + i][col + i] = word[i];
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

function isPositionOccupied(occupiedPositions, row, col, wordLength, direction) {
  // Check if the positions in the given direction are occupied
  const numRows = occupiedPositions.length;
  const numCols = occupiedPositions[0].length;

  if (direction === 'horizontal') {
    for (let i = 0; i < wordLength; i++) {
      if (col + i >= numCols || occupiedPositions[row][col + i]) {
        return true;
      }
    }
  } else if (direction === 'vertical') {
    for (let i = 0; i < wordLength; i++) {
      if (row + i >= numRows || occupiedPositions[row + i][col]) {
        return true;
      }
    }
  } else if (direction === 'diagonal_up_right') {
    for (let i = 0; i < wordLength; i++) {
      if (row - i < 0 || col + i >= numCols || occupiedPositions[row - i][col + i]) {
        return true;
      }
    }
  } else if (direction === 'diagonal_down_right') {
    for (let i = 0; i < wordLength; i++) {
      if (row + i >= numRows || col + i >= numCols || occupiedPositions[row + i][col + i]) {
        return true;
      }
    }
  }

  return false;
}

function markPositionOccupied(occupiedPositions, startRow, startCol, length, direction) {
  const [dr, dc] = directionToDelta(direction);

  for (let i = 0; i < length; i++) {
    occupiedPositions[startRow + i * dr][startCol + i * dc] = true;
  }
}

function directionToDelta(direction) {
  if (direction === 'horizontal') {
    return [0, 1];
  } else if (direction === 'vertical') {
    return [1, 0];
  } else if (direction === 'diagonal_up_right') {
    return [-1, 1];
  } else if (direction === 'diagonal_down_right') {
    return [1, 1];
  }
}

function getIncorrectWordsRandomDirection() {
  const directions = ['horizontal', 'vertical'];
  return directions[Math.floor(Math.random() * directions.length)];
}

export function markFixedWordsInGrid2(grid, words, alphabets, incorrectWords, maxMarkWord) {
  const markedWords = new Set(); // To track marked words
  const filteredMarkedwords = new Set();
  const maxMarkedWords = maxMarkWord; // Maximum number of marked words

  // Initialize a boolean grid to track occupied positions
  const occupiedPositions = initializeGrid(grid.length, grid[0].length, false);

  for (const word of words) {
   
    const cleanedWord = cleanWord(word);

    // Check if the maximum number of marked words has been reached
    if (markedWords.size >= maxMarkedWords) {
      break;
    }

    let placed = false;
    console.log('this is word: '+word);
    console.log(incorrectWords.includes(word));
    for (let attempt = 0; attempt < 100; attempt++) {
      var direction;
      if(incorrectWords.includes(word)) {
      direction = getIncorrectWordsRandomDirection();
      }
      else {
        direction = getRandomDirection();
      }

      let row, col;

      // Generate random coordinates within grid bounds
      if (direction === 'horizontal') {
        row = Math.floor(Math.random() * grid.length);
        col = Math.floor(Math.random() * (grid[0].length - cleanedWord.length + 1));
      } else if (direction === 'vertical') {
        row = Math.floor(Math.random() * (grid.length - cleanedWord.length + 1));
        col = Math.floor(Math.random() * grid[0].length);
      } else if (direction === 'diagonal_up_right') {
        row = Math.floor(Math.random() * (grid.length - cleanedWord.length + 1)) + (cleanedWord.length - 1);
        col = Math.floor(Math.random() * (grid[0].length - cleanedWord.length + 1));
      } else if (direction === 'diagonal_down_right') {
        row = Math.floor(Math.random() * (grid.length - cleanedWord.length + 1));
        col = Math.floor(Math.random() * (grid[0].length - cleanedWord.length + 1));
      }

      // Check if the word can be placed without overlapping
      if (canPlaceWord(grid, cleanedWord, row, col, direction) && !isPositionOccupied(occupiedPositions, row, col, cleanedWord.length, direction)) {
        // Place the word and mark positions as occupied
        placeWord(grid, cleanedWord, row, col, direction);
        markPositionOccupied(occupiedPositions, row, col, cleanedWord.length, direction);
        placed = true;
        markedWords.add(word);
        filteredMarkedwords.add(cleanedWord);
        break; // Move on to the next word
      }
    }

    if (!placed) {
      console.log(`Unable to place word: ${word}`);
    }
  }

  // Fill the remaining empty spaces with random letters
  fillEmptySpaces(grid, alphabets);

  return { grid, markedWords: Array.from(markedWords), filteredMarkedwords: Array.from(filteredMarkedwords) };
}

function displayGrid(grid) {
  for (const row of grid) {
    console.log(row.join(' '));
  }
}
