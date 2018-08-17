/**
 * 开发环境的配置内容
 */
module.exports = {
  env: 'development', //环境名称
  port: 3000,         //服务端口号
  database: {
    HOST: '127.0.0.1',  //数据库地址
    PORT: '3306',
    USER: 'root', //数据库用户
    PASSWORD: '123456', //数据库密码
    DATABASE: 'koa' //选中数据库
  },
  avatarUrl:'images/avatar/',
  jwtsecret:'sdccwehfowho4393u'
}
