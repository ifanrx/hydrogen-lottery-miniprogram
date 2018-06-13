//index.js
'use strict'
import lotteryIO from '@/io/lotteryIO'
import userLotteryRecordIO from '@/io/userLotteryRecordIO'

import HAND_POINTING_DOWN from '@/assets/img/hand-pointing-down.svg'
import ICON_SHARE_QRCODE from '@/assets/img/share-qrcode.svg'
import ICON_HEART_FACE from '@/assets/img/heart-face.svg'
import ICON_WECHAT_LOGO from '@/assets/img/weixin.svg'
import ICON_HEADSET from '@/assets/img/headset.svg'
import ICON_EXCITED from '@/assets/img/excited.svg'
import ICON_FILL from '@/assets/img/fill.svg'

import {ROUTE, WECHAT_SCENE, WECHAT_REPORT_ANALYTICS_MAP} from '@/config/constants'

const ERR_TYPE = {
  'NOT_LOTTERY_EXIST': 'NOT_LOTTERY_EXIST',
  'LATEST_LOTTERY_NOT_ACTIVE': 'LATEST_LOTTERY_NOT_ACTIVE',
}

const app = getApp()

Page({
  data: {
    ICON_FILL,
    ICON_EXCITED,
    ICON_HEADSET,
    ICON_HEART_FACE,
    ICON_WECHAT_LOGO,
    ICON_SHARE_QRCODE,
    HAND_POINTING_DOWN,
    'JOINED_USER_LIMIT': 23,
    'JOINED_USER_LINE_LIMIT': 7, // 视图上每行显示多少个头像
    'FRIENDS_ACCEPTED_INVITATION_LIMIT': 9,
    'FRIENDS_ACCEPTED_INVITATION_LINE_LIMIT': 5,
    inited: false,
    lottery: null,
    lotteryActive: undefined,
    // 是否已参与抽奖
    joined: undefined,
    // 当前抽奖参与人员
    lotteryCrew: [],
    // 总参与人数
    totalJoinedCount: 0,
    hasMoreJoinedUser: undefined,
    lotteryDesc: '',
    myLotteryRecord: undefined,
    friendAcceptedInvitation: [],
    hasMoreFriends: undefined,
    // 本人是否中奖人之一
    isOneOfLucky: undefined,
    countDownTime: '',
    timer: null,
    userinfo: undefined,
    isIPhoneX: false,
    statusBarHeight: 0,
    wordListData: null,
    isAuth: false,
    deferLottery: true
  },
  onLoad() {
    const {timer} = this.data
    if (timer) timer()
    wx.hideShareMenu()
    this.setData({
      isIPhoneX: wx.util.mobileAdapter.isIPhoneX(),
      statusBarHeight: wx.util.getStatusBarHeight()
    })
    // 假设扫码过来的 query 在 onLoad 可以拿到
    const {scene, inviter_uid, invitation_lottery_id} = this.options
    if (inviter_uid && invitation_lottery_id) {
      app.saveInvitationInfo({
        uid: inviter_uid,
        lotteryID: invitation_lottery_id,
      })
      // 从分享会话进入
      this.sendReportAnalytics(WECHAT_SCENE.FROM_CHAT)
    } else if (scene) {
      let sceneStr = decodeURIComponent(scene)
      let inviterID = sceneStr.substring(0, 8)
      let lotteryID = sceneStr.substring(8, 32)
      app.saveInvitationInfo({
        uid: inviterID,
        lotteryID: lotteryID,
      })
      // 从分享海报进入
      this.sendReportAnalytics(WECHAT_SCENE.FROM_POSTER)
    } else {
      // 默认进入
      this.sendReportAnalytics(WECHAT_SCENE.FROM_DEFAULT)
    }

    wx.util.showLoading()
    // 文案获取
    app.getWordList().then((wordListData) => {
      this.setData({
        wordListData
      })
    })
    this.initData()
  },
  /**
   * 事件上报
   * @param {String} eventName
   * @param {String} key
   * @param {String} value
   */
  wxReportAnalytics(eventName, key, value = '1') {
    wx.reportAnalytics(eventName, {
      key: value
    })
  },
  sendReportAnalytics(scene) {
    let actions = WECHAT_REPORT_ANALYTICS_MAP[scene] || WECHAT_REPORT_ANALYTICS_MAP[WECHAT_SCENE.FROM_DEFAULT]
    actions.map(item => {
      this.wxReportAnalytics(...item)
    })
  },
  onPullDownRefresh() {
    this.onLoad()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 100)
  },
  onUnload() {
    this.data.timer && this.data.timer()
  },
  timer(due) {
    let stopTiming = false

    let countDownStr = wx.util.countDownStrFormat(due)
    this.setData({
      countDownTime: countDownStr || this.data.wordListData.index__lottery_dealwith_tip,
    })

    let countDown = () => setTimeout(() => {
      if (stopTiming) return
      let countDownStr = wx.util.countDownStrFormat(due)
      if (!countDownStr) {
        return this.setData({
          countDownTime: this.data.wordListData.index__lottery_dealwith_tip,
        })
      }
      this.setData({
        countDownTime: countDownStr,
      })
      countDown()
    }, 1000)
    countDown()

    return () => {
      stopTiming = true
    }
  },
  /**
   * @param {Integer} userID
   * @param {String} lotteryID
   * @desc 获取本人的抽奖记录
   */
  getMyLotteryRecord(userID, lotteryID) {
    return userLotteryRecordIO.findUserLottery(userID, lotteryID).then(res => {
      let record = res.data.objects[0] || null
      let joined = !!record
      this.setData({
        myLotteryRecord: record,
        joined,
      })
      if (joined) {
        const friends = record.friend_accepted_invitation
        // 获取本人邀请好友的信息
        if (friends.length) {
          return this.getFriendAcceptedInvitationInDetail(lotteryID, friends)
        }
      } else {
        return this.getAllJoinedUser(lotteryID)
      }
    }).finally(() => {
      this.setData({
        inited: true,
      })
      wx.util.hideLoading()
    })
  },
  getFriendAcceptedInvitationInDetail(lotteryID, friends) {
    let OFFSET = 0
    let LIMIT = this.data.FRIENDS_ACCEPTED_INVITATION_LIMIT
    userLotteryRecordIO.findUserLotteryByUids(lotteryID, friends, OFFSET, LIMIT).then(res => {
      this.setData({
        friendAcceptedInvitation: res.data.objects,
        hasMoreFriends: res.data.meta.total_count > LIMIT,
      })
    })
    userLotteryRecordIO.getRankByFriendAcceptedInvitation(lotteryID, friends.length).then(rate => {
      this.setData({
        // 百分比显示，并保留一位小数，eg: 90.1%
        rankInfo: `${Math.floor(rate * 1000) / 10}%`,
      })
    })
  },
  initData() {
    lotteryIO.getLottery().then(res => {
      let records = res.data.objects
      if (!records.length) {
        wx.showModal({
          title: '提示',
          content: ERR_TYPE.NOT_LOTTERY_EXIST
        })
        return
      }
      let record = records[0]
      if (!record.active) {
        wx.redirectTo({
          url: `${ROUTE.LOTTERY_RESULT}?lottery_ordinal=${record.lottery_ordinal}`,
        })
        return
      }
      this.getMyLotteryRecord(app.getUserID(), record.id)
      this.setData({
        lottery: record,
        lotteryActive: record.active
      })
      this.data.timer = this.timer(record.due)
    }).catch(err => {
      this.setData({
        inited: true
      })
      wx.util.formatResponse(err)
    })
  },
  // 获取当前参与抽奖人员
  getAllJoinedUser(id) {
    const LIMIT = this.data.JOINED_USER_LIMIT
    return userLotteryRecordIO.find({lotteryID: id, offset: 0, limit: LIMIT}).then(res => {
      let records = res.data.objects
      let totalJoinedCount = res.data.meta.total_count
      let hasMoreJoinedUser = totalJoinedCount > LIMIT
      this.setData({
        joinedUser: records,
        hasMoreJoinedUser,
        totalJoinedCount,
      })
    })
  },
  handleShare(e) {
    const formID = e.detail.formId
    wx.BaaS.wxReportTicket(formID)
  },
  handleUserInfo(res) {
    wx.BaaS.handleUserInfo(res).then(res => {
      this.setData({
        isAuth: true,
        deferLottery: false
      }, () => {
        this.handleApplyLottery()
      })
    }).finally(() => {
      if (!this.data.isAuth) {
        return wx.showToast({
          title: '需授权才能正常参与本抽奖活动',
          icon: 'none'
        })
      }
    })
  },
  handleApplyLottery(e) {
    if (e) {
      const formID = e.detail.formId
      wx.BaaS.wxReportTicket(formID)
    }

    if (this.data.deferLottery) return

    let lotteryID = this.data.lottery.id
    if (!lotteryID) return

    let userinfo = wx.BaaS.storage.get('userinfo')
    let invitationInfo = app.getInvitationInfo()
    const inviterUID = invitationInfo.lotteryID === lotteryID ? invitationInfo.uid : -1

    wx.util.showLoading()
    this.updateUserProfile(lotteryID)
    userLotteryRecordIO.create({
      lotteryID,
      inviterUID,
      avatar: userinfo.avatarUrl,
      nickname: userinfo.nickName,
    }).then(res => {
      wx.util.hideLoading()
      this.setData({
        myLotteryRecord: res.data,
        joined: true,
      })
      wx.showToast({
        title: '成功参与',
      })
    }).catch(wx.util.formateResponse)
  },
  updateUserProfile(lottery_id) {
    let MyUser = new wx.BaaS.User()
    let currentUser = MyUser.getCurrentUserWithoutData()
    currentUser.set('lottery_id', this.data.lottery.id).update()
  },
  navToWebview(url) {
    let _url = url || 'https://cloud.minapp.com/minapp-embed/index/'
    wx.navigateTo({
      url: `${ROUTE.LOTTERY_WEBVIEW}?url=${_url}`
    })
  },
  handleNavToFriendAcceptedInvitation() {
    let lotteryID = this.data.lottery.id
    let uid = app.getUserID()
    wx.navigateTo({
      url: `${ROUTE.LOTTERY_DETAIL}?lottery_id=${lotteryID}&user_id=${uid}`
    })
  },
  handleRuleClicked(e) {
    const formID = e.detail.formId
    wx.BaaS.wxReportTicket(formID)
    wx.navigateTo({
      url: ROUTE.LOTTERY_RULES
    })
  },
  handleNavToPrizeDetail(e) {
    const formID = e.detail.formId
    wx.BaaS.wxReportTicket(formID)
    this.navToWebview()
  },
  handleNavToSponsor() {
    this.navToWebview()
  },
  handleNavToAllJoinedPerson() {
    wx.navigateTo({
      url: `${ROUTE.LOTTERY_DETAIL}?lottery_id=${this.data.lottery.id}`
    })
  },
  handleClickContact(e) {
    let formID = e.detail.formId
    wx.BaaS.wxReportTicket(formID)
  },
  navToAddContact() {
    wx.navigateTo({
      url: ROUTE.LOTTERY_CONTACT
    })
  },
  onShareAppMessage(res) {
    const {lottery} = this.data
    let shareMsgObj = {
      title: `${lottery.prize_name}, 免费抽`,
      path: ROUTE.INDEX,
      imageUrl: lottery.wechat_sharing_image,
      success: function () {
        wx.showToast({
          title: '分享成功'
        })
      },
    }
    if (res.from === 'button' && lottery) {
      let uid = this.data.myLotteryRecord.created_by
      let lotteryID = this.data.myLotteryRecord.lottery_id
      shareMsgObj.title = lottery.wechat_sharing_title
      shareMsgObj.path = `${ROUTE.INDEX}?inviter_uid=${uid}&invitation_lottery_id=${lotteryID}`
    }
    return shareMsgObj
  }
})