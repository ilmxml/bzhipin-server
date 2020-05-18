/*
使用mongodb操作数据库
*/
const mongoose=require('mongoose')
const md5=require('blueimp-md5')//md5加密

mongoose.connect('mongodb://localhost:27017/bzhipin_test')
const conn=mongoose.connection

conn.on('connected',()=>{
    console.log('数据库连接成功');
    
})

//得到对应特定集合的model
/*Schema(描述文档结构)
定义Model与集合对应，操作集合*/
const userSchema = mongoose.Schema({//指定文档结构
    username:{type:String,required:true},//用户名
    password:{type:String,required:true},//密码
    type:{type:String,required:true},//dashen/laoban
    header:{type:String}
})

//定义Model
const UserModel=mongoose.model('user',userSchema)//users

//通过Model或其实例对集合数据进行curd操作
//通过save()添加数据
function testSave(){
    const userModel=new UserModel({username:'Tom',password:md5('123'),type:'dashen'})
    userModel.save((error,user)=>{
        console.log('save()',error,user);
        
    })
}

// testSave()

//通过find()/findOne()
function testFind(){
    //查询多个
    UserModel.find((error,users)=>{//得到所有匹配文档对象数组，如果没有则为[]
        console.log('find()',error,users);
        
    })
    //查询一个
    UserModel.find({password:123},(error,user)=>{//得到匹配的文档对象，如果没有则为null
        console.log('findOne()',error,user);
        
    })
}

// testFind()

//通过Model的findByIdAndUpdate()更新数据
function testUpdate(){
    UserModel.findByIdAndUpdate({_id:'5ea7c56b5f77681d8cfe4937'},
    {username:'Jack',password:md5('123')},
    (error,oldUser)=>{
        console.log('findByIdAndUpdate()',error,oldUser);
        
    })
}

// testUpdate()

///通过Model的remove()删除数据
function testDelete(){
    UserModel.remove({_id:'5ea7c56b5f77681d8cfe4937'},(error,result)=>{
        console.log('remove()',error,result);
        
    })
}
testDelete()
