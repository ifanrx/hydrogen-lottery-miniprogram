'use strict'
import contactIO from '@/io/contactIO.js'
import {checkPhoneNum, checkWechatID} from '@/common/regexUtil.js'

Page({
  data: {
    contactInfo: null,
    inited: false,
    isNew: true,
  },
  onLoad: function () {
    wx.util.showLoading()
    const uid = getApp().getUserID()

    contactIO.getContactInfoByUid(uid).then(res => {
      wx.util.hideLoading()
      const contactInfo = res.data.objects[0]
      contactInfo && this.setData({
        contactInfo,
        isNew: false
      })
      this.setData({
        inited: true,
      })
    }).catch(wx.util.formateResponse)
  },
  showWarining(content) {
    return wx.showToast({
      icon: 'none',
      title: content
    })
  },
  handleContactInfoSubmit() {
    const {contactInfo, isNew} = this.data
    const {phone, wechat_id} = contactInfo || {}
    let data = {}

    if (!phone || !wechat_id) {
      return this.showWarining('内容不能为空')
    } else if (!checkPhoneNum(phone)) {
      return this.showWarining('手机号码格式不正确')
    } else if (!checkWechatID(wechat_id)) {
      return this.showWarining('微信号格式不正确')
    } else {
      data.phone = parseInt(phone)
      data.wechat_id = wechat_id
    }

    if (!isNew) {
      contactIO.updateContactInfo(contactInfo.id, data).then(res => {
        wx.showToast({
          title: '成功修改',
        })
      }).catch(wx.util.formateResponse)
    } else {
      contactIO.createContactInfo(data).then(res => {
        if (res.statusCode === 201) {
          this.setData({
            isNew: false,
            contactInfo: res.data
          })
          wx.showToast({
            title: '提交成功',
          })
        }
      }).catch(wx.util.formateResponse)
    }
  },
  handleInput(e) {
    const {name} = e.target.dataset
    let {contactInfo} = this.data
    contactInfo = contactInfo || {}
    contactInfo[name] = e.detail.value
    this.setData({
      contactInfo
    })
  },
})