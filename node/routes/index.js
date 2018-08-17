var router = require('koa-router')();
var {query} = require('../mysql/mysql')
router.get('/userInfo',async function (ctx,next){
  console.log(this)
  async function getUserInfo () {
    let sql = 'SELECT * FROM userinfo'
    let data = await query(sql)
    return data
  }
  this.body = {
    code:200,
    message:'success',
    data:await getUserInfo()
  }
});

router.get('/foo', function *(next) {
  yield this.render('index', {
    title: 'Hello World fo3o!'
  });
});

module.exports = router;
