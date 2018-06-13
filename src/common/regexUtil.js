const nameRegex = /^[a-zA-Z\u4e00-\u9fa5]{1,20}$/

const phoneNumRegex = /^1\d{10}$/

const emailRegex = /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/

const wechatIDRegex = /^[a-zA-Z]{1}[a-zA-Z0-9_-]{5,19}$/

const checkPhoneNum = phoneNum => {
  return phoneNumRegex.test(phoneNum)
}

const checkEmail = email => {
  return emailRegex.test(email)
}

const checkName = name => {
  return nameRegex.test(name)
}

const checkWechatID = wechatID => {
  return wechatIDRegex.test(wechatID)
}

module.exports = {
  checkPhoneNum,
  checkEmail,
  checkName,
  checkWechatID
}