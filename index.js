const express =require('express');

const app=express();

app.use(express.json());

const users=[
    {
        id:"1",
        username:"amit",
        password:"1234",
        isAdmin:true,

    },
    {
        id:"2",
        username:"raj",
        password:"1234",
        isAdmin:false,
    }


]

app.post('/api/login',(req,res)=>{
    const {username,password}=req.body;

    const user=users.find(u=>{
        return u.username===username && u.password===password;
        
    });
    if(user){
        res.json(user);
    }else{
        res.status(400).json("username and password incorrect");
    }
    
})


app.listen(8000,function(err){
    if(err){
        console.log("error in server",err);
    }
    console.log("server is running");
});
    