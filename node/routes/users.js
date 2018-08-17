const router = require('koa-router')();
const multer = require('koa-multer');//加载koa-multer模块
// jwt
const jwt = require('jsonwebtoken')
const util = require('util')
const verify = util.promisify(jwt.verify) // 解密
const secret = require('../config').jwtsecret

const config = require('../config')
const {
  getUserInfo,
  createUser,
  checkLogin,
  saveUserAvatar,
  getUserList,
  updateUserInfo
} = require('../models/user')

router.prefix('/user');
// 用户信息
router.get('/userInfo',async (ctx,next)=>{

  const userPhone = ctx.query.userPhone
  const cookies = ctx.cookies.get('MyName')
  if(!userPhone){
    ctx.body = {
      code:999,
      message:'手机号码空'
    }
    return
  }

  try{
    let res = await getUserInfo({userPhone})
    if(res[0]){
      ctx.body = {
        code:200,
        message:res[0],
        cookies
      }
    }else{
      ctx.body = {
        code:999,
        message:'error message'
      }
    }
  }catch (e){
    ctx.body = {
      code:999,
      message:e
    }
  }

})
// 注册
router.post('/userRegister',async (ctx,next)=>{
  console.log(ctx.request.body)

  ctx.body = {
      code:999,
      message:'手机号为空'
    }
  // const userPhone = ctx.request.body.userPhone
  // const userPassword = ctx.request.body.userPassword
  // const userEmail = ctx.request.body.userEmail
  // const currentTime = new Date().getTime()

  // if(userPhone==='' || userPhone==='undefined' || userPhone == null){
  //   ctx.body = {
  //     code:999,
  //     message:'手机号为空'
  //   }
  //   return
  // }
  // if(userPassword==='' || userPassword==='undefined' || userPassword == null){
  //   ctx.body = {
  //     code:999,
  //     message:'密码为空'
  //   }
  //   return
  // }
  // const createUserData = {
  //   userPhone,
  //   userPassword,
  //   userEmail,
  //   currentTime
  // }
  // try {
  //   let res = await getUserInfo({userPhone})
  //   if(res.length>0){
  //     ctx.body = {
  //       code:999,
  //       message:'该手机号已注册'
  //     }
  //     return
  //   }
  //   ctx.body = {
  //     code:200,
  //     message:'注册成功',
  //     data:await createUser(createUserData)
  //   }
  // }catch (err){
  //   ctx.body = {
  //     code:500,
  //     message:'网络错误',
  //     data:err
  //   }
  // }
});
// 登陆
router.post('/login',async (ctx,next)=> {

  const userPhone = ctx.request.body.userPhone
  const userPassword = ctx.request.body.userPassword

  const loginData = {
    userPhone,userPassword
  }
  try{
    let res = await checkLogin(loginData)
    let userToken = {
      name: userPhone
    }
    // expiresInMinutes  expiresIn :1h
    const token = jwt.sign(userToken, secret, {expiresIn: '1h'})

    if(res.length>0){

      ctx.body = {
        code:200,
        message:'登陆成功',
        data:loginData,
        token
      }
    }else{
      ctx.body = {
        code:-999,
        message:'登陆失败,用户或密码错误'
      }
    }
  }catch (err){
    ctx.body = {
      code:500,
      message:'网络错误',
      data:err
    }
  }
})
// 用户列表
router.get('/getUserList',async (ctx,next)=> {

  const token = ctx.header.authorization

  if(token){
    ctx.cookies.set(
      'MyName','Jordonwang'
    );
    try {
      let payload = await verify(token.split(' ')[1], secret)
      let data = await getUserList()
      ctx.body = {
        code:200,
        message:'success',
        data:data,
        payload
      }
    }catch (err){
      ctx.body = {
        code:500,
        message:'Error',
        data:err
      }
    }
  }else{
    ctx.body = {
      code:500,
      message:'token error'
    }
  }
})

//文件上传
//配置
var storage = multer.diskStorage({
  //文件保存路径
  destination: function (req, file, cb) {
    cb(null, './public/'+config.avatarUrl)
  },
  //修改文件名称
  filename: function (req, file, cb) {
    var fileFormat = (file.originalname).split(".");
    cb(null,Date.now() + "." + fileFormat[fileFormat.length - 1]);
  }
})
//加载配置
var upload = multer({ storage: storage });
// 头像上传
router.post('/avatarUpload',upload.single('avatar'),async (ctx)=> {

  if(!ctx.req.body.userPhone || !ctx.req.file.filename){
    ctx.body = {
      code:999,
      message:'参数错误'
    }
    return;
  }
  let data = {
    userAvatar:config.avatarUrl+ctx.req.file.filename,
    userPhone:ctx.req.body.userPhone,
    updateTime:new Date().getTime()
  }
  try {
    await saveUserAvatar(data)
    ctx.body = {
      code:200,
      message:'上传成功',
      filename: config.avatarUrl+ctx.req.file.filename,//返回文件名
    }
  }catch (e){
    console.log('avatarUpload-error:'+e)
    ctx.body = {
      code:999,
      message:'上传失败'
    }
  }
})

router.post('/updateUserInfo',async (ctx,next)=>{
  const userPhone = ctx.request.body.userPhone
  const userName = ctx.request.body.userName
  const userEmail = ctx.request.body.userEmail
  if(!userPhone || !userName || !userEmail){
    ctx.body = {
      code:999,
      message:'参数不可为空'
    }
    return
  }
  let data = {
    userPhone,userName,userEmail
  }
  try{
    ctx.body = {
      code:200,
      message:'更新成功',
      data:await updateUserInfo(data)
    }
  }catch (err){
    ctx.body = {
      code:999,
      message:'网络错误',
      data:err
    }
  }
})
module.exports = router;
