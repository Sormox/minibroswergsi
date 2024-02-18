const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld('actions', {
    reload: () => { ipcRenderer.send('reload'); },
    goBack: () => { ipcRenderer.send('goBack'); },
    goForward: () => { ipcRenderer.send('goForward'); },
    screenshot: () => { ipcRenderer.send('screenshot'); },
    openWindow: (id) => {
        ipcRenderer.send('webview-dom-ready', id)
    }
});

ipcMain.on('webview-dom-ready', (_, id) => {
    const wc = webContents.fromId(id)
    wc.setWindowOpenHandler(({ url }) => {
        const protocol = (new URL(url)).protocol
        if (['https:', 'http:'].includes(protocol)) {
            shell.openExternal(url)
        }
        return { action: 'deny' }
    })
})