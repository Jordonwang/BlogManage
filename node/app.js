const Koa = require('koa')
  , path=require('path')
  , logger = require('koa-logger')
  , json = require('koa-json')
  , onerror = require('koa-onerror')
  , bodyParser = require('koa-bodyparser')
  , staticCache = require('koa-static-cache');
const parse = require('url').parse;
const jwtKoa = require('koa-jwt')
const secret = require('./config').jwtsecret
const errorHandle = require('./middlewares/errorHandle')
const cors = require('koa-cors')
//log工具
const logUtil = require('./utils/log_util');

var app = new Koa();
var index = require('./routes/index');
var users = require('./routes/users');
var article = require('./routes/article');

// error handler
onerror(app);

app.use(cors());
app.use(bodyParser({
  enableTypes:['json', 'form', 'text']
}));

app.use(errorHandle)
// app.use(require('koa-static')(__dirname + '/public'));
// 静态文件在客户单进行缓存
app.use(staticCache(path.join(__dirname, '/public'), {
  maxAge: 365 * 24 * 60 * 60
}))
/*
app.use(async (ctx,next) =>{
  await next()
  // 实现路由， 得到URL的pathname，以确定被请求文件的路径
  let url = parse(ctx.req.url).pathname;
  let _path = path.join(__dirname, url);
  let ext = path.extname(_path);
  ext = ext ? ext.slice(1) : 'unknown';
  //响应之前判断后缀名是否符合要添加过期时间头的条件。
  if(ext.match(/^(gif|png|jpg|js|css)$/ig)){
    console.log('启用expires')
    let expires = new Date();
    expires.setTime(expires.getTime() + config.Expires.maxAge * 1000);
    expires.setTime(expires.getTime() + 60 * 60 * 24 * 365 * 1000);
    // ctx.res.setHeader("Expires", expires.toUTCString());
  }
})
*/

// app.use(jwtKoa({secret}).unless({
//     path: [/^\/user\/login/,/^\/user\/userRegister/,/^\/article\/*/] //数组中的路径不需要通过jwt验证
//   }))

app.use(json());
// app.use(logger());
//
// app.use(async (ctx,next)=>{
//   var start = new Date;
//   await next();
//   var ms = new Date - start;
//   console.log('%s %s - %s', ctx.method, ctx.url, ms);
// });

// logger
app.use(async (ctx, next) => {
  //响应开始时间
  const start = new Date();
  //响应间隔时间
  var ms;
  try {
    //开始进入到下一个中间件
    await next();

    ms = new Date() - start;
    //记录响应日志
    logUtil.logResponse(ctx, ms);

  } catch (error) {
    console.log('logError!!!')
    ms = new Date() - start;
    //记录异常日志
    logUtil.logError(ctx, error, ms);
  }
  logUtil.logInfo(ctx)
});
// routes definition
app.use(index.routes(), index.allowedMethods());
app.use(users.routes(), users.allowedMethods());
app.use(article.routes(), article.allowedMethods());

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
  ctx.body = {
    code:999,
    message:err
  }
});

module.exports = app;
