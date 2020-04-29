Page({
  data: {
    currentInput: '',
    height: 20,
    focus: false
  },
  bindButtonTap: function () {
    this.setData({
      focus: true
    })
  },
  bindTextAreaBlur: function (e) {
    console.log(e.detail.value)
  },
  bindFormSubmit: function (e) {
    console.log(e.detail.value.textarea)
  },
  getInput: function (e) {
    console.log(e.detail.value)
    this.setData({
      currentInput: e.detail.value
    })
  },
  formSubmit: function (e) {
    var me =this;
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    var test = e.detail.value.textareatest;
    var fatherCommentId = e.currentTarget.dataset.replyfathercommentid;
    var toUserId = e.currentTarget.dataset.replytouserid;
    console.log("==================00000000000000000000000000000000========================", e, fatherCommentId, toUserId, me.data.videoInfo)
    
  },
  formReset: function () {
    console.log('form发生了reset事件')
  }
})