import { cleanWord } from "../helper/helper";

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

function getIncorrectWordsRandomDirection() {
  const directions = ['horizontal', 'vertical'];
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
  const [dr, dc] = directionToDelta(direction);

  if (direction === 'horizontal') {
    for (let i = 0; i < wordLength; i++) {
      if (col + i >= occupiedPositions[0].length || occupiedPositions[row][col + i]) {
        return true;
      }
    }
  } else if (direction === 'vertical') {
    for (let i = 0; i < wordLength; i++) {
      if (row + i >= occupiedPositions.length || occupiedPositions[row + i][col]) {
        return true;
      }
    }
  } else if (direction === 'diagonal_up_right') {
    for (let i = 0; i < wordLength; i++) {
      if (row - i < 0 || col + i >= occupiedPositions[0].length || occupiedPositions[row - i][col + i]) {
        return true;
      }
    }
  } else if (direction === 'diagonal_down_right') {
    for (let i = 0; i < wordLength; i++) {
      if (row + i >= occupiedPositions.length || col + i >= occupiedPositions[0].length || occupiedPositions[row + i][col + i]) {
        return true;
      }
    }
  }

  return false;
}

function markPositionOccupied(occupiedPositions, row, col, wordLength, direction) {
  const [dr, dc] = directionToDelta(direction);

  for (let i = 0; i < wordLength; i++) {
    occupiedPositions[row + i * dr][col + i * dc] = true;
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

export function markFixedWordsInGrid2(grid, words, alphabets, maxMarkWord, incorrectWords) {
  const markedWords = new Set();
  const filteredMarkedWords = new Set();
  const maxMarkedWords = maxMarkWord;

  const occupiedPositions = initializeGrid(grid.length, grid[0].length, false);

  for (const word of words) {
    const cleanedWord = cleanWord(word);

    if (markedWords.size >= maxMarkedWords) {
      break;
    }

    let placed = false;
    let direction;
    
    if (incorrectWords.includes(word)) {
      direction = getIncorrectWordsRandomDirection();
    } else {
      direction = getRandomDirection();
    }

    let row, col;

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

    if (canPlaceWord(grid, cleanedWord, row, col, direction) && !isPositionOccupied(occupiedPositions, row, col, cleanedWord.length, direction)) {
      placeWord(grid, cleanedWord, row, col, direction);
      markPositionOccupied(occupiedPositions, row, col, cleanedWord.length, direction);
      placed = true;
      markedWords.add(word);
      filteredMarkedWords.add(cleanedWord);
    }

    if (!placed) {
      console.log(`Unable to place word: ${word}`);
    }
  }

  fillEmptySpaces(grid, alphabets);

  return { grid, markedWords: Array.from(markedWords), filteredMarkedWords: Array.from(filteredMarkedWords) };
}

function displayGrid(grid) {
  for (const row of grid) {
    console.log(row.join(' '));
  }
}