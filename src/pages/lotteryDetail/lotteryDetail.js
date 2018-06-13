import lotteryIO from '@/io/lotteryIO'
import userLotteryRecordIO from '@/io/userLotteryRecordIO'

Page({
  data: {
    currentLottery: null,
    totalJoinedCount: 0,
    joinedUser: [],
    inited: false,
    wordListData: {}
  },
  onLoad: function (options) {
    const {user_id, lottery_id} = options
    getApp().getWordList().then((wordListData) => {
      this.setData({
        wordListData
      })
    })

    this.getCurrentLottery(lottery_id)
    if (user_id) {
      this.getSpecialJoinedUser(lottery_id, user_id)
    } else {
      this.getAllJoinedUser(lottery_id)
    }
  },
  getCurrentLottery(id) {
    return lotteryIO.getLotteryById(id).then(res => {
      this.setData({
        currentLottery: res.data.objects[0]
      })
    }).catch(wx.util.formateResponse)
  },
  getAllJoinedUser(id) {
    return userLotteryRecordIO.find({lotteryID: id, offset: 0, limit: 1000}).then(res => {
      let records = res.data.objects
      let totalJoinedCount = res.data.meta.total_count
      this.setData({
        joinedUser: records,
        totalJoinedCount,
        inited: true
      })
    }).catch(wx.util.formateResponse)
  },

  getSpecialJoinedUser(lottery_id, uid) {
    return userLotteryRecordIO.getFriendAcceptedInvitationInDetail(parseInt(uid), lottery_id).then(res => {
      let records = res.data.objects
      let totalJoinedCount = res.data.meta.total_count
      this.setData({
        joinedUser: records,
        totalJoinedCount,
        inited: true
      })
    }).catch(wx.util.formateResponse)
  },

  back(e) {
    const formID = e.detail.formId
    wx.BaaS.wxReportTicket(formID)
    wx.navigateBack()
  },
})