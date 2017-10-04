'use strict'

import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import Crawler from './crawler'

const json2csv = require('json2csv')
const fs = require('fs')

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

ipcMain.on('start-crawler', (event, {type, keyword, category}) => {
  const crawlerInstance = new Crawler()
  const crawler = type === 'business' ? crawlerInstance.getBusinessCrawler(keyword) : crawlerInstance.getStoreFarmCrawler(keyword, category)

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

  // 크롤링 취소
  crawler.on('cancel', () => {
    event.sender.send('cancel-crawler')
    event.sender.send('complete-crawler')
  })

  // 크롤링 실행
  crawler.run()

  // 크롤링 시작
  event.sender.send('started-crawler', crawler)

  // 현재 크롤러 설정
  this.currentCrawler = crawler
})

ipcMain.on('stop-crawler', (event) => {
  this.currentCrawler.stop()
})

// CSV 파일 저장 요청
ipcMain.on('save-to-csv', (event, {items, keyword, type}) => {
  const options = {properties: ['openDirectory']}
  dialog.showOpenDialog(mainWindow, options, (filePaths) => {
    // 파일 경로가 제대로 넘어왔을 경우
    if (filePaths.length > 0) {
      // 파일 이름 생성
      const date = new Date()
      let month = `${date.getMonth() + 1}`
      let day = `${date.getDate()}`
      const year = `${date.getFullYear()}`
      let hours = `${date.getHours()}`
      let minutes = `${date.getMinutes()}`

      if (month.length < 2) month = `0${month}`
      if (day.length < 2) day = `0${day}`
      if (hours.length < 2) hours = `0${hours}`
      if (minutes.length < 2) minutes = `0${minutes}`

      // 파일 이름
      const fileName = `${year}${month}${day}_${hours}${minutes}_${keyword}_${type}.csv`

      const fields = []
      const fieldNames = []

      if (type === 'business') {
        fieldNames.push(...['이름', '전화번호', '지번 주소', '도로명 주소', '공통 주소', '카테고리', '설명', '리뷰', '길찾기 URL', '태그'])
        fields.push(...['name', 'phone', 'addr', 'roadAddr', 'commonAddr', 'category', 'desc', 'microReview', 'routeUrl', 'tags'])
      } else if (type === 'storefarm') {
        fieldNames.push(...['업체명', '스토어이름', '전화번호', '사업자형태', '대표이름', '주소', 'URL'])
        fields.push(...['tradeName', 'storeName', 'contact', 'storeType', 'ceo', 'address', 'siteUri'])
      }

      // 파일 저장 작업
      const filePath = filePaths[0]
      const csv = json2csv({data: items, withBOM: true, fields, fieldNames})
      fs.writeFile(`${filePath}/${fileName}`, csv, (error) => {
        if (error) return console.error(error)
        console.log('완료함')
      })
    } else {
      console.error('사용자에 의해 취소됨')
    }
  })
})
