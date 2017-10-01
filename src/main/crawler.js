const Builder = require('cl-naver-crawler/crawler/builder')
const BusinessCrawler = require('cl-naver-crawler/crawler/business')
const StoreFarmCrawler = require('cl-naver-crawler/crawler/storefarm')
const json2csv = require('json2csv')
const fs = require('fs')

export default class Crawler {
  getBusinessCrawler (keyword) {
    return new Builder()
      .setCrawler(BusinessCrawler)
      .setKeyword(keyword)
      .build()
  }

  getStoreFarmCrawler (keyword) {
    return new Builder()
      .setCrawler(StoreFarmCrawler)
      .setKeyword(keyword)
      .build()
  }

  saveToCsv (items) {
    return new Promise((resolve, reject) => {
      const csv = json2csv({data: items})
      fs.writeFile('/Users/ghyeok/Desktop/file.csv', csv, function (err) {
        if (err) {
          reject(err)
          throw err
        }
        resolve('file saved')
      })
    })
  }
}
