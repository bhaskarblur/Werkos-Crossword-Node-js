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
    const directions = ['horizontal', 'vertical', 'diagonal'];
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

    for (const word of words) {
        let placed = false;

        for (let attempt = 0; attempt < 100; attempt++) {
            const direction = getRandomDirection();
            const row = Math.floor(Math.random() * rows);
            const col = Math.floor(Math.random() * cols);

            if (canPlaceWord(grid, word, row, col, direction)) {
                placeWord(grid, word, row, col, direction);
                placed = true;
                break;
            }
        }

        if (!placed) {
            console.log(`Unable to place word: ${word}`);
        }
    }

    fillEmptySpaces(grid, alphabetList);
}

function displayGrid(grid) {
    for (const row of grid) {
        console.log(row.join(' '));
    }
}