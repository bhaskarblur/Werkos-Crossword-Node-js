import { cleanWord, generateRandomList } from "../helper/helper";

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

function getRandomDirection(maxWords) {
  const directions = maxWords <= 9 ?
  [
    'horizontal',
    'diagonal_up_right',
    'diagonal_down_right',
  ] : [
    'horizontal',
    'vertical',
    'diagonal_up_right',
    'diagonal_down_right',
    'diagonal_up_left',
    'diagonal_down_left'
  ];
  return directions[Math.floor(Math.random() * directions.length)];
}

function canPlaceWord(grid, word, row, col, direction) {
  const wordLength = word.length;

  const checkOverlap = (r, c, i) => {
    return grid[r][c] === '' || grid[r][c] === word[i];
  };

  if (direction === 'horizontal' && col + wordLength <= grid[0].length) {
    for (let i = 0; i < wordLength; i++) {
      if (!checkOverlap(row, col + i, i)) {
        return false;
      }
    }
    return true;
  } else if (direction === 'vertical' && row + wordLength <= grid.length) {
    for (let i = 0; i < wordLength; i++) {
      if (!checkOverlap(row + i, col, i)) {
        return false;
      }
    }
    return true;
  } else if (direction === 'diagonal_up_right' && col + wordLength <= grid[0].length && row - wordLength + 1 >= 0) {
    for (let i = 0; i < wordLength; i++) {
      if (!checkOverlap(row - i, col + i, i)) {
        return false;
      }
    }
    return true;
  } else if (direction === 'diagonal_down_right' && col + wordLength <= grid[0].length && row + wordLength <= grid.length) {
    for (let i = 0; i < wordLength; i++) {
      if (!checkOverlap(row + i, col + i, i)) {
        return false;
      }
    }
    return true;
  } else if (direction === 'diagonal_up_left' && col - wordLength + 1 >= 0 && row - wordLength + 1 >= 0) {
    for (let i = 0; i < wordLength; i++) {
      if (!checkOverlap(row - i, col - i, i)) {
        return false;
      }
    }
    return true;
  } else if (direction === 'diagonal_down_left' && col - wordLength + 1 >= 0 && row + wordLength <= grid.length) {
    for (let i = 0; i < wordLength; i++) {
      if (!checkOverlap(row + i, col - i, i)) {
        return false;
      }
    }
    return true;
  }

  return false;
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
  } else if (direction === 'diagonal_up_left') {
    for (let i = 0; i < wordLength; i++) {
      grid[row - i][col - i] = word[i];
    }
  } else if (direction === 'diagonal_down_left') {
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

export function markWordsInGrid(grid, words, alphabets, maxMarkWord) {
  const markedWords = new Set(); // To track marked words
  const filteredMarkedWords = new Set();
  const maxMarkedWords = Math.min(maxMarkWord, words.length); // Ensure we don't exceed the number of words

  for (const word of words.slice(0, maxMarkedWords)) {
    const cleanedWord = cleanWord(word);
    let placed = false;
    let direction;

    for (let attempt = 0; attempt < 100; attempt++) {
      direction = getRandomDirection(maxMarkWord);

      // Generate random coordinates within grid bounds
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
      } else if (direction === 'diagonal_up_left') {
        row = Math.floor(Math.random() * (grid.length - cleanedWord.length + 1)) + (cleanedWord.length - 1);
        col = Math.floor(Math.random() * (grid[0].length - cleanedWord.length + 1)) + (cleanedWord.length - 1);
      } else if (direction === 'diagonal_down_left') {
        row = Math.floor(Math.random() * (grid.length - cleanedWord.length + 1));
        col = Math.floor(Math.random() * (grid[0].length - cleanedWord.length + 1)) + (cleanedWord.length - 1);
      }

      if (canPlaceWord(grid, cleanedWord, row, col, direction)) {
        placeWord(grid, cleanedWord, row, col, direction);
        placed = true;
        markedWords.add(word);
        filteredMarkedWords.add(cleanedWord);
        break;
      }
    }

    if (!placed) {
      console.log(`Unable to place word: ${word}`);
    }
  }

  // Fill the remaining empty spaces with random letters
  fillEmptySpaces(grid, alphabets);

  var finalGrid : any[] = grid;

  var col = maxMarkWord >=  15 ? 0 : maxMarkWord > 9 ? 2 :maxMarkWord < 10 && maxMarkWord > 6 ? 4 : 4

  console.log("maxMark: "+maxMarkWord)
  if(maxMarkWord>= 15) {
    for (var i = 0; i < finalGrid.length; i++) { 

      for(var j=0; j < col; j++) {
     
        const randomLetter = alphabets.charAt(Math.floor(Math.random() * alphabets.length))
        if(j === 0 ) {
          // finalGrid[i].splice(0, 0, randomLetter)
      }
      else if(j === 1 ) { 
        // finalGrid[i].push(randomLetter)
      }
      }
   
    }
    // let list1 = generateRandomList(11, alphabets)
    // let list2 = generateRandomList(11, alphabets)
    // finalGrid.splice(0, 0, list1)
    // finalGrid.push(list2)

  
  }
  else if(maxMarkWord > 9) {
    for (var i = 0; i < finalGrid.length; i++) { 

      for(var j=0; j < col; j++) {
     
        const randomLetter = alphabets.charAt(Math.floor(Math.random() * alphabets.length))
        if(j === 0 ) {
          finalGrid[i].push(randomLetter)
      }
      else { 
        finalGrid[i].splice(0, 0, randomLetter)
      }
      }
   
    }

    let list1 = generateRandomList(11, alphabets)
    let list2 = generateRandomList(11, alphabets)
    let list4 = generateRandomList(11, alphabets)
    finalGrid.splice(0, 0, list1)
    finalGrid.splice(0, 0, list2)
    finalGrid.push(list4)

  }
  else if(maxMarkWord < 10 && maxMarkWord > 6) {
    for (var i = 0; i < finalGrid.length; i++) { 

      for(var j=0; j < col; j++) {
     
        const randomLetter = alphabets.charAt(Math.floor(Math.random() * alphabets.length))
        if(j === 0 ) {
          finalGrid[i].push(randomLetter)
      }
      else { 
        finalGrid[i].splice(0, 0, randomLetter)
      }
      }
   
    }

    console.log("9__")
    let list1 = generateRandomList(11, alphabets)
    let list2 = generateRandomList(11, alphabets)
    let list4 = generateRandomList(11, alphabets)
    let list5 = generateRandomList(11, alphabets)
    let list6 = generateRandomList(11, alphabets)
    finalGrid.splice(0, 0, list1)
    finalGrid.splice(0, 0, list2)
    finalGrid.push(list4)
    finalGrid.push(list5)
    finalGrid.push(list6)
  }
  else {

    for (var i = 0; i < finalGrid.length; i++) { 

      for(var j=0; j < col; j++) {
     
        const randomLetter = alphabets.charAt(Math.floor(Math.random() * alphabets.length))
        if(j === 0 || j === 1) {
          finalGrid[i].push(randomLetter)
      }
      else { 
        finalGrid[i].splice(0, 0, randomLetter)
      }
      }
   
    }
    console.log("<9__")
    let list1 = generateRandomList(11, alphabets)
    let list2 = generateRandomList(11, alphabets)
    let list4 = generateRandomList(11, alphabets)
    let list5 = generateRandomList(11, alphabets)
    let list6 = generateRandomList(11, alphabets)
    finalGrid.splice(0, 0, list1)
    finalGrid.splice(0, 0, list2)

    finalGrid.push(list4)
    finalGrid.push(list5)
    finalGrid.push(list6)

  }

  return { grid: finalGrid, markedWords: Array.from(markedWords), filteredMarkedWords: Array.from(filteredMarkedWords)};
}

function displayGrid(grid) {
  for (const row of grid) {
    console.log(row.join(' '));
  }
}
