const canvas = document.getElementById('game'); // Changed from 'game-board' to 'game'
const context = canvas.getContext('2d');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

const foodCount = 3; // Number of food items you want on the board
let snake = [{ x: 10, y: 10 }];
let velocity = { x: 0, y: 0 };
let food = [];
let growSnake = false;
let eatenLetters = [];

const pinyinLetters = ['ā', 'á', 'ǎ', 'à', 'a', 'ō', 'ó', 'ǒ', 'ò', 'o', 'ē', 'é', 'ě', 'è', 'e', 
                        'ī', 'í', 'ǐ', 'ì', 'i', 'ū', 'ú', 'ǔ', 'ù', 'u', 'ǖ', 'ǘ', 'ǚ', 'ǜ', 'ü', 
                        'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'zh', 
                        'ch', 'sh', 'r', 'z', 'c', 's', 'y', 'w'];

let dictionary = {};
// Fetch the file using an AJAX request
fetch('test.txt')
  .then(response => response.text())
  .then(fileContents => {
    const lines = fileContents.split('\n');
    const characters = lines.map(line => line.replace('\n', ''));

    const dictionary = {}; // empty object to store the dictionary

    for (let i = 0; i < characters.length; i++) {
      const char = characters[i];
      const pinyinList = pinyin(char);
      for (let j = 0; j < pinyinList.length; j++) {
        const pinyinStr = pinyinList[j];
        if (!dictionary[pinyinStr]) {
          dictionary[pinyinStr] = [];
        }
        dictionary[pinyinStr].push(char);
      }
    }
  })
  .catch(error => {
    console.error('Error fetching the file:', error);
  });
  

function gameLoop() {
    moveSnake();
  
    if (isOutOfBounds()) {
      gameOver();
      return;
    }
  
    checkFoodCollision();
    checkSnakeCollision();
    draw();
  
    setTimeout(gameLoop, 100);
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
  

function randomizeFoodPosition() {
    for (let i = 0; i < foodCount; i++) {
        const position = generateValidFoodPosition();
        const letter = pinyinLetters[Math.floor(Math.random() * pinyinLetters.length)];
        food.push({ x: position.x, y: position.y, letter });
      }
}

function checkFoodCollision() {
    for (let i = 0; i < food.length; i++) {
        if (snake[0].x === food[i].x && snake[0].y === food[i].y) {
          // Signal to grow the snake in the next iteration
          const eatenLetter = food[i].letter;
          eatenLetters.push(eatenLetter);
          
          displayEatenLetters();

          growSnake = true;
    
          // Replace all food items with new ones
          for (let j = 0; j < food.length; j++) {
            const position = generateValidFoodPosition();
            const letter = pinyinLetters[Math.floor(Math.random() * pinyinLetters.length)];
            food[j] = { x: position.x, y: position.y, letter };
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

function gameOver() {
    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    clearEatenLettersDisplay();
  
    // Display "Game Over" text
    context.fillStyle = 'black';
    context.font = '48px sans-serif';
    context.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2 - 50);
  
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
    randomizeFoodPosition();
    gameLoop();
}

function displayEatenLetters() {
    const eatenLettersElement = document.getElementById('eaten-letters');
    eatenLettersElement.innerHTML = '';
  
    for (let i = 0; i < eatenLetters.length; i++) {
      const letterElement = document.createElement('span');
      letterElement.textContent = eatenLetters[i];
      eatenLettersElement.appendChild(letterElement);
    }
    
    //   // Display the Chinese character under the eaten-letters div
    if (eatenLetters.length >= 2) {
        const lastTwoLetters = eatenLetters.slice(-2).join('');
        console.log('Last two letters:', lastTwoLetters);
        
        const correspondingCharacters = dictionary[lastTwoLetters];
        console.log('Corresponding characters:', correspondingCharacters);
        
        if (correspondingCharacters && correspondingCharacters.length > 0) {
          const randomIndex = Math.floor(Math.random() * correspondingCharacters.length);
          const chineseCharacter = correspondingCharacters[randomIndex];
          console.log('Chinese character:', chineseCharacter);
          
          const chineseCharacterElement = document.createElement('div');
          chineseCharacterElement.textContent = chineseCharacter;
          eatenLettersElement.appendChild(chineseCharacterElement);
        }
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

randomizeFoodPosition(); // Initialize food positions
gameLoop(); // Start the game loop