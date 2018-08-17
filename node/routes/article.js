const router = require('koa-router')();
const multer = require('koa-multer');//加载koa-multer模块
// jwt
const jwt = require('jsonwebtoken')
const util = require('util')
const verify = util.promisify(jwt.verify) // 解密
const secret = require('../config').jwtsecret

const config = require('../config')
const fs = require("fs");

router.prefix('/article');
// 用户信息
router.get('/list',async (ctx,next)=>{

  try{
    let res = await getArticleList()
    if(res[0]){
      ctx.body = {
        code:200,
        message:res[0]
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

function getArticleList() {
  fs.readdir('../source/_posts', function (err, files) {
    var wenjianjia = [];
    console.log(files);
    for (var i = 0; i < files.length; i++) {
      var filename = files[i];
      fs.stat('./*.md' + filename, function (err, stats) {
        if (stats.isDirectory()) {
          wenjianjia.push(filename);
        }
        console.log(wenjianjia);
      });
    }
    console.log(wenjianjia);
  })
}
module.exports = router

