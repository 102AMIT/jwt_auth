const express =require('express');

const app=express();

const jwt=require('jsonwebtoken');

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
        // Generate an access token 
        // here i'm sending the payload and secret key ,and header we need to pass in postman
        // .sign is inbuild function came with jwtwebtoken
        // basically we are create secret key in .env and use it here but for now we are using here 
        const accessToken=jwt.sign({id:user.id,isAdmin:user.isAdmin},"mySecretKey");

        res.json({
            username:user.username,
            isAdmin:user.isAdmin,
            accessToken,//pasing the token when user login 
        });
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
    