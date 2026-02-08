import { app, BrowserWindow, Menu, MenuItemConstructorOptions, ipcMain } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    title: 'Pace Electron App',
    webPreferences: {
      preload: path.join(MAIN_DIST, 'preload.mjs'),
    },
  })

  // Make menu bar visible on Windows
  win.setMenuBarVisibility(true)

  // Create menu for this window
  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit()
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            win?.webContents.reload()
          }
        },
        {
          label: 'Force Reload',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            win?.webContents.reloadIgnoringCache()
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'F12',
          click: () => {
            win?.webContents.toggleDevTools()
          }
        },
        { type: 'separator' },
        {
          label: 'Toggle Theme',
          accelerator: 'CmdOrCtrl+T',
          click: () => {
            console.log('Toggle Theme clicked')
            win?.webContents.send('toggle-theme')
          }
        },
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            // Show about dialog or something
          }
        }
      ]
    }
  ]
  const menu = Menu.buildFromTemplate(menuTemplate as MenuItemConstructorOptions[])
  Menu.setApplicationMenu(menu)

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

const dataFilePath = path.join(app.getPath('userData'), 'pace-data.json')

// IPC handlers for data persistence
ipcMain.handle('save-data', async (_event, data) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
    return { success: true }
  } catch (error) {
    console.error('Error saving data:', error)
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('load-data', async () => {
  try {
    if (fs.existsSync(dataFilePath)) {
      const data = fs.readFileSync(dataFilePath, 'utf-8')
      return JSON.parse(data)
    } else {
      // Return default empty data structure
      return {
        people: [],
        circles: [],
        groups: [],
        checkins: [],
        actionItems: [],
        tags: [],
        covenantTypes: [],
        personTags: [],
        personGroups: [],
        personCircles: [],
        personCovenantTypes: [],
        checkinTags: [],
        actionItemTags: [],
        checkinCovenantTypes: []
      }
    }
  } catch (error) {
    console.error('Error loading data:', error)
    return {
      people: [],
      circles: [],
      groups: [],
      checkins: [],
      actionItems: [],
      tags: [],
      covenantTypes: [],
      personTags: [],
      personGroups: [],
      personCircles: [],
      personCovenantTypes: [],
      checkinTags: [],
      actionItemTags: [],
      checkinCovenantTypes: []
    }
  }
})

app.whenReady().then(() => {
  createWindow()
})
