const {ChatModel}=require('../db/models')
module.exports=function (server){
    io=require('socket.io')(server) 
    //监视服务器端与客户端的连接
    io.on('connection',function(socket){
        console.log('有一个客户端连接上了服务器')
        socket.on('sendMsg', function ({ from, to, content }) {
            console.log('服务器接收到客户端消息消息', { from, to, content })
            //处理数据(保存消息)
            //准备chatMsg对象
            const chat_id = [from, to].sort().join('_')
            const create_time = Date.now()
            new ChatModel({ from, to, content, chat_id, create_time }).save((err, chatMsg) => {
                //发送消息
                io.emit('receiveMsg', chatMsg)
                console.log('服务器端发送消息', chatMsg)
            })
        })
    })
 }
 