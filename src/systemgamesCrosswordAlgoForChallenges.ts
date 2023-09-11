import { cleanWord } from "./helper";

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

export function markWordsInGrid2(grid, words, alphabets, incorrectWords, words_limit) {
  const markedWords = new Set(); // To track marked words
  const filteredMarkedwords = new Set();
  const maxMarkedWords = words_limit; // Minimum number of marked words

  for (const word of words) {
    const cleanedWord = cleanWord(word);
    if (markedWords.size >= maxMarkedWords) {
      break; // Stop trying to place additional words once the limit is reached
    }

    let placed = false;

    for (let attempt = 0; attempt < 100; attempt++) {
      var direction;
      if(incorrectWords.includes(word)) {
      direction = getIncorrectWordsRandomDirection();
      }
      else {
        direction = getRandomDirection();
      }

      // Generate random coordinates within grid bounds
      let row, col;
      if (direction === 'horizontal') {
        row = Math.floor(Math.random() * grid.length);
        col = Math.floor(Math.random() * (grid[0].length - word.length + 1));
      } else if (direction === 'vertical') {
        row = Math.floor(Math.random() * (grid.length - word.length + 1));
        col = Math.floor(Math.random() * grid[0].length);
      } else if (direction === 'diagonal_up_right') {
        row = Math.floor(Math.random() * (grid.length - word.length + 1)) + (word.length - 1);
        col = Math.floor(Math.random() * (grid[0].length - word.length + 1));
      } else if (direction === 'diagonal_down_right') {
        row = Math.floor(Math.random() * (grid.length - word.length + 1));
        col = Math.floor(Math.random() * (grid[0].length - word.length + 1));
      }

      if (canPlaceWord(grid, cleanedWord, row, col, direction)) {
        placeWord(grid, cleanedWord, row, col, direction);
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
  
  return { grid, markedWords: Array.from(markedWords), filteredMarkedwords: Array.from(filteredMarkedwords)};
}

function displayGrid(grid) {
  for (const row of grid) {
    console.log(row.join(' '));
  }
}

// Example usage:
// const { grid, markedWords } = markWordsInGrid(initializeGrid(14, 11), ['WORD1', 'WORD2', 'WORD3']);
// displayGrid(grid);
// console.log("Marked Words:", markedWords);
