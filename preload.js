const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  launchGame: (exePath) => ipcRenderer.invoke('launch-game', exePath),
  getAppVersion: () => ipcRenderer.invoke('get-app-version')
});
