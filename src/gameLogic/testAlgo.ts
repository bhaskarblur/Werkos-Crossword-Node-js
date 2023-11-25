function generateCrossword(rows, cols, words, alphabets, maxWords) {
    // Function to clean the word by removing spaces and special characters
    const cleanWord = (word) => {
        const replacements = {
            'eÈÉÊËèéêë': 'E',
            'aÀÁÂÃÄÅàáâãäå': 'A',
            'b': 'B',
            'cÇç': 'C',
            'd': 'D',
            'f': 'F',
            'g': 'G',
            'h': 'H',
            'iÌÍÎÏìíîï': 'I',
            'j': 'J',
            'k': 'K',
            'l': 'L',
            'm': 'M',
            'n': 'N',
            'oÒÓÔÕÖØòóôõöø': 'O',
            'p': 'P',
            'q': 'Q',
            'r': 'R',
            'sŠš': 'S',
            't': 'T',
            'uÙÚÛÜùúûü': 'U',
            'v': 'V',
            'w': 'W',
            'x': 'X',
            'yŸÿ': 'Y',
            'zŽž': 'Z',
            'œ': 'Œ',
            'æ': 'Æ',
            'ð': 'Ð',
            'ñ': 'Ñ',
            'ý': 'Ý',
            'þ': 'Þ',
            '.': '',
            '-' :'',
            ' ' : '',
            "'" : '',
            '!' : '',
            '_' : '',
            '@' : '',
            ',' : '',
            '/'  : ''
          };
        
          for (const k in replacements) {
            const chars = k.split('');
            for (const char of chars) {
              word = word.split(char).join(replacements[k])
            }
          }
        
         return word;
    }
  
    // Function to check if a word can be placed in a specific direction
    const canPlaceWord = (word, row, col, direction) => {
      const length = word.length;
  
      if (direction === 'horizontal') {
        return col + length <= cols;
      } else if (direction === 'vertical') {
        return row + length <= rows;
      } else if (direction === 'diagonalUpRight') {
        return col + length <= cols && row - length + 1 >= 0;
      } else if (direction === 'diagonalDownRight') {
        return col + length <= cols && row + length <= rows;
      }
  
      return false;
    };
  
    // Function to place a word in the grid
    const placeWord = (word, row, col, direction) => {
      for (let i = 0; i < word.length; i++) {
        if (direction === 'horizontal') {
          grid[row][col + i] = word[i];
        } else if (direction === 'vertical') {
          grid[row + i][col] = word[i];
        } else if (direction === 'diagonalUpRight') {
          grid[row - i][col + i] = word[i];
        } else if (direction === 'diagonalDownRight') {
          grid[row + i][col + i] = word[i];
        }
      }
    };
  
    // Initialize the crossword grid
    const grid = Array.from({ length: rows }, () => Array(cols).fill(' '));
  
    // Shuffle the words to place them randomly
    words = words.sort(() => Math.random() - 0.5);
  
    // Track the marked words and filtered words
    const markedWords = [];
    const filteredWords = [];
  
    // Place words in the grid
    for (const word of words) {
      const cleanedWord = cleanWord(word);
  
      if (cleanedWord.length === 0 || filteredWords.includes(cleanedWord)) {
        continue;
      }
  
      for (let i = 0; i < maxWords; i++) {
        const row = Math.floor(Math.random() * rows);
        const col = Math.floor(Math.random() * cols);
        const direction = ['horizontal', 'vertical', 'diagonalUpRight', 'diagonalDownRight'][Math.floor(Math.random() * 4)];
  
        if (canPlaceWord(cleanedWord, row, col, direction)) {
          placeWord(cleanedWord, row, col, direction);
          markedWords.push(word);
          filteredWords.push(cleanedWord);
          break;
        }
      }
    }
  
    return {
      grid,
      markedWords,
      filteredWords,
    };
  }
  
  // Example usage
  const result = generateCrossword(14, 11, ['Hello', 'World', 'Crossword', 'Algorithm', 'NodeJS', 'Grid', 'Mark', 'Direction', 'Generate', 'Words', 'Space'], 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 20);
  
  console.log('Crossword Grid:');
  console.table(result.grid);
  console.log('Marked Words:', result.markedWords);
  console.log('Filtered Words:', result.filteredWords);