//app.js
import './common/util'
import { BAAS_CLIENT_ID } from './config/constants'
import { login, finishInitialization } from './common/login'
import wordListIO from './io/wordListIO'
import WORD_LIST_DATA from './assets/wordListData/wordList.js'
import './lib/BaaS/sdk-v1.4.0.js'

App({
  onLaunch() {
    // 初始化知晓云
    wx.BaaS.init(BAAS_CLIENT_ID)

    if (!this.getUserID()) {
      login()
    } else {
      finishInitialization()
    }
  },

  onHide() {
    wx.BaaS.storage.set('WORD_LIST_DATA', '')
  },

  getUserID() {
    let userID = wx.BaaS.storage.get('uid')
    return userID ? Number(userID) : userID
  },
  saveInvitationInfo({ uid, lotteryID }) {
    wx.BaaS.storage.set('my_inviter_uid', uid)
    wx.BaaS.storage.set('invitation_lottery_id', lotteryID)
  },
  getInvitationInfo() {
    let uid = wx.BaaS.storage.get('my_inviter_uid')
    uid = uid ? Number(uid) : uid
    let lotteryID = wx.BaaS.storage.get('invitation_lottery_id')
    return {
      uid,
      lotteryID
    }
  },
  /**
   * @return {Promise} WORD_LIST_DATA
   */
  getWordList() {
    return new Promise((resolve) => {
      let wordListDataStr = wx.BaaS.storage.get('WORD_LIST_DATA')
      if (wordListDataStr) {
        let wordListData = JSON.parse(wordListDataStr)
        resolve(wordListData)
      } else {
        wx.util.showLoading()
        wordListIO.getWordListData().then(res => {
          wx.util.hideLoading()
          if (res.data.objects[0]) {
            wx.BaaS.storage.set('WORD_LIST_DATA', JSON.stringify(res.data.objects[0]))
            resolve(res.data.objects[0])
          } else {
            throw new Error('cannot refresh WORD_LIST_DATA')
          }
        }).catch(() => {
          wx.util.hideLoading()
          wx.BaaS.storage.set('WORD_LIST_DATA', JSON.stringify(WORD_LIST_DATA))
          resolve(WORD_LIST_DATA)
        })
      }
    })
  }
})