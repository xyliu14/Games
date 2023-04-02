const canvas = document.getElementById('game'); // Changed from 'game-board' to 'game'
const context = canvas.getContext('2d');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

const foodCount = 5; // Number of food items you want on the board
const snakeSpeed = 100;

let snake = [{ x: 10, y: 10 }];
let velocity = { x: 0, y: 0 };
let food = [];
let growSnake = false;
let eatenLetters = [];
let currentPinyinIndex = 0; 
let pinyinDictionary;
let chineseWords;
let requiredPinyinLetters;
let isGameOver = false;
//let score = 0;



const pinyinLetters = ['ā', 'á', 'ǎ', 'à', 'a', 'ō', 'ó', 'ǒ', 'ò', 'o', 'ē', 'é', 'ě', 'è', 'e', 
                        'ī', 'í', 'ǐ', 'ì', 'i', 'ū', 'ú', 'ǔ', 'ù', 'u', 'ǖ', 'ǘ', 'ǚ', 'ǜ', 'ü', 
                        'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'zh', 
                        'ch', 'sh', 'r', 'z', 'c', 's', 'y', 'w'];


// Load the files and parse them into the appropriate data structures
async function loadFiles() {
  const chineseWordsResponse = await fetch('asset/chinese_words.txt');
  chineseWords = (await chineseWordsResponse.text()).split('\n');

  const pinyinDictionaryResponse = await fetch('pinyin-dictionary.txt');
  const pinyinDictionaryText = await pinyinDictionaryResponse.text();
  pinyinDictionary = parsePinyinDictionary(pinyinDictionaryText);

  startGame(chineseWords, pinyinDictionary);
}


function parsePinyinDictionary(fileContents) {
  const lines = fileContents.split('\n');
  const dictionary = {};

  for (let line of lines) {
    const [char, pinyin] = line.split(',');

    if (!dictionary[pinyin]) {
      dictionary[pinyin] = [];
    }
    dictionary[pinyin].push(char);
  }

  return dictionary;
}

loadFiles();

function generateTargetWord(chineseWords, pinyinDictionary) {
  // Display a random Chinese word
  const randomWordIndex = Math.floor(Math.random() * chineseWords.length);
  const targetWord = chineseWords[randomWordIndex];
  displayTargetWord(targetWord);
  const targetWordPinyin = targetWord.split('').map((char) => getPinyinForCharacter(char, pinyinDictionary));
  requiredPinyinLetters = targetWordPinyin.join('').split('');

  currentPinyinIndex = 0;
}

function startGame(chineseWords, pinyinDictionary) {
  // Your existing game initialization code

  generateTargetWord(chineseWords, pinyinDictionary);

  // Generate initial food positions
  for (let i = 0; i < foodCount; i++) {
    if (i === 0) {
      food.push(generateFood(requiredPinyinLetters[currentPinyinIndex])); // Generate food with the first required letter
    } else {
      food.push(generateFood()); // Generate food with a random letter
    }
  }

  food = food.filter((item, index, self) => 
    index === self.findIndex((t) => (t.x === item.x && t.y === item.y))
  );

  // Fill up the food array if duplicates were removed
  while (food.length < foodCount) {
    food.push(generateFood());
  }

  // Your existing game loop code
  gameLoop();
}

function gameLoop() {
  if (isGameOver) {
    return;
  }
  
  moveSnake();
  
  if (isOutOfBounds()) {
    gameOver();
    isGameOver = true;
    return;
  }
  
  checkFoodCollision();
  checkSnakeCollision();
  draw();
  
  setTimeout(gameLoop, snakeSpeed);
}

function displayTargetWord(word) {
  const targetWordElement = document.getElementById('target-word');
  targetWordElement.textContent = word;
}

function moveSnake() {
    const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };
    snake.unshift(head);
    
    if (growSnake) {
      // Add a new segment to the snake and reset the growSnake flag
      growSnake = false;
    } else {
      // Remove the last segment if the snake is not growing
      snake.pop();
    }
  }

function isPositionValid(x, y) {
    // Check if the position is occupied by the snake
    for (let cell of snake) {
      if (cell.x === x && cell.y === y) {
        return false;
      }
    }
  
    // Check if the position is occupied by other food items
    for (let f of food) {
      if (f.x === x && f.y === y) {
        return false;
      }
    }
  
    return true;
}

function generateValidFoodPosition() {
    let x, y;
    do {
      x = Math.floor(Math.random() * tileCount);
      y = Math.floor(Math.random() * tileCount);
    } while (!isPositionValid(x, y));
  
    return { x, y };
}

function generateFood(letter) {
  const position = generateValidFoodPosition();
  letter = letter || pinyinLetters[Math.floor(Math.random() * pinyinLetters.length)]; // Use the provided letter or pick a random one
  return { x: position.x, y: position.y, letter };
}

