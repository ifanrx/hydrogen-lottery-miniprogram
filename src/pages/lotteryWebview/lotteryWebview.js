
Page({
  data: {
    url: null,
  },
  onLoad: function (options) {
    const {url} = options
    this.setData({
      url
    })
  }
})