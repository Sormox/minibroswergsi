const { dialog, app, BrowserWindow, ipcMain, webContents } = require('electron');
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
      webviewTag:true

    },
  });
  mainWindow.loadFile('index.html');

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // This will prevent the default behavior and ensure that no new window is created
    // mainWindow.loadURL(url);
    return { action: "deny" };
  });

  mainWindow.webContents.on("new-window", function (ev, url) {
    // Prevent the default behavior
    ev.preventDefault();
    // Manually load the new URL in the current window
    mainWindow.loadURL(url);
  });



  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.insertCSS(`
    .js-orgname {
      visibility: hidden;
      position: relative;
  } 
    
  .js-orgname::after {
      content: "Sign in to G.S.I - FIIA";
      visibility: visible;
      position: absolute;
      margin-left:20px !important;
      top: 15px !important;
      left: 0;
      font-size:18px;
  }
  
    #gnav-dist-esri-Australia-tm {
        display: none;
        postion:relative;
    }
  
  .js-header::after {
      content: "";
      background-image: url('https://i.ibb.co/F4Qhg49/image.png');
      background-size: contain;
      background-repeat: no-repeat;
      position: absolute;
      top: 10px;
      right: 15px; 
      width: 54px; 
      height: 54px; 
      visibility: visible;
  }
  @media screen and (max-width: 900px) {
    .js-header{
      padding-top:5px !important;
      margin-right:10px !important;
      margin-botom:-10px !important;
    }
    .header-bar {
      padding: 11px 18px 11px 18px  !important;
      width: calc(1.5rem + 400px) !important;
      transform: translate(-1.88rem,-2.5rem) !important;
     }
  }

  `);
  });

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