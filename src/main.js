const { dialog, app, BrowserWindow, ipcMain, webContents , shell } = require('electron');
const path = require("path");
const fs = require('fs');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

let mainWindow; 

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 782,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false, // it's safer to keep this false
      contextIsolation: true, // it's safer to keep this true
      preload: path.join(__dirname, "preload.js"),
      webviewTag: true,
      nativeWindowOpen: true
    },
  });
  mainWindow.loadFile(path.join(__dirname, "index.html"));
  // mainWindow.loadURL("https://gsi.fiia.gov.iq/portal");

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // This will prevent the default behavior and ensure that no new window is created
    // mainWindow.loadURL(url);
    return { action: "deny" };
  });
  mainWindow.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
    if (frameName === '_blank') {  
        event.preventDefault()
        // Open url in the default browser.
        shell.openExternal(url)
    }
});

  mainWindow.webContents.on("new-window", function (ev, url) {
    // Prevent the default behavior
    ev.preventDefault();
    // Manually load the new URL in the current 
    console.log("will redirect " , url)
    mainWindow.loadURL(url);
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
  

  ipcMain.on('goBack', () => {
    mainWindow.webContents.goBack()
  });

  ipcMain.on('goForward', () => {
    mainWindow.webContents.goForward()

  });

};




app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(createWindow);


ipcMain.on('screenshot', (event) => {
  mainWindow.webContents
    .capturePage()
    .then((image) => {
      dialog
        .showSaveDialog({
          title: "Select the File Path to save",
          defaultPath: path.join(__dirname, "../assets/capture.png"),
          buttonLabel: "Save",
          filters: [
            {
              name: "Images",
              extensions: ["png", "jpg", "gif"],
            },
          ],
        })
        .then((file) => {
          if (!file.canceled) {
            fs.writeFile(file.filePath.toString(), image.toPNG(), (err) => {
              if (err) throw err;
              console.log("Image Saved!");
            });
          }
        });
    })
    .catch((err) => {
      console.log(err);
    });
});




ipcMain.on('reload', (_) => {
  let contents = webContents.getAllWebContents();
  const webview = contents.find(c => c.getType() === 'webview'); // find webview

  if (webview) {
    webview.reload();
  }
});