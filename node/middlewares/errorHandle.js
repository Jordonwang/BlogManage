module.exports = errorHandle = async(ctx, next) => {

  return await next().catch((err) => {
    if (err.status === 401) {
      ctx.status = 401;
      ctx.body = {
        code:401,
        error: err.originalError ? err.originalError.message : err.message,
      };
    } else {
      // console.log('err'+err)
      // ctx.body = {
      //   code:err.status,
      //   error: err.originalError ? err.originalError.message : err.message,
      // };
      throw err;
    }
  });
}
