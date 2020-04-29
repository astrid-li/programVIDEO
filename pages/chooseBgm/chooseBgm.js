const app = getApp()

Page({
  data: {
    bgmList: [],
    serverUrl: "",
    fileUrl: "",
    videoParams: {},
    current: 0,
    verticalCurrent: 0,
    worksImgs:[]
  },

  onLoad: function(params) {

    var me = this;
    console.log(params);
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
  },

  changeRadio(e) {
    console.log(e,"选中radio");
    this.setData({
      bgmId: e.detail.value
    })
    
  },

  handleClick() {
    const addCurrent = this.data.current + 1;
    const current = addCurrent > 2 ? 0 : addCurrent;
    this.setData({
      'current': current
    })
  },

  handleOldClick() {
    const addCurrent = this.data.current - 1;
    const current = addCurrent < 0 ? 2 : addCurrent;
    this.setData({
      'current': current
    })
  },
  

  chooseImage: function () {
    var user = app.getGlobalUserInfo();
    var serverUrl = app.serverUrl;
    var myFilePath = app.fileUrl;
    let that = this;
    let worksImgs = that.data.worksImgs;
    let len = that.data.worksImgs.length;
    var userInfo = app.getGlobalUserInfo();
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
            url: serverUrl +'/video/uploadCover', //此处换上你的接口地址 
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
                worksImgs.push(data.data);

                console.log(myFilePath+data.data, "图片上传成功啦");
                that.setData({
                  worksImgs: worksImgs
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
  },
  // 删除上传的图片
  deleteImg: function (e) {
    var worksImgs = this.data.worksImgs;
    var itemIndex = e.currentTarget.dataset.index;
    worksImgs.splice(itemIndex, 1);
    this.setData({
      worksImgs: worksImgs
    })
  },

  // 提交个人作品
  // submitWorks: function () {
  //   let that = this;
  //   let worksImgs = String(that.data.worksImgs);
  //   let obj = {
  //     store_id: that.data.store_id,
  //     mode_id: that.data.mode_id,
  //     works_img: worksImgs,
  //     works_info: that.data.works_info,
  //     is_xs: 1
  //   }
  //   if (obj.works_img.length == 0 || obj.works_info == '') {
  //     wx.showModal({
  //       title: '提示',
  //       content: '数据不能为空！',
  //       showCancel: false,
  //     })
  //   } else {
  //     utils.postRequest('Mode/worksAdd', obj, '加载中', (res) => {
  //       if (res.data.rc == 200) {
  //         wx.showModal({
  //           title: '提示',
  //           content: '作品上传成功',
  //           showCancel: false,
  //           success: function (res) {
  //             if (res.confirm) {
  //               that.setData({
  //                 isUpWork: false
  //               })
  //               that.onShow();
  //             }
  //           }
  //         })
  //       } else {
  //         wx.showModal({
  //           title: '提示',
  //           content: '作品上传失败',
  //           showCancel: false,
  //           success: function (res) {
  //             if (res.confirm) {
  //               that.setData({
  //                 isUpWork: false
  //               })
  //               that.onShow();
  //             }
  //           }
  //         })
  //       }
  //     })
  //   }

  // },


  upload: function(e) {

    // 上传短视频
    wx.showLoading({
      title: '上传中...',
    });

    var me = this;

    console.log(e,"提交事件触发",me);
    var coverImg = "";
    var bgmId = "";
    
    if (me.data.worksImgs[0] != undefined) {
      coverImg = me.data.worksImgs[0];
    }

    if (me.data.bgmId != undefined) {
      bgmId = me.data.bgmId;
    }
    var desc = e.detail.value.desc;

    console.log("bgmId:" + bgmId);
    console.log("desc:" + desc);

    var latitude =0;
    var longitude =0;
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
            bgmId: bgmId,
            desc: desc,
            coverImg: coverImg,
            videoSeconds: duration,
            videoHeight: tmpHeight,
            videoWidth: tmpWidth,
            latitude: latitude,
            longitude: longitude
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
  onReady: function (e) {
    // 使用 wx.createAudioContext 获取 audio 上下文 context
    this.audioCtx = wx.createAudioContext('myAudio1')
  },
  audioPlay: function () {
    this.audioCtx.play();
    wx.playVoice({
      filePath: res.tempFilePath,
      complete: function (res) {
        console.log('playVoice res')
        console.log(res)
      }
    })
  },
  audioPause: function () {
    this.audioCtx.pause()
  },
})