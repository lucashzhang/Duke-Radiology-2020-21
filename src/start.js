const express = require('express')
const server = express()
const port = 8878

server.get('/', (req, res) => {
  res.send('Hello World!')
})

server.listen(port, () => {
  console.log(`Backend Setup at http://localhost:${port}`)
})

const electron = require('electron')
const app = electron.app
const path = require('path')
const isDev = require('electron-is-dev')

const BrowserWindow = electron.BrowserWindow

let mainWindow

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true, // <--- flag
            nodeIntegrationInWorker: true, // <---  for web workers
            enableRemoteModule: true
        },
    })

    mainWindow.loadURL(
        isDev
            ? 'http://localhost:3000'
            : `file://${path.join(__dirname, '../build/index.html')}`,
    )

    mainWindow.on('closed', () => {
        mainWindow = null
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow()
    }
})
