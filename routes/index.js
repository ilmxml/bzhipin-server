var express = require('express');
var router = express.Router();

const {UserModel,ChatModel} = require('../db/models')
const md5=require('blueimp-md5')
const filter = {password: 0,__v:0} //查 询 时 过 滤 出 指 定 的 属 性


// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

// //注册用户注册路由
// /*
//   接收username，password
//   成功0，失败1
//   */
// router.post('/register',(req,res)=>{
//   //接收参数
//   const {username,password}=req.body
//   if(username==='admin'){//失败
//     res.send({
//       code:1,
//       msg:'用户已经存在'
//     })
//   }else{//成功
//     res.send({
//       code:0,
//       data:{
//         '_id':'acb',username,password
//       }
//     })
//   }
// })

//注册的路由
router.post('/register',(req,res)=>{
  //请求参数数据
  const {username,password,type}=req.body
  //处理:判断用户是否存在
  UserModel.findOne({username},(err,user)=>{
    if(user)
      res.send({code:1,msg:'此用户已存在！'})
    else{
      new UserModel({username,type,password:md5(password)}).save((err,user)=>{
        res.cookie('userid',user._id,{maxAge:1000*60*60*24*7})
        const data={username,type,_id:user._id}
        res.send({
          code:0,
          data
        })
      })
    }
  })
  //返回响应数据

})

//登录路由
router.post('/login',(req,res)=>{
  const {username,password}=req.body
  UserModel.findOne({username,password:md5(password)},filter,(err,user)=>{
    if(user){
      res.cookie('userid',user._id,{maxAge:1000*60*60*24*7})
      res.send({
        code:0,
        data:user
      })
    }else{
      res.send({code:1,msg:'用户名或密码错误！'})
    }
  })
})

//更新用户信息路由
router.post('/update',(req,res)=>{
  //从请求的cookie中获得用户id
  const userid=req.cookies.userid
  if(!userid)
    return res.send({code:1,msg:'请先登录！'})
  //得到用户提交的信息
  const user=req.body
  UserModel.findByIdAndUpdate({_id:userid},user,(err,oldUser)=>{
    if (!oldUser) {
      //cookie出错，通知浏览器删除userid cookie
      res.clearCookie('userid')
      res.send({code:1,msg:'请先登录！'})
    }else{
      const {_id,username,type}=oldUser
      const data=Object.assign({_id,username,type},user)
      res.send({code:0,data})
    }
  })
})

//获取用户信息路由
router.get('/user',(req,res)=>{
  //从请求的cookie得到userid
  const userid = req.cookies.userid
  if(!userid){
    return res.send({code:1,msg:'请先登录！'})
  }
  UserModel.findOne({_id:userid},filter,(err,user)=>{
    res.send({code:0,data:user})
  })
})

//获取用户列表路由
router.get('/userlist',(req,res)=>{
  const pageSize=10
  const {type,page}=req.query
  if(!type&&!page){
    return res.send({code:1,msg:'请求错误！'})
  }
  UserModel.find({type},filter,(err,users)=>{
    res.send({code:0,data:users})
  }).skip((page-1)*pageSize).limit(10)
})

//获 取 当 前 用 户 所 有 相 关 聊 天 信 息 列 表 
router.get('/msglist', function (req, res) { // 获 取 cookie 中 的 userid 
  const userid = req.cookies.userid // 查 询 得 到 所 有 user 文 档 数 组 
  UserModel.find(function (err, userDocs) { // 用 对 象 存 储 所 有 user 信 息 : key 为 user 的 _id, val为 name和 header组 成 的 user对 象
    const users = {} //对 象 容 器 
    userDocs.forEach(doc => {
      users[doc._id] = { username: doc.username, header: doc.header }
    }) 
    /* 查 询 userid 相 关 的 所 有 聊 天 信 息 参 数 1: 查 询 条 件 参 数 2: 过 滤 条 件 参 数 3: 回 调 函 数 */
    ChatModel.find(
      { '$or': [{ from: userid }, { to: userid }] },
      filter,
      function (err, chatMsgs) { // 返 回 包 含 所 有 用 户 和 当 前 用 户 相 关 的 所 有 聊 天 消 息 的 数 据 
        res.send({ code: 0, data: { users, chatMsgs } })
      })
  })
})

//修改指定消息为已读
router.post('/readmsg', function (req, res) {
  //得到请求中的from和to
  const from = req.body.from
  const to = req.cookies.userid
  /*
  更新数据库中的 chat 数据
  参数 1: 查询条件
  参数 2: 更新为指定的数据对象
  参数 3: 是否 1 次更新多条, 默认只更新一条
  参数 4: 更新完成的回调函数
  */
  ChatModel.update(
    { from, to, read: false },
    { read: true },
    { multi: true },
    function (err, doc) {
      console.log('/readmsg', doc)
      res.send({ code: 0, data: doc.nModified }) // 更 新 的 数 量 
    })
})

module.exports = router;
