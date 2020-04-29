const app = getApp()

Page({
  data: {
    placeholder:"写标题可以让更多的人看到哦~",
    myLocal:"请选择地区",
    region: ['广东省', '深圳市', '宝安区'],
    regionJudge:false,
    customItem: '全部',
    localshow: "",
    switchMusic: false,
    switchSolo: true,
    chooseM:"none",
    pickerMusic:"请选择音乐",
    bgmList: [],
    serverUrl: "",
    fileUrl: "",
    index:"-1",
    showAudio:false,
    submitColor: "error",
    loading:false,
    submitIcon :"block",
    videoParams: {},
    current: 0,
    verticalCurrent: 0,
    whetherChangeText:"选封面",
    whetherChangeImage:"none",
    textLevel:0,
    imageLevel:-2,
    coverImage:"",
    contentValue:""
  },


  isChangeImage: function () {
    var user = app.getGlobalUserInfo();
    var serverUrl = app.serverUrl;
    var myFilePath = app.fileUrl;
    let that = this;
    let worksImgs = that.data.worksImgs;
    let len = that.data.worksImgs.length;
    var userInfo = app.getGlobalUserInfo();
    if (that.data.textLevel == 0) {
      that.setData({
        textLevel: 1,
        imageLevel: 0,
        whetherChangeImage:"block"
      })
    }
    wx.chooseImage({
      count: 1 - len, //最多选择1张图片
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        console.log(res);
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        if (res.tempFilePaths.count == 0) {
          return;
        }
        let tempFilePaths = res.tempFilePaths;
        // let token = app.data.uptoken;
        //上传图片 循环提交
        for (let i = 0; i < tempFilePaths.length; i++) {
          wx.uploadFile({
            url: serverUrl + '/video/uploadCover', //此处换上你的接口地址 
            filePath: tempFilePaths[i],
            name: 'file',
            header: {
              "Content-Type": "multipart/form-data",
              'accept': 'application/json',
              'headerUserId': user.id,
              'headerUserToken': user.userToken
            },
            formData: {
              userId: userInfo.id, // fixme 原来的 app.userInfo.id
            },
            success: function (res) {

              var data = JSON.parse(res.data);
              if (data.status == 200) {
                wx.showToast({
                  title: '上传成功!~~',
                  icon: "success"
                });
                // 上传成功后
                // let data = JSON.parse(res.data);
                that.setData({
                  coverImage:  data.data
                })

              } else if (res.data.status == 502) {
                wx.showToast({
                  title: res.data.msg,
                  duration: 2000,
                  icon: "none"
                });
                wx.redirectTo({
                  url: '../userLogin/login',
                })
              } else {
                wx.showToast({
                  title: '上传失败!~~',
                  icon: "error"
                });
              }


            }
          })
        }

      }
    })
    console.log(that.data.textLevel, that.data.imageLevel)
  },

  bindRegionChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      region: e.detail.value,
      myLocal: e.detail.value[0] + " " + e.detail.value[1] + " " + e.detail.value[2],
      regionJudge: true,
    })
    console.log(this.data.myLocal)
  },

  chooseLocal :function(e){
    var flag = e.detail.value;
    if (flag) {
      this.setData({
        localshow: "block"
      })
    } else {
      this.setData({
        localshow: "none"
      })
    }
    console.log(this.data.localshow);
  },

  onMusicChange : function(event) {
    var detail = event.detail.value;
    var c = "none";
    if(detail){
      c = "block"
    }
    this.setData({
      switchMusic: detail,
      chooseM:c
    })
  },

  onSoloChange : function(event) {
    var detail = event.detail.value;
    this.setData({
      switchSolo: detail
    })
  },

  bindPickerChange : function(e){
    var i = e.detail.value;
    var pM = this.data.bgmList[i].name;
    var s ="flase" ;
    if(i!=-1){
      s = "true" ;
    }
    this.setData({
      index: i,
      pickerMusic: pM,
      showAudio : s
    })
  },

  changeInput : function(e){
    var l = e.detail.value.length;
    var str = e.detail.value;
    var value =str;
    if (l >= 55) {
      value = e.substring(0, 55);
      wx: wx.showToast({
        title: '标题不可多于55个字',
        icon: 'none',
        duration: 1000,
      })     
    }
    this.setData({
      contentValue: value
    })
  },

  upload: function (e) {
    this.setData({
      submitColor: "success",
      loading: true,
      submitIcon: "none"
    })
    // 上传短视频
    wx.showLoading({
      title: '上传中...',
    });

    var me = this;

    console.log(e, "提交事件触发", me);
    var coverImg = "";
    var index = -1;

    if (me.data.coverImage != undefined) {
      coverImg = me.data.coverImage;
    }

    if (me.data.index != -1) {
      index = me.data.index;
    }
    var desc = e.detail.value.textarea;

    console.log("bgmId:" + index);
    console.log("desc:" + desc);

    var latitude = 0;
    var longitude = 0;
    wx.getLocation({
      type: 'wgs84',
      isHighAccuracy: true,
      highAccuracyExpireTime: 3100,
      success: function (res) {
        console.log(res)
        latitude = res.latitude;
        longitude = res.longitude;
      },

      complete: function () {

        var duration = me.data.videoParams.duration;
        var tmpHeight = me.data.videoParams.tmpHeight;
        var tmpWidth = me.data.videoParams.tmpWidth;
        var tmpVideoUrl = me.data.videoParams.tmpVideoUrl;
        var tmpCoverUrl = me.data.videoParams.tmpCoverUrl;


        var serverUrl = app.serverUrl;
        // fixme 修改原有的全局对象为本地缓存
        var userInfo = app.getGlobalUserInfo();

        wx.uploadFile({
          url: serverUrl + '/video/upload',
          formData: {
            userId: userInfo.id, // fixme 原来的 app.userInfo.id
            bgmId: index,
            desc: desc,
            coverImg: coverImg,
            videoSeconds: duration,
            videoHeight: tmpHeight,
            videoWidth: tmpWidth,
            latitude: latitude,
            longitude: longitude,
            // 上面两个是啥，然后还缺少：1、原视频是否静音，就是上传的视频里面的声音要不要播放；2、位置，视屏位置显示，然后好像首页也得改一下，需要添加判断位置信息，为空不加地点，不为空显示地点
          },
          filePath: tmpVideoUrl,
          name: 'file',
          header: {
            'content-type': 'application/json', // 默认值
            'headerUserId': userInfo.id,
            'headerUserToken': userInfo.userToken
          },
          success: function (res) {
            var data = JSON.parse(res.data);
            wx.hideLoading();
            if (data.status == 200) {
              wx.showToast({
                title: '上传成功!~~',
                icon: "success"
              });
              // 上传成功后跳回之前的页面
              wx.navigateBack({
                delta: 1
              })

            } else if (res.data.status == 502) {
              wx.showToast({
                title: res.data.msg,
                duration: 2000,
                icon: "none"
              });
              wx.redirectTo({
                url: '../userLogin/login',
              })
            } else {
              wx.showToast({
                title: '上传失败!~~',
                icon: "error"
              });
            }

          }
        })


      }


    });


  },
  formReset: function () {
    var me = this;
    me.setData({
      textLevel: 0,
      imageLevel: -2,
      contentValue: "",
      myLocal: "请选择地区",
      region: ['广东省', '深圳市', '宝安区'],
      regionJudge: false,
      switchMusic:false,
      switchSolo: true,
      pickerMusic: "请选择音乐",
      index: "-1",
      showAudio: false,
      chooseM: "none",
      coverImage: "",

    })
    console.log('form发生了reset事件');

  },








  onLoad: function(params) {

    var me = this;
    me.setData({
      videoParams: params
    });
    wx.showLoading({
      title: '请等待...',
    });
    var serverUrl = app.serverUrl;
    var user = app.getGlobalUserInfo();
    //debugger;
    // 调用后端
    wx.request({
      url: serverUrl + '/bgm/list',
      method: "POST",
      header: {
        'content-type': 'application/json', // 默认值
        'headerUserId': user.id,
        'headerUserToken': user.userToken
      },
      success: function(res) {
        console.log(res.data);
        wx.hideLoading();
        if (res.data.status == 200) {
          var bgmList = res.data.data;
          me.setData({
            bgmList: bgmList,
            serverUrl: serverUrl,
            fileUrl: app.fileUrl
          });
        } else if (res.data.status == 502) {
          wx.showToast({
            title: res.data.msg,
            duration: 2000,
            icon: "none",
            success: function() {
              wx.redirectTo({
                url: '../userLogin/login',
              })
            }
          });
        }
      }
    })
  }
})