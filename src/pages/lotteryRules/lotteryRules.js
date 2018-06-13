import contentIo from '@/io/contentIO.js'

Page({
  data: {
    richText: '',
    inited: false,
    wordListData: {},
  },
  onLoad: function () {
    getApp().getWordList().then((wordListData) => {
      this.setData({
        wordListData
      })
    })
    contentIo.getRules().then(res => {
      this.setData({
        richText: res.data.content,
        inited: true
      })
    }).catch(wx.util.formateResponse)
  },
  back: function (e) {
    wx.BaaS.wxReportTicket(e.detail.formId)
    wx.navigateBack()
  }
})