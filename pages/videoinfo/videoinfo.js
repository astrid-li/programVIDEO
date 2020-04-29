var videoUtil = require('../../utils/videoUtil.js')

const app = getApp()

Page({
  data: {
    cover: "cover",
    videoId: "",
    src: "",
    videoInfo: {},
    textHeight:"30px",
    userLikeVideo: false,


    commentsPage: 1,
    commentsTotalPage: 1,
    commentsList: [],


    placeholder: "发表评论吧!（最多50字）",

    danmuList: [
      {
        text: '欢迎访问校园短视频平台~',
        color: '#ff0000',
        time: 1
      },
      {
        text: '您可以分享该视频哦~',
        color: '#ff00ff',
        time: 3
      }
      ],
    danmu:"",
    isContentShow:false,
    commentBottom:"所有评论已经显示完毕",
    currentInput: ''

  },

  videoCtx: {},

  onLoad: function(params) {
    var me = this;
    me.videoCtx = wx.createVideoContext("myVideo", me);

    // 获取上一个页面传入的参数
    var videoInfo = JSON.parse(params.videoInfo);

    var height = videoInfo.videoHeight;
    var width = videoInfo.videoWidth;
    var cover = "cover";
    if (width >= height) {
      cover = "";
    }
    me.setData({
      videoId: videoInfo.id,
      src: app.fileUrl + videoInfo.videoPath,
      videoInfo: videoInfo,
      cover: cover
    });

    var serverUrl = app.serverUrl;
    var fileUrl = app.fileUrl;
    var user = app.getGlobalUserInfo();
    var loginUserId = "";
    if (user != null && user != undefined && user != '') {
      loginUserId = user.id;
    }
    wx.request({
      url: serverUrl + '/user/queryPublisher?loginUserId=' + loginUserId + "&videoId=" + videoInfo.id + "&publishUserId=" + videoInfo.userId,
      method: 'POST',
      success: function(res) {
        console.log(res.data);

        var publisher = res.data.data.publisher;
        var userLikeVideo = res.data.data.userLikeVideo;

        me.setData({
          serverUrl: serverUrl,
          publisher: publisher,
          userLikeVideo: userLikeVideo,
          fileUrl: fileUrl
        });
      }
    })

    me.getCommentsList(1);
  },

  onShow: function() {
    var me = this;
    me.videoCtx.play();
  },

  onHide: function() {
    var me = this;
    me.videoCtx.pause();
  },

  showSearch: function() {
    wx.navigateTo({
      url: '../searchVideo/searchVideo',
    })
  },

  showPublisher: function() {
    var me = this;

    var user = app.getGlobalUserInfo();

    var videoInfo = me.data.videoInfo;
    var realUrl = '../mine/mine#publisherId@' + videoInfo.userId;

    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        
        url: '../userLogin/login?redirectUrl=' + realUrl,
      })
    } else {
      wx.navigateTo({
        
        url: '../mine/mine?publisherId=' + videoInfo.userId,
      })
    }
  },


  upload: function() {
    var me = this;

    var user = app.getGlobalUserInfo();
    var videoInfo = JSON.stringify(me.data.videoInfo);
    var realUrl = '../videoinfo/videoinfo#videoInfo@' + videoInfo;

    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../userLogin/login?redirectUrl=' + realUrl,
      })
    } else {
      videoUtil.uploadVideo();
    }

  },

  showIndex: function() {
    wx.redirectTo({
      url: '../index/index',
    })
  },

  showMine: function() {
    var user = app.getGlobalUserInfo();

    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../userLogin/login',
      })
    } else {
      wx.navigateTo({
        url: '../mine/mine',
      })
    }
  },

  likeVideoOrNot: function() {
    var me = this;
    var videoInfo = me.data.videoInfo;
    var user = app.getGlobalUserInfo();

    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../userLogin/login',
      })
    } else {

      var userLikeVideo = me.data.userLikeVideo;
      var url = '/video/userLike?userId=' + user.id + '&videoId=' + videoInfo.id + '&videoCreaterId=' + videoInfo.userId;
      if (userLikeVideo) {
        url = '/video/userUnLike?userId=' + user.id + '&videoId=' + videoInfo.id + '&videoCreaterId=' + videoInfo.userId;
      }

      var serverUrl = app.serverUrl;
      wx.showLoading({
        title: '...',
      })
      wx.request({
        url: serverUrl + url,
        method: 'POST',
        header: {
          'content-type': 'application/json', // 默认值
          'headerUserId': user.id,
          'headerUserToken': user.userToken
        },
        success: function(res) {
          wx.hideLoading();
          me.setData({
            userLikeVideo: !userLikeVideo
          });
        }
      })


    }
  },

  shareMe: function() {
    var me = this;
    var user = app.getGlobalUserInfo();

    wx.showActionSheet({
      itemList: ['下载到本地', '举报用户', '分享到朋友圈', '分享到QQ空间', '分享到微博'],
      success: function(res) {
        console.log(res.tapIndex);
        if (res.tapIndex == 0) {
          // 下载
          wx.showLoading({
            title: '下载中...',
          })
          wx.downloadFile({
            url: app.serverUrl + me.data.videoInfo.videoPath,
            success: function(res) {
              // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
              if (res.statusCode === 200) {
                console.log(res.tempFilePath);

                wx.saveVideoToPhotosAlbum({
                  filePath: res.tempFilePath,
                  success: function(res) {
                    console.log(res.errMsg)
                    wx.hideLoading();
                  }
                })
              }
            }
          })
        } else if (res.tapIndex == 2) {
          // 分享视频
          wx.showToast({
            title: '请点击右上角 ... 按钮分享',
            icon: "info"
          })


        } else if (res.tapIndex == 1) {
          // 举报
          var videoInfo = JSON.stringify(me.data.videoInfo);
          var realUrl = '../videoinfo/videoinfo#videoInfo@' + videoInfo;

          if (user == null || user == undefined || user == '') {
            wx.navigateTo({
              url: '../userLogin/login?redirectUrl=' + realUrl,
            })
          } else {
            var publishUserId = me.data.videoInfo.userId;
            var videoId = me.data.videoInfo.id;
            var currentUserId = user.id;
            wx.navigateTo({
              url: '../report/report?videoId=' + videoId + "&publishUserId=" + publishUserId
            })
          }
        } else {
          wx.showToast({
            title: '官方暂未开放...',
          })
        }
      }
    })
  },

 


  leaveComment: function() {
    this.setData({
      commentFocus: true
    });
  },

  replyFocus: function(e) {
    var fatherCommentId = e.currentTarget.dataset.fathercommentid;
    var toUserId = e.currentTarget.dataset.touserid;
    var toNickname = e.currentTarget.dataset.tonickname;

    this.setData({
      placeholder: "回复  " + toNickname,
      replyFatherCommentId: fatherCommentId,
      replyToUserId: toUserId,
      commentFocus: true
    });
  },

  saveComment: function(e) {
    
    var me = this;
    var content = e.detail.value.commentContent;
    if (!content || content == ''){
      wx: wx.showToast({
        title: '评论不可为空!!!!',
        icon: 'none',
        duration: 1000
      })
      return false
    }

    // 获取评论回复的fatherCommentId和toUserId
    var fatherCommentId ="";
    var toUserId = "";
    if (e.currentTarget.dataset.replyfathercommentid != null && e.currentTarget.dataset.replytouserid != null) {
      fatherCommentId = e.currentTarget.dataset.replyfathercommentid;
      toUserId = e.currentTarget.dataset.replytouserid;
    }
    
    console.log(e);
    var user = app.getGlobalUserInfo();
    var videoInfo = JSON.stringify(me.data.videoInfo);
    var realUrl = '../videoinfo/videoinfo#videoInfo@' + videoInfo;
    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../userLogin/login?redirectUrl=' + realUrl,
      })
    } else {
      wx.showLoading({
        title: '请稍后...',
      })
      wx.request({
        url: app.serverUrl + '/video/saveComment?fatherCommentId=' + fatherCommentId + "&toUserId=" + toUserId,
        method: 'POST',
        header: {
          'content-type': 'application/json', // 默认值
          'headerUserId': user.id,
          'headerUserToken': user.userToken
        },
        data: {
          fromUserId: user.id,
          videoId: me.data.videoInfo.id,
          comment: content,
          textHeight:"30px"
        },
        success: function(res) {
          console.log(res.data)
          wx.hideLoading();

          me.setData({
            contentValue: "",
            commentsList: []
          });
          me.getCommentsList(1);
        }
      })
    }
  },

  // commentsPage: 1,
  //   commentsTotalPage: 1,
  //   commentsList: []

  getCommentsList: function(page) {
    var me = this;
    var videoId = me.data.videoInfo.id;

    wx.request({
      url: app.serverUrl + '/video/getVideoComments?videoId=' + videoId + "&page=" + page + "&pageSize=7",
      method: "POST",
      success: function(res) {
        console.log(res.data);

        var commentsList = res.data.data.rows;
        var newCommentsList = me.data.commentsList;
        var commentBottom ;
        if(commentsList==0){
          commentBottom='暂无评论';
        }else{
          commentBottom="评论全部显示完毕";
        }

        me.setData({
          commentsList: newCommentsList.concat(commentsList),
          commentsPage: page,
          commentsTotalPage: res.data.data.total,
          commentBottom:commentBottom
        });
      }
    })
  },

  onReachBottom: function() {
    var me = this;
    var currentPage = me.data.commentsPage;
    var totalPage = me.data.commentsTotalPage;
    if (currentPage === totalPage) {
      return;
    }
    var page = currentPage + 1;
    me.getCommentsList(page);
  },


  changeHeight :function(e){
    var me = this;
    var l = e.length;
    var change = me.data.textHeight;
    var temp =9;
    var num = parseInt(me.data.textHeight);
    var b = e.currentTarget.offsetTop ;
    if (b< 0){
      
      temp =9+ num +Math.abs(b);
      change = temp + "px";
    }
    else if(b>9){
      temp = b-9;      
      var t = num-temp;
      change = t +"px";
    }
    if(e.detail.value.commentContent==''){
      change = "30px";
    }
    if(change!=me.data.textHeight){
      me.setData({
        textHeight: change
      })
    }
  },
  getInput: function (e) {
    console.log(e.detail.value)
    this.setData({
      danmu: e.detail.value
    });
  },
  bindSendDanmu: function () {
    this.videoCtx.sendDanmu({
      text: this.data.danmu,
      color: 'green'
    });
    console.log(this.videoCtx)
  },


  /**
  * 用户点击右上角分享
  */
  onShareAppMessage: function (res) {
    var me = this;
    var videoInfo = me.data.videoInfo;
    return {
      title: '快来围观这个有趣的视频吧~',
      path: "pages/videoinfo/videoinfo?videoInfo=" + JSON.stringify(videoInfo)
    }
  },

  //打开规则提示
  showContent: function () {
    this.setData({
      isContentShow: true
    })
  },

  //关闭规则提示
  hideContent: function () {
    this.setData({
      isContentShow: false
    })
  },
  handleClick(e){
    console.log(e)
  }



})