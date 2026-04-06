const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('guessService', {
  startGame: () => ipcRenderer.invoke('guess:start'),
  checkGuess: (number) => ipcRenderer.invoke('guess:check', number),
  saveScore: (name, attempts) => ipcRenderer.invoke('score:save', name, attempts),
  getAllScores: () => ipcRenderer.invoke('score:getAll')
});