function checkFoodCollision() {
  for (let i = 0; i < food.length; i++) {
    if (snake[0].x === food[i].x && snake[0].y === food[i].y) {
      // Signal to grow the snake in the next iteration
      const eatenLetter = food[i].letter;
      eatenLetters.push(eatenLetter);
      displayEatenLetters();
      growSnake = true;

      // Replace the eaten food item with the next required letter or a random letter
      if (eatenLetter === requiredPinyinLetters[currentPinyinIndex]) {
        currentPinyinIndex++;
        if (currentPinyinIndex >= requiredPinyinLetters.length) {
          // If all the required letters have been eaten, display the next target word
          currentPinyinIndex = 0;
          clearEatenLettersDisplay();
          eatenLetters = [];
          generateTargetWord(chineseWords, pinyinDictionary);
          // Generate new food items while containing the next target letter
          food = [];
          for (let i = 0; i < foodCount; i++) {
            if (i === 0) {
              food.push(generateFood(requiredPinyinLetters[currentPinyinIndex])); // Generate food with the next required letter
            } else {
              food.push(generateFood()); // Generate food with a random letter
            }
          }
        } else {
          food = [];
          for (let i = 0; i < foodCount; i++) {
            if (i === 0) {
              food.push(generateFood(requiredPinyinLetters[currentPinyinIndex])); // Generate food with the next required letter
            } else {
              food.push(generateFood()); // Generate food with a random letter
            }
          }
        }
      } else {
        gameOver(); // Call the gameOver function if the target letter is not eaten
        return;
      }
    }
  }
}



function isOutOfBounds() {
    const head = snake[0];
    return head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount;
}

function checkSnakeCollision() {
  for (let i = 1; i < snake.length; i++) {
    if (snake[0].x === snake[i].x && snake[0].y === snake[i].y) {
      snake = [{ x: 10, y: 10 }];
      velocity = { x: 0, y: 0 };
    }
  }
}

function draw() {
  context.fillStyle = 'papayawhip';
  context.fillRect(0, 0, canvas.width, canvas.height);

  if (!isGameOver) {
    context.fillStyle = 'lime';
    for (let cell of snake) {
      context.fillRect(cell.x * gridSize, cell.y * gridSize, gridSize - 2, gridSize - 2);
    }

    context.fillStyle = 'transparent';
    context.font = '16px sans-serif';
    for (let f of food) {
      context.fillRect(f.x * gridSize, f.y * gridSize, gridSize - 2, gridSize - 2);
      context.fillStyle = 'darkslategrey';
      context.fillText(f.letter, f.x * gridSize + 4, f.y * gridSize + gridSize / 2 + 4);
      context.fillStyle = 'transparent';
    }
  }
}


function gameOver() {
  isGameOver = true;
  clearEatenLettersDisplay();

  // Display the correct target word
  const targetWordElement = document.getElementById('target-word');
  targetWordElement.textContent = requiredPinyinLetters.join('');

  // Clear the canvas
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background
  context.fillStyle = 'papayawhip';
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Delay the drawing of the "Game Over" text
  setTimeout(() => {
    context.fillStyle = 'black';
    context.font = '48px sans-serif';
    context.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2 - 50);
  }, 100);

  // Create and display the "Play Again" button
  const button = document.createElement('button');
  button.innerHTML = 'Play Again';
  button.style.position = 'absolute';
  button.style.left = (canvas.width / 2 - 50) + 'px';
  button.style.top = (canvas.height / 2) + 'px';
  document.body.appendChild(button);

  // Restart the game when the button is clicked
  button.addEventListener('click', () => {
    document.body.removeChild(button);
    restartGame();
  });
}



function restartGame() {
  snake = [{ x: 10, y: 10 }];
  velocity = { x: 0, y: 0 };
  growSnake = false;
  food = [];
  eatenLetters = [];
  isGameOver = false;

  // Remove the "Play Again" button from the DOM
  const button = document.getElementById('play-again-button');
  if (button) {
    button.parentNode.removeChild(button);
  }

  // Generate a new target word
  generateTargetWord(chineseWords, pinyinDictionary);

  // Generate initial food positions
  for (let i = 0; i < foodCount; i++) {
    if (i === 0) {
      food.push(generateFood(requiredPinyinLetters[currentPinyinIndex])); // Generate food with the first required letter
    } else {
      food.push(generateFood()); // Generate food with a random letter
    }
  }

  // Remove duplicates from the food array
  food = food.filter((item, index, self) =>
    index === self.findIndex((t) => (t.x === item.x && t.y === item.y))
  );

  // Fill up the food array if duplicates were removed
  while (food.length < foodCount) {
    food.push(generateFood());
  }

  gameLoop();
}


function getPinyinForCharacter(character, pinyinDictionary) {
  for (const pinyin in pinyinDictionary) {
    if (pinyinDictionary[pinyin].includes(character)) {
      return pinyin;
    }
  }

  return ''; // Return an empty string if the character's pinyin is not found
}


function displayEatenLetters() {
  const eatenLettersElement = document.getElementById('eaten-letters');
  eatenLettersElement.innerHTML = '';
  
  for (let i = 0; i < eatenLetters.length; i++) {
    const letterElement = document.createElement('span');
    letterElement.textContent = eatenLetters[i];
    eatenLettersElement.appendChild(letterElement);
  }
}

function clearEatenLettersDisplay() {
    const eatenLettersElement = document.getElementById('eaten-letters');
    eatenLettersElement.innerHTML = '';
}

document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'ArrowUp':
    case 'w':
      if (velocity.y === 0) velocity = { x: 0, y: -1 };
      break;
    case 'ArrowDown':
    case 's':
      if (velocity.y === 0) velocity = { x: 0, y: 1 };
      break;
    case 'ArrowLeft':
    case 'a':
      if (velocity.x === 0) velocity = { x: -1, y: 0 };
      break;
    case 'ArrowRight':
    case 'd':
      if (velocity.x === 0) velocity = { x: 1, y: 0 };
      break;
  }
});
