//app.js git代码 neepu3299299  
App({
  //serverUrl: "http://127.0.0.1:8082",
  serverUrl: "http://120.79.143.66:8080/video",
  fileUrl: "http://120.79.143.66:8080",
  userInfo: null,

  setGlobalUserInfo: function(user) {
    wx.setStorageSync("userInfo", user);
  },

  getGlobalUserInfo: function () {
    return wx.getStorageSync("userInfo");
  },

  reportReasonArray: [
    "色情低俗",
    "政治敏感",
    "涉嫌诈骗",
    "辱骂谩骂",
    "广告垃圾",
    "诱导分享",
    "引人不适",
    "过于暴力",
    "违法违纪",
    "其它原因"
  ]
})