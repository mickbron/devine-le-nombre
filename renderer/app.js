const guessInput = document.getElementById('guessInput');
const guessBtn = document.getElementById('guessBtn');
const newGameBtn = document.getElementById('newGameBtn');
const message = document.getElementById('message');
const attemptCount = document.getElementById('attemptCount');
const historyList = document.getElementById('historyList');

// Variable accessible dans le renderer c'est volontaire en version 1
let secret = generateSecretNumber();
let attempts = 0;

function generateSecretNumber() {
  return Math.floor(Math.random() * 100) + 1;
}

function resetMessageStyle() {
  message.classList.remove('error', 'success', 'info');
}

function updateAttemptsDisplay() {
  attemptCount.textContent = `Essais : ${attempts}`;
}

function addHistoryEntry(text) {
  const li = document.createElement('li');
  li.textContent = text;
  historyList.appendChild(li);
}

function startNewGame() {
  secret = generateSecretNumber();
  attempts = 0;
  historyList.innerHTML = '';
  updateAttemptsDisplay();

  resetMessageStyle();
  message.textContent = 'Nouvelle partie commencée !';
  message.classList.add('info');

  guessInput.value = '';
  guessInput.focus();
}

function checkGuess() {
  const value = Number.parseInt(guessInput.value, 10);

  if (Number.isNaN(value)) {
    resetMessageStyle();
    message.textContent = 'Veuillez entrer un nombre valide.';
    message.classList.add('error');
    return;
  }

  if (value < 1 || value > 100) {
    resetMessageStyle();
    message.textContent = 'Le nombre doit être compris entre 1 et 100.';
    message.classList.add('error');
    return;
  }

  attempts++;
  updateAttemptsDisplay();

  if (value > secret) {
    resetMessageStyle();
    message.textContent = 'Trop grand !';
    message.classList.add('error');
    addHistoryEntry(`Essai ${attempts} : ${value} → Trop grand`);
  } else if (value < secret) {
    resetMessageStyle();
    message.textContent = 'Trop petit !';
    message.classList.add('error');
    addHistoryEntry(`Essai ${attempts} : ${value} → Trop petit`);
  } else {
    resetMessageStyle();
    message.textContent = `Bravo ! Trouvé en ${attempts} essai(s).`;
    message.classList.add('success');
    addHistoryEntry(`Essai ${attempts} : ${value} → Gagné`);
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

updateAttemptsDisplay();
guessInput.focus();