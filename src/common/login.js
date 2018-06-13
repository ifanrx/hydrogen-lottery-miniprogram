class Login {
  constructor() {
    this.inited = false
  }
  finishInitialization() {
    this.inited = true
  }
  /**
   * 使用知晓云服务登录
   */
  baaSLogin() {
    wx.util.showLoading()

    wx.BaaS.login(false).then(() => {
      this.finishInitialization()
      wx.util.hideLoading()
    }, (res) => {
      this.finishInitialization()
      wx.util.hideLoading()
      if (res.openid) {
        wx.BaaS.storage.set('auth_status', 'user_refuse_auth')
        console.warn('用户拒绝授权')
      } else {
        throw new Error('调用授权失败')
      }
    }).catch(err => {
      throw new Error(err)
    })
  }
}

let obj = new Login()

export const login = obj.baaSLogin.bind(obj)
export const finishInitialization = obj.finishInitialization.bind(obj)