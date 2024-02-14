const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld('actions', {
    reload: () => { ipcRenderer.send('reload'); },
    goBack: () => { ipcRenderer.send('goBack'); },
    goForward: () => { ipcRenderer.send('goForward'); },
    screenshot: () => { ipcRenderer.send('screenshot'); }
});