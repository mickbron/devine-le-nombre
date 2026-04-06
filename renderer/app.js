const playerNameInput = document.getElementById('playerName');
const guessInput = document.getElementById('guessInput');
const guessBtn = document.getElementById('guessBtn');
const newGameBtn = document.getElementById('newGameBtn');
const message = document.getElementById('message');
const attemptCount = document.getElementById('attemptCount');
const historyList = document.getElementById('historyList');
const scoreList = document.getElementById('scoreList');

let currentAttempts = 0;
let gameFinished = false;

function resetMessageStyle() {
  message.classList.remove('error', 'success', 'info');
}

function updateAttemptsDisplay() {
  attemptCount.textContent = `Essais : ${currentAttempts}`;
}

function addHistoryEntry(text) {
  const li = document.createElement('li');
  li.textContent = text;
  historyList.appendChild(li);
}

function renderScores(scores) {
  scoreList.innerHTML = '';

  if (!scores || scores.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'Aucun score enregistré.';
    scoreList.appendChild(li);
    return;
  }

  scores.forEach((score) => {
    const li = document.createElement('li');
    li.textContent = `${score.name} - ${score.attempts} essai(s) - ${score.date}`;
    scoreList.appendChild(li);
  });
}

async function loadScores() {
  const scores = await window.guessService.getAllScores();
  renderScores(scores);
}

async function startNewGame() {
  await window.guessService.startGame();

  currentAttempts = 0;
  gameFinished = false;
  historyList.innerHTML = '';
  updateAttemptsDisplay();

  resetMessageStyle();
  message.textContent = 'Nouvelle partie commencée !';
  message.classList.add('info');

  guessInput.value = '';
  guessInput.focus();

  await loadScores();
}

async function checkGuess() {
  if (gameFinished) {
    resetMessageStyle();
    message.textContent = 'La partie est terminée. Lance une nouvelle partie.';
    message.classList.add('info');
    return;
  }

  const value = guessInput.value;
  const result = await window.guessService.checkGuess(value);

  if (result.status === 'error') {
    resetMessageStyle();
    message.textContent = result.message;
    message.classList.add('error');
    return;
  }

  currentAttempts = result.attempts;
  updateAttemptsDisplay();

  if (result.status === 'trop_grand') {
    resetMessageStyle();
    message.textContent = 'Trop grand !';
    message.classList.add('error');
    addHistoryEntry(`Essai ${currentAttempts} : ${value} → Trop grand`);
  } else if (result.status === 'trop_petit') {
    resetMessageStyle();
    message.textContent = 'Trop petit !';
    message.classList.add('error');
    addHistoryEntry(`Essai ${currentAttempts} : ${value} → Trop petit`);
  } else if (result.status === 'gagne') {
    resetMessageStyle();
    message.textContent = `Bravo ! Trouvé en ${currentAttempts} essai(s).`;
    message.classList.add('success');
    addHistoryEntry(`Essai ${currentAttempts} : ${value} → Gagné`);
    gameFinished = true;

    const playerName = playerNameInput.value.trim() || 'Anonyme';
    await window.guessService.saveScore(playerName, currentAttempts);
    await loadScores();
  }

  guessInput.value = '';
  guessInput.focus();
}

guessBtn.addEventListener('click', checkGuess);

guessInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    checkGuess();
  }
});

newGameBtn.addEventListener('click', startNewGame);

startNewGame();