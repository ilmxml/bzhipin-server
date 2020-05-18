module.exports=function (server){
   io=require('socket.io')(server) 
   //监视服务器端与客户端的连接
   io.on('connection',function(socket){
       console.log('有一个客户端连接上了服务器')
       socket.on('sendMsg',function(data){
           console.log('服务器接收到客户端消息消息',data)
           //处理数据
           data.name=data.name.toUpperCase()
           //发送消息
           socket.emit('receiveMsg',data)
           console.log('服务器端发送消息',data)
       })
   })
}
