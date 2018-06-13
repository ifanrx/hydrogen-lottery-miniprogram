const loadingFactory = () => {
  let isLoading = false
  let timeout = null
  const MAXACCESSTIME = 60e3
  const showLoading = (title = '加载中...') => {
    isLoading = true
    timeout = setTimeout(() => {
      isLoading && hideLoading()
    }, MAXACCESSTIME)
    return wx.showLoading({
      title: title,
      mask: true
    })
  }
  const hideLoading = () => {
    isLoading = false
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
    return wx.hideLoading()
  }
  return {
    showLoading,
    hideLoading,
  }
}

/**
 * @desc 参考 https://developers.weixin.qq.com/miniprogram/dev/framework/view/wxss.html
 * rpx（responsive pixel）: 可以根据屏幕宽度进行自适应。规定屏幕宽为750rpx。
 * 如在 iPhone6 上，屏幕宽度为375px，共有750个物理像素，则750rpx = 375px = 750物理像素，1rpx = 0.5px = 1物理像素。
 */
const ScreenFactory = () => {
  const WECHAT_STANDARD_SCREEN_WIDTH_IN_PX = 375
  const systemInfo = wx.getSystemInfoSync()
  const SCREEN_WIDTH = systemInfo.screenWidth
  const ratio = SCREEN_WIDTH / WECHAT_STANDARD_SCREEN_WIDTH_IN_PX

  /**
   * @param {number} width
   * @desc 把 iphone 6 上的 1px 转成自适应的 1px
   */
  const px = (width) => {
    return width * ratio
  }
  return {
    px,
  }
}

const MobileAdpater = () => {
  const systemInfo = wx.getSystemInfoSync()
  const deviceModel = systemInfo.model
  const MOBILE_REG = {
    'iPhone X': /iPhone X/
  }

  return {
    isIPhoneX: () => {
      return MOBILE_REG['iPhone X'].test(deviceModel)
    }
  }
}

const getStatusBarHeight = () => {
  const systemInfo = wx.getSystemInfoSync()
  try {
    return systemInfo.statusbarHeight || systemInfo.statusBarHeight
  } catch (e) {
    return 20
  }
}

const formatResponse = (res) => {
  // hide loading toast
  wx.util.hideLoading()

  const hasServerErrorMsg = res.response && res.response.data && res.response.data.error_msg
  const message = hasServerErrorMsg ? res.response.data.error_msg : res.message
  wx.showModal({
    title: '提示',
    content: message,
    showCancel: false,
  })
}

const countDownStrFormat = (end) => {
  const diff = parseInt((new Date(end) - Date.now()) / 1000)
  if (diff <= 0) return false

  // [day, hour, minute, second]
  const tsMap = [24 * 60 * 60, 60 * 60, 60, 1]

  const addZero = n => n >= 10 ? ('' + n) : ('0' + n)

  let mod = null
  let [day, hour, minute, second] = tsMap.map((ts, idx) => {
    if (mod === null) {
      mod = diff % ts
      return parseInt(diff / ts)
    } else {
      let res = addZero(parseInt(mod / ts))
      mod = mod % ts
      return res
    }
  })

  return day > 0 ? `${day} 天 ${hour} 时 ${minute} 分 ${second} 秒` : `${hour} 时 ${minute} 分 ${second} 秒`
}

export const util = {
  ...loadingFactory(),
  screen: {
    ...ScreenFactory(),
  },
  mobileAdapter: {
    ...MobileAdpater()
  },
  formatResponse,
  getStatusBarHeight,
  countDownStrFormat,
}

if (typeof wx !== 'undefined') {
  wx.util = util
}