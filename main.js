const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let secretNumber = null;
let attempts = 0;

const scoresFilePath = path.join(__dirname, 'scores.json');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 750,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

function generateSecretNumber(min = 1, max = 100) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function startGame() {
  secretNumber = generateSecretNumber(1, 100);
  attempts = 0;
  return { success: true };
}

function ensureScoresFile() {
  if (!fs.existsSync(scoresFilePath)) {
    fs.writeFileSync(scoresFilePath, JSON.stringify([], null, 2), 'utf-8');
  }
}

function readScores() {
  ensureScoresFile();
  const data = fs.readFileSync(scoresFilePath, 'utf-8');

  try {
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function writeScores(scores) {
  fs.writeFileSync(scoresFilePath, JSON.stringify(scores, null, 2), 'utf-8');
}

ipcMain.handle('guess:start', async () => {
  return startGame();
});

ipcMain.handle('guess:check', async (event, guessedNumber) => {
  const value = Number.parseInt(guessedNumber, 10);

  if (secretNumber === null) {
    startGame();
  }

  if (Number.isNaN(value)) {
    return {
      status: 'error',
      message: 'Veuillez entrer un nombre valide.'
    };
  }

  if (value < 1 || value > 100) {
    return {
      status: 'error',
      message: 'Le nombre doit être compris entre 1 et 100.'
    };
  }

  attempts++;

  if (value > secretNumber) {
    return {
      status: 'trop_grand',
      attempts
    };
  }

  if (value < secretNumber) {
    return {
      status: 'trop_petit',
      attempts
    };
  }

  return {
    status: 'gagne',
    attempts
  };
});

ipcMain.handle('score:save', async (event, playerName, scoreAttempts) => {
  const scores = readScores();

  const newScore = {
    name: playerName && playerName.trim() ? playerName.trim() : 'Anonyme',
    attempts: scoreAttempts,
    date: new Date().toLocaleString()
  };

  scores.push(newScore);

  scores.sort((a, b) => a.attempts - b.attempts);

  const top5 = scores.slice(0, 5);
  writeScores(top5);

  return {
    success: true,
    scores: top5
  };
});

ipcMain.handle('score:getAll', async () => {
  const scores = readScores();
  scores.sort((a, b) => a.attempts - b.attempts);

  return scores.slice(0, 5);
});

app.whenReady().then(() => {
  createWindow();
  startGame();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});