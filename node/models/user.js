var {query} = require('../mysql/mysql')
// 获取用户信息
exports.getUserInfo = async(data)=>{
  let sql = `SELECT * FROM user where userPhone = ?`
  return await query(sql,[data.userPhone])
}
// 获取用户列表
exports.getUserList = async()=>{
  let sql = 'SELECT * FROM user ORDER BY createTime DESC'
  return await query(sql)
}
// 注册
exports.createUser =  async (data)=> {
  let sql = `INSERT INTO user (userPhone,userPassword,userEmail,createTime) VALUES (?,?,?,?)`
  await query(sql,[data.userPhone,data.userPassword,data.userEmail,data.currentTime])
  return data
}
//登陆
exports.checkLogin = async (data)=>{
  let sql = `SELECT id FROM user WHERE userPhone = ? AND userPassword = ?`
  return await query(sql,[data.userPhone,data.userPassword])
}
//用户头像存储
exports.saveUserAvatar = async (data) =>{
  let sql = `UPDATE user SET userAvatar = ? , updateTime =? WHERE userPhone = ?`
  return await query(sql,[data.userAvatar,data.updateTime,data.userPhone])
}
// 更新用户信息
exports.updateUserInfo = async (data)=>{
  let sql = `UPDATE user SET userEmail=?,userPhone = ?,userName = ? WHERE userPhone = ?`
  return await query(sql,[data.userEmail,data.userPhone,data.userName,data.userPhone])
}
