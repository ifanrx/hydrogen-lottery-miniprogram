'use strict'
import lotteryIO from '@/io/lotteryIO'
import userLotteryRecordIO from '@/io/userLotteryRecordIO'

import {ROUTE} from '@/config/constants'

import ICON_WECHAT_LOGO from '@/assets/img/weixin.svg'
import ICON_HEADSET from '@/assets/img/headset.svg'
import ICON_HUNGRY from '@/assets/img/hungry.svg'
import ICON_SHAPE from '@/assets/img/shape.svg'
import ICON_FILL from '@/assets/img/fill.svg'
import ICON_HEART_FACE from '@/assets/img/heart-face.svg'
import ICON_HAND from '@/assets/img/hand-pointing-down.svg'

const ERR_TYPE = {
  'NOT_LOTTERY_EXIST': 'NOT_LOTTERY_EXIST'
}

Page({
  data: {
    ICON_FILL,
    ICON_WECHAT_LOGO,
    ICON_HUNGRY,
    ICON_SHAPE,
    ICON_HEADSET,
    ICON_HEART_FACE,
    ICON_HAND,
    LOTTERY_CONTACT: ROUTE.LOTTERY_CONTACT,
    pageContainerMarginTop: `${wx.util.getStatusBarHeight() * 2}rpx`,
    pageContainerPaddingTop: '80rpx',
    inited: false,
    myLuckyFriendRecord: [],
    myLuckyFriendName: '',
  },

  onLoad() {
    let {lottery_ordinal} = this.options
    let lotteryOrdinal = lottery_ordinal
    if (!lotteryOrdinal) return

    lotteryOrdinal = Number(lotteryOrdinal)
    this.setData({
      lotteryOrdinal,
    })
    wx.util.showLoading()
    this.initData(lotteryOrdinal)
    this.getWordList()
  },

  initData(ordinal) {
    lotteryIO.getLotteryByOrdinal(ordinal).then(res => {
      let record = res.data.objects[0]
      if (!record) {
        return wx.showToast({
          title: '暂无抽奖记录',
          icon: 'none'
        })
      }
      this.setData({
        currentLottery: record,
      })
      return Promise.all([this.setMyLotteryRecord(record), this.setCurrentLotteryLucky(record)])
    }).catch(wx.util.formateResponse)
      .finally(() => {
        wx.util.hideLoading()
        this.setData({inited: true})
      })
  },
  setCurrentLotteryLucky(currentLottery) {
    return userLotteryRecordIO.findUserLotteryByUids(currentLottery.id, currentLottery.lucky).then(res => {
      this.setData({
        currentLotteryLuckyRecord: res.data.objects
      })
    })
  },
  /**
   *
   * @param {Object} currentLottery 本结果页的 lottery 记录
   * @desc 可能会产生的 side effect: 执行 setMyLuckyFriendRecord
   */
  setMyLotteryRecord(currentLottery) {
    let userID = getApp().getUserID()
    let lotteryID = currentLottery.id
    return userLotteryRecordIO.findUserLottery(userID, lotteryID).then(res => {
      let record = res.data.objects[0]
      if (!record) {
        // 本人没有参与此次活动
        this.setData({
          joinedCurrent: false,
        })
        return null
      }

      let myFriend = record.friend_accepted_invitation || []
      let iAmLucky = !!currentLottery.lucky.find(item => item == userID)
      let luckyFriend = currentLottery.lucky.filter(lucky => myFriend.find(friend => friend == lucky))
      if (!iAmLucky && luckyFriend.length) {
        this.setMyLuckyFriendRecord(lotteryID, luckyFriend).catch(wx.util.formateResponse)
      }

      this.setData({
        joinedCurrent: true,
        iAmLucky,
        iHasLuckyFriend: luckyFriend.length > 0,
        luckyFriend,
        myCurrentLotteryRecord: record,
      })
      return record
    })
  },
  setMyLuckyFriendRecord(lotteryID, luckyFriend) {
    return userLotteryRecordIO.findUserLotteryByUids(lotteryID, luckyFriend).then(res => {
      let myLuckyFriendRecord = res.data.objects
      let myLuckyFriendName = myLuckyFriendRecord[0].nickname && myLuckyFriendRecord[0].nickname.length > 8 ? (myLuckyFriendRecord[0].nickname.slice(0, 8) + '...') : myLuckyFriendRecord[0].nickname
      this.setData({
        myLuckyFriendRecord,
        myLuckyFriendName
      })
    })
  },

  // 文案获取
  getWordList() {
    return getApp().getWordList().then(wordListData => {
      this.setData({wordListData})
    })
  },

  navToMiniprogram() {
    const appId = '' // 跳转小程序 app id
    wx.navigateToMiniProgram({
      appId,
      path: '/pages/index/index',
    })
  },

  handleRuleClicked(e) {
    let formID = e.detail.formId
    wx.BaaS.wxReportTicket(formID)
    wx.navigateTo({
      url: ROUTE.LOTTERY_RULES
    })
  },

  handleNavToProductDetail(e) {
    let formID = e.detail.formId
    wx.BaaS.wxReportTicket(formID)

    const {iAmLucky, iHasLuckyFriend} = this.data
    if (iAmLucky || iHasLuckyFriend) {
      wx.navigateTo({
        url: `${ROUTE.LOTTERY_WEBVIEW}?url=https://cloud.minapp.com/minapp-embed/index/`
      })
    } else {
      this.navToMiniprogram()
    }
  },
  onPullDownRefresh() {
    this.onLoad()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 100)
  },
  onShareAppMessage() {
    const {lottery} = this.data
    let shareMsgObj = {
      title: `${lottery.prize_name}, 免费抽`,
      path: `${ROUTE.LOTTERY_RESULT}?lottery_ordinal=${lottery.lottery_ordinal}`,
      imageUrl: lottery.wechat_sharing_image,
      success: function () {
        wx.showToast({
          title: '分享成功'
        })
      },
    }
    return shareMsgObj
  }
})
