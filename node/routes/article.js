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
const newPath = path.join(__dirname, '../../../blog')
console.log(newPath)
router.prefix('/article');
// 用户信息
router.post('/create',async (ctx,next)=>{
  let title = ctx.request.body.title
  let date = ctx.request.body.display_time
  let tags = ctx.request.body.content_short
  let categories = ctx.request.body.catagory
  let content = ctx.request.body.content
  let articleId = ctx.request.body.articleId

  console.log(ctx.request.body.title)
  console.log(ctx.request.body.display_time)
  console.log(ctx.request.body.content_short)
  console.log(ctx.request.body.content)
  console.log('articleId:'+articleId)
  // if(ctx.request.body.content_short.indexOf('[')>-1){
  //   let tags = JSON.parse(ctx.request.body.content_short)
  //   if(tags)
  // }
  let data = '---\n'+
    'title: '+title+'\n'+
    'date: '+date+'\n'+
    'tags: ['+tags+']\n'+
    'categories: '+categories+'\n'+
    '---\n'+content
  try {
    let res
    if(articleId){
      console.log('更新')
      res = await updateArticle(data,articleId)
    }else{
      console.log('新写入')
      res = await writeArticle(data)
    }
    if(res){
      ctx.body = {
        code:0,
        message: "文件写入成功",
        data: res
      }
    }
  }catch (err){
    ctx.body = {
      code:500,
      message: "文件写入失败",
      data: err
    }
  }
})

function writeArticle(data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(newPath + '/source/_posts/'+ randomWord() +'.md', data, {flag:'w',encoding:'utf-8',mode:'0666'},function(err){
      if(err){
        console.log("文件写入失败")
        console.log(err)
        reject(err)
      }else{
        console.log(data)
        console.log("文件写入成功");
        resolve(data)
      }
    })
  })
}

function updateArticle(data,id) {
  return new Promise((resolve, reject) => {
    fs.writeFile(newPath + '/source/_posts/'+ id +'.md', data, {flag:'w',encoding:'utf-8',mode:'0666'},function(err){
      if(err){
        console.log("文件写入失败")
        console.log(err)
        reject(err)
      }else{
        console.log(data)
        console.log("文件写入成功");
        resolve(data)
      }
    })
  })
}
router.get('/detail', async (ctx,next) => {
  const detailId = ctx.query.id
  try {
    let res = await getArticleDetail(detailId)
    ctx.body = {
      code:0,
      message: "获取成功",
      data: res
    }
  } catch (err) {
    ctx.body = {
      code:500,
      message: "获取失败:"+err
    }
  }

})
// 新建文章
router.get('/list',async (ctx,next)=>{

  try {
    let res = await getArticleList()
    if(res){
      ctx.body = {
        code:200,
        articleList:res
      }
    }else{
      ctx.body = {
        code:500,
        message:'error message'
      }
    }
  }catch (err){
    ctx.body = {
      code:500,
      message:'网络错误'+err
    }
  }
})

function getArticleDetail(id) {
  return new Promise((resolve, reject)=>{
    fs.open(newPath + '/source/_posts/' + id + '.md', 'r', function (err, fd) {
      if(err) {
        reject(err)
        console.error(err);
        return;
      } else {
        var buffer = new Buffer(9999);
        console.log(buffer.length);
        //每一个汉字utf8编码是3个字节，英文是1个字节
        fs.read(fd, buffer, 0, buffer.length, 0, function (err, bytesRead, buffer) {
          if(err) {
            reject(err)
          } else {
            // 打印出buffer中存入的数据
            console.log(bytesRead, buffer.slice(0, bytesRead).toString());
            let str = buffer.slice(0, bytesRead).toString()
            let title = getReg(str,'title')
            let date = getReg(str,'date')
            let tags = getReg(str,'tags')
            tags = tags.slice(2,tags.length-2).split(',')
            let categories = getReg(str,'categories')
            let content = str.split('---')
            content = content[2]
            let articleObj = {
              title,
              date,
              tags,
              categories,
              content,
              filename: id + '.md'
            }
            resolve(articleObj)
            // 关闭文件
            fs.close(fd);
          }
        });
      }
    });

  })
}
function getArticleList() {
  return new Promise((resolve, reject) => {
    fs.readdir( newPath + '/source/_posts/', function (err, files) {
      var wenjianjia = [];
      (function readArticles(i) {
        console.log('readArticles:'+i)
        if(i==files.length){
          console.log('读取文件结束')
          resolve(wenjianjia)
          return;
        }
        var filename = files[i];
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
                reject(err)
              } else {
                // 打印出buffer中存入的数据
                console.log(bytesRead, buffer.slice(0).toString());
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
                  content,
                  filename
                }
                wenjianjia.push(articleObj)
                // 关闭文件
                fs.close(fd);
                readArticles(i+1);
              }
            });
          }
        });
      })(0)
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

function randomWord(randomFlag = true, min = 10, max = 20){
  var str = "",
    range = min,
    arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  // 随机产生
  if(randomFlag){
    range = Math.round(Math.random() * (max-min)) + min;
  }
  for(var i=0; i<range; i++){
    pos = Math.round(Math.random() * (arr.length-1));
    str += arr[pos];
  }
  return str;
}
module.exports = router

