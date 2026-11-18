const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('wazal', {
  platform: process.platform
});
