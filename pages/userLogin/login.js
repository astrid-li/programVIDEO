const app = getApp()

Page({
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  onLoad: function (params) {
    var me = this;
    var redirectUrl = params.redirectUrl;
    
    // debugger; 
    if (redirectUrl != null && redirectUrl != undefined && redirectUrl != '') {
      redirectUrl = redirectUrl.replace(/#/g, "?");
      redirectUrl = redirectUrl.replace(/@/g, "=");

      me.redirectUrl = redirectUrl;
     
    }


    // 查看是否授权
    // wx.getSetting({
    //   success(res) {
    //     if (res.authSetting['scope.userInfo']) {
    //       // 已经授权，可以直接调用 getUserInfo 获取头像昵称
    //       wx.getUserInfo({
    //         success: function (res) {
    //           console.log(res.userInfo)
    //         }
    //       })
    //     }
    //   }
    // })


  },

  bindGetUserInfo(e) {
    console.log(e.detail.userInfo)
  },

  // 登录  
  doLogin: function (e) {
    console.log(this)
    var me = this;
    var formObject = e.detail.value;
    var username = formObject.username;
    var password = formObject.password;
    // 简单验证
    if (username.length == 0 || password.length == 0) {
      wx.showToast({
        title: '用户名或密码不能为空',
        icon: 'none',
        duration: 3000
      })
    } else {
      var serverUrl = app.serverUrl;
      wx.showLoading({
        title: '请等待...',
      });
      // 调用后端
      wx.request({
        url: serverUrl + '/login',
        method: "POST",
        data: {
          username: username,
          password: password
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (lx) {
          console.log(lx,"========================================");
          wx.hideLoading();
          if (lx.data.status == 200) {
            // 登录成功跳转 
            wx.showToast({
              title: '登录成功',
              icon: 'success',
              duration: 2000
            });
            // app.userInfo = lx.data.data;
            // fixme 修改原有的全局对象为本地缓存
            app.setGlobalUserInfo(lx.data.data);
            // 页面跳转

            var redirectUrl = me.redirectUrl;
            if (redirectUrl != null && redirectUrl != undefined && redirectUrl != '') {
              wx.redirectTo({
                url: redirectUrl,
              })
            } else {
              wx.redirectTo({
                url: '../mine/mine',
              })
            }
            
          } else if (lx.data.status == 500) {
            // 失败弹出框
            wx.showToast({
              title: lx.data.msg,
              icon: 'none',
              duration: 3000
            })
          }
        }
      })
    }
  },

  doLoginForWeCheat() {
    //this
    var me = this;
    wx.login({
      //code
      //string
      //用户登录凭证（有效期五分钟）。开发者需要在开发者服务器后台调用 auth.code2Session，使用 code 换取 openid 和 session_key 等信息
      success(res) {
        if (res.code) {

          console.log("res.code",res.code+"lalalalalala",)
          var serverUrl = app.serverUrl;
          var jsCode = res.code;
          wx.showLoading({
            title: '请等待...',
          });



          // 调用后端
          wx.request({
            url: serverUrl + '/wechatLogin',
            method: "GET",
            data: {
              jsCode: jsCode
            },
            header: {
              'content-type': 'application/json' // 默认值
            },
            success: function (res) {
              console.log(res.data,"登录返回报文---------");
              wx.hideLoading();
              if (res.data.status == 200) {
                // 登录成功跳转 
                wx.showToast({
                  title: '登录成功',
                  icon: 'success',
                  duration: 2000
                });
                // app.userInfo = res.data.data;
                // fixme 修改原有的全局对象为本地缓存
                app.setGlobalUserInfo(res.data.data);
                // 页面跳转

                var redirectUrl = me.redirectUrl;
                if (redirectUrl != null && redirectUrl != undefined && redirectUrl != '') {
                  wx.redirectTo({
                    url: redirectUrl,
                  })
                } else {
                  wx.redirectTo({
                    url: '../mine/mine',
                  })
                }

              } else if (res.data.status == 500) {

                console.log("跳转到注册界面",res)
                // 失败弹出框
                wx.showToast({
                  title: res.data.msg,
                  icon: 'none',
                  duration: 1000,
                  success: function () {
                    setTimeout(function () {
                      //跳转到注册界面
                      wx.redirectTo({
                        url: '../userRegist/regist'
                      });
                    }, 500) //延迟时间
                  }
                })
              }
            }
          })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })
  },

  goRegistPage:function() {
    wx.redirectTo({
      url: '../userRegist/regist',
    })
  }
})