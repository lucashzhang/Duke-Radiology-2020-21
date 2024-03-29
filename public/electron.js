const electron = require("electron"); 
const app = electron.app; 
const BrowserWindow = electron.BrowserWindow; 
const path = require("path"); 
const isDev = require("electron-is-dev"); 
require('@electron/remote/main').initialize();
let mainWindow;

function createWindow() { 
    mainWindow = new BrowserWindow({ 
        width: 900, 
        height: 680,
        webPreferences: {
            nodeIntegration: true, // <--- flag
            // nodeIntegrationInWorker: true, // <---  for web workers
            enableRemoteModule: true,
            contextIsolation: false
        },
    }); 
    mainWindow.loadURL(isDev ? "http://localhost:3000" : `file://${path.join(__dirname, "../build/index.html")}`); 
    mainWindow.on("closed", () => (mainWindow = null)); 
    if (!isDev) {
        mainWindow.removeMenu();
    }
} 

app.on("ready", createWindow); 
app.on("window-all-closed", () => { 
    if (process.platform !== "darwin") { 
        app.quit(); 
    } 
}); 
app.on("activate", () => { 
    if (mainWindow === null) { 
        createWindow(); 
    } 
});