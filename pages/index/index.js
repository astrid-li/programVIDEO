const app = getApp()

Page({
  data: {
    // 用于分页的属性
    totalPage: 1,
    page:1,
    videoList:[],

    screenWidth: 350,
    serverUrl: "",

    searchContent: "",

    latitude:0,
    longitude:0,
    type:0,

    current: 'tab1'
  },

  onLoad: function (params) {
    var me = this;
    var screenWidth = wx.getSystemInfoSync().screenWidth;

    // 显示当前页面的转发按钮
    wx.showShareMenu({
      // 是否使用带 shareTicket 的转发
      withShareTicket: true
    });

    // wx.showShareMenu({
    //   withShareTicket: true,
    //   success: function (res) {
    //     wx.showToast({
    //       title: '分享成功~',
    //       icon: "success"
    //     })
    //   },
    //   fail: function (res) {
    //     wx.showToast({
    //       title: '取消分享',
    //       icon: "cancel"
    //     })
    //   }
      
    // });


    me.setData({
      screenWidth: screenWidth,
    });

    var searchContent =
    ( params.search == undefined ? '' : params.search );
    var isSaveRecord = params.isSaveRecord;
    if (isSaveRecord == null || isSaveRecord == '' || isSaveRecord == undefined) {
      isSaveRecord = 0;
    }

    me.setData({
      searchContent: searchContent
    });

    // 获取当前的分页数
    var page = me.data.page;
    me.getAllVideoList(page, isSaveRecord);
  },

  getAllVideoList: function (page, isSaveRecord) {
    var me = this;
    
    var serverUrl = app.serverUrl;
    var fileUrl = app.fileUrl;
    wx.showLoading({
      title: '奋力加载中...',
    });

    var searchContent = me.data.searchContent;


    console.log(me,"me!!!!!!");
    wx.request({
      url: serverUrl + '/video/showAll?page=' + page + "&isSaveRecord=" + isSaveRecord + "&type=" + me.data.type + "&latitude=" + me.data.latitude + "&longitude=" + me.data.longitude,
      method: "POST",
      data: {
        videoDesc: searchContent
      },
      success: function (res) {
        wx.hideLoading();
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();

        console.log(res.data);

        // 判断当前页page是否是第一页，如果是第一页，那么设置videoList为空
        if (page === 1) {
          me.setData({
            videoList: []
          });
        }

        var videoList = res.data.data.rows;
        var newVideoList = me.data.videoList;

        me.setData({
          videoList: newVideoList.concat(videoList),
          page: page,
          totalPage: res.data.data.total,
          serverUrl: serverUrl,
          fileUrl: fileUrl
        });

      }
    })
  },

  onPullDownRefresh: function() {
    wx.showNavigationBarLoading();
    this.getAllVideoList(1, 0);
  },

  onReachBottom:function() {
    var me = this;
    var currentPage = me.data.page;
    var totalPage = me.data.totalPage;

    // 判断当前页数和总页数是否相等，如果相等则无需查询
    if (currentPage === totalPage) {
      wx.showToast({
        title: '已经没有视频啦~~',
        icon: "none"
      })
      return;
    }

    var page = currentPage + 1;

    me.getAllVideoList(page, 0);
  },

  showVideoInfo: function(e) {
    var me = this;
    var videoList = me.data.videoList;
    var arrindex = e.target.dataset.arrindex;
    var videoInfo = JSON.stringify(videoList[arrindex]);


    wx.redirectTo({
      url: '../videoinfo/videoinfo?videoInfo=' + videoInfo
    })
  },

  handleChange({ detail }) {
    var _this = this;
    _this.setData({
      videoList: []
    });
    wx.showLoading({
      title: '奋力加载中...',
    });

    if (detail.key == 'tab2'){

      
      var latitude = 0;
      var longitude = 0;

      wx.getLocation({
        type: 'wgs84',
        isHighAccuracy: true,
        highAccuracyExpireTime: 3100,
        success: function (res) {
          console.log(res)
          latitude = res.latitude,
          longitude = res.longitude
        },

        complete: function () {
          _this.setData({
            type: 1,
            latitude: latitude,
            longitude: longitude
          });

          console.log(longitude, "!")
          _this.getAllVideoList(1, 0);
        }
      });
      

    } else if (detail.key == 'tab3'){

      wx.showToast({
        title: '暂未开发~~',
        icon: "none"
      })

    } else {
      _this.setData({
        type: 0
      });
      _this.getAllVideoList(1, 0);
    }

    wx.hideLoading();
    this.setData({
      current: detail.key
    });
  },

  hotVideo: function(){
    wx.showToast({
      title: 'test~~',
      icon: "none"
    })
    
    console.log("test")
  },

  recommedVideo: function () {
    
  },

  /**
* 用户点击右上角分享
*/
  onShareAppMessage: function () {
    let _this = this;
    console.log("!!!!!!!!!!!!!!!!")
    let uid = Store.getState().updateUid        // 获取redux中的用户uid
    return {
      title: this.data.title,
      // 分享路径，房间名+用户uid
      path: `/pages/live/live?id=${this.data.roomid}&source=${uid}`,
      imageUrl: this.data.shareImage,
      // 转发成功的回调函数
      success: function (res) {
        // 分享给个人：{errMsg: 'shareAppMessage:ok'}
        // 分享给群：{errMsg: 'shareAppMessage:ok', shareTickets: Array(1)}
        /* shareTicket 数组
         * 每一项是一个 shareTicket(是获取转发目标群信息的票据) ,对应一个转发对象
         */
        var shareTicket = (res.shareTickets && res.shareTickets[0]) || ''
        /* 官网的Tip: 由于策略变动，小程序群相关能力进行调整，
         * 开发者可先使用wx.getShareInfo接口中的群ID进行功能开发。
         */
        wx.getShareInfo({
          // 把票据带上
          shareTicket: shareTicket,
          success: function (res) {
            // 如果从小程序分享没有source，如果从别人分享的再二次分享带有source
            // 后续会讲_this.data.source的来源
            let source = _this.data.source ? _this.data.source : '';
            // 上报给后台，把群信息带给后台，后台会去解密得到需要的信息
            _this.upload_share_Result(res, '1', source)
          }
        })
      },
      fail: function (res) {
      }
    }
  }


})
