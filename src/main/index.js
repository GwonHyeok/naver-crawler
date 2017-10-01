'use strict'

import { app, BrowserWindow, ipcMain } from 'electron'
import Crawler from './crawler'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  })

  mainWindow.loadURL(winURL)

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

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */

ipcMain.on('start-crawler', (event, {keyword}) => {
  const crawlerInstance = new Crawler()
  const crawler = crawlerInstance.getBusinessCrawler(keyword)

  // 크롤링 성공
  crawler.on('success', () => {
    setTimeout(() => {
      // 로컬 아이템 업데이트
      event.sender.send('success-crawler', {items: crawler.items})
      event.sender.send('complete-crawler')
    }, 500)
  })

  // 크롤링 진행 상황
  crawler.on('progress', ({progress}) => {
    event.sender.send('progress-crawler', {progress})
  })

  // 크롤링 에러
  crawler.on('error', error => {
    event.sender.send('error-crawler', error)
    event.sender.send('complete-crawler')
  })

  // 크롤링 실행
  crawler.run()

  // 크롤링 시작
  event.sender.send('started-crawler', crawler)
})
