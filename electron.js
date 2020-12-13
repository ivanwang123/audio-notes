const {app, BrowserWindow} = require('electron')
const path = require('path')
const isDev = require('electron-is-dev')
const Store = require('./Store')
const ipcMain = require('electron').ipcMain
const url = require('url');

const {App} = require('./app.js')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 740, 
    height: 500,
    minWidth: 740,
    minHeight: 300,
    autoHideMenuBar: true,
    frame: false,
    icon: __dirname+'/public/assets/QuartzLogo.ico',
    webPreferences: {
      nodeIntegration: true
    }
  })

  mainWindow.removeMenu()

  mainWindow.loadURL(`http://localhost:${App.get('port')}/`);

  mainWindow.on('closed', () => mainWindow = null)
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

ipcMain.on('close', () => {
  mainWindow.close()
})

ipcMain.on('fullscreen', () => {
  mainWindow.setFullScreen(true)
})

ipcMain.on('exit-fullscreen', () => {
  mainWindow.setFullScreen(false)
})