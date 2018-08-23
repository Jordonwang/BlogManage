const router = require('koa-router')();
const multer = require('koa-multer');//加载koa-multer模块
// jwt
const jwt = require('jsonwebtoken')
const util = require('util')
const verify = util.promisify(jwt.verify) // 解密
const secret = require('../config').jwtsecret

const config = require('../config')
const fs = require("fs");
const path = require('path')
const newPath = path.join(__dirname, '../')
console.log(newPath)
router.prefix('/article');
// 用户信息
router.post('/create',async (ctx,next)=>{
  let title = ctx.request.body.title
  let date = ctx.request.body.display_time
  let tags = ctx.request.body.content_short
  let categories = ctx.request.body.catagory
  let content = ctx.request.body.content

  console.log(ctx.request.body.title)
  console.log(ctx.request.body.display_time)
  console.log(ctx.request.body.content_short)
  console.log(ctx.request.body.content)

  let data = '---\n'+
    'title:'+title+'\n'+
    'date:'+date+'\n'+
    'tags:'+tags+'\n'+
    'categories:'+categories+'\n'+
    '---\n'+content

  fs.writeFile(newPath + '/source/_posts/'+ title +'.md', data, {flag:'w',encoding:'utf-8',mode:'0666'},function(err){
    if(err){
      console.log("文件写入失败")
      console.log(err)
      ctx.body = {
        code:500,
        message: "文件写入失败",
        data: err
      }
    }else{
      console.log(data)
      console.log("文件写入成功");
      ctx.body = {
        code:0,
        message: "文件写入成功",
        data: data
      }
    }
  })
})
// 新建文章
router.get('/list',async (ctx,next)=>{

  try{
    getArticleList().then((res)=>{
      console.log('getArticleListRES')
      console.log(res)
      if(res){
        ctx.body = {
          code:200,
          message:res
        }
      }else{
        ctx.body = {
          code:999,
          message:'error message'
        }
      }
    })
  }catch (e){
    ctx.body = {
      code:999,
      message:e
    }
  }
})


function getArticleList() {
  console.log('getArticleList')
  return new Promise((resolve, reject) => {
    fs.readdir( newPath + '/source/_posts/', function (err, files) {
      var wenjianjia = [];
      for (var i = 0; i < files.length; i++) {
        var filename = files[i];
        console.log(filename, i)
        fs.open(newPath + '/source/_posts/' + filename, 'r', function (err, fd) {
          if(err) {
            reject(err)
            console.error(err);
            return;
          } else {
            var buffer = new Buffer(255);
            console.log(buffer.length);
            //每一个汉字utf8编码是3个字节，英文是1个字节
            fs.read(fd, buffer, 0, buffer.length, 0, function (err, bytesRead, buffer) {
              if(err) {
                throw err;
              } else {
                // 打印出buffer中存入的数据
                console.log(bytesRead, buffer.slice(0, bytesRead).toString());
                let str = buffer.slice(0, bytesRead).toString()
                let title = getReg(str,'title')
                let date = getReg(str,'date')
                let tags = getReg(str,'tags')
                let categories = getReg(str,'categories')
                let content = str.split('---')
                content = content[2]
                let articleObj = {
                  title,
                  date,
                  tags,
                  categories,
                  content
                }
                wenjianjia.push(articleObj)
                if(i === files.length){
                  console.log('resolve(wenjianjia)')
                  console.log(wenjianjia)
                  resolve(wenjianjia)
                }
                // 关闭文件
                fs.close(fd);
              }
            });
          }
        });
      }
    })
  })
}

function getReg(str,title) {
  let r = new RegExp('('+ title +').*(\\n)','g')
  let g = r.exec(str)
  if(g && g.length>0){
    return g[0].replace(title+':','')
  }
}
module.exports = router

