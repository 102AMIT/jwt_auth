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
    },


];

let refreshTokens=[];

// we need to refresh the token 

app.post("/api/refresh",(req,res)=>{
    // it's take refresh token from user 
    const refreshToken =req.body.token;

    // send error if there is not token or invalid token
    // we need to store that token in db or local storage but for now i create a array for that
    if(!refreshToken){
        return res.status(401).json("you are not authenticated");
    }
    // if refreshToken array does not conatain any token then we throw a error 
    if(!refreshTokens.includes(refreshToken)){
        return res.status(403).json("refreshToken is not valid");
    }
    jwt.verify(refreshToken,"myRefreshSecretKey",(err,user)=>{
        if(err){
            console.log(err);
        }
        refreshTokens=refreshTokens.filter((token)=> token !==refreshToken);

        const newAccessToken=generateAccessToken(user);
        const newRefreshToken=generateRefreshToken(user);
    
        
        refreshTokens.push(newRefreshToken);

        res.status(200).json({
            accessToken:newAccessToken, 
            refreshToken:newRefreshToken
        })
    // if everything is ok ,create new access token ,refresh token and send to user

    })
});

// function for generate access token

const generateAccessToken=(user) => {
    // Generate an access token 
    // here i'm sending the payload and secret key ,and header we need to pass in postman
    // .sign is inbuild function came with jwtwebtoken
    // basically we are create secret key in .env and use it here but for now we are using here 
    return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, "mySecretKey", { expiresIn: "100s" });
};
const generateRefreshToken=(user)=>{
    // here after 15 m we need to login again and again so we need to handle this by refresh token    
    //here we are providing the refresh token 
    return jwt.sign({id:user.id,isAdmin:user.isAdmin},"myRefreshSecretKey",{expiresIn:"100s"});
}
app.post('/api/login',(req,res)=>{
    const {username,password}=req.body;

    const user=users.find((u)=>{
        return u.username===username && u.password===password;
        
    });
    if(user){
        
        const accessToken=generateAccessToken(user);
        
        const refreshToken= generateRefreshToken(user);
        // here we are pushing the token into the array
        refreshTokens.push(refreshToken);
        res.json({
            username:user.username,
            isAdmin:user.isAdmin,
            accessToken,//pasing the token when user login
            refreshToken 
        });
    }else{
        res.status(400).json("username and password incorrect");
    }
    
});


const verify=(req,res,next)=>{
    const authHeader=req.headers.authorization;
    if(authHeader){
        // we need to pass bearer in postman after that we provide space then provide token so here we need that token
        //  so we split the value of header and take than token from index 1
        const token =authHeader.split(" ")[1];
        // we need to verify this token verify is inbuilt function came with jwt
        jwt.verify(token,"mySecretKey",(err,user)=>{
            if(err){
                return res.status(403).json("Token is not valid");
            }
            req.user=user;
            next();
            
        })
    }
    else{   
        res.status(401).json("You are not authenticated");
    }
}

// delete user by using verify middleware

app.delete("/api/users/:userId",verify,(req,res)=>{
        if(req.user.id===req.params.userId || req.user.isAdmin){
            res.status(200).json("user deleted successfully!")
        }else{
            res.status(403).json("You are not allowed to delete the user");
        }
});

app.post("/api/logout",verify,(req,res)=>{
    const refreshToken=req.body.token;
    refreshTokens=refreshTokens.filter((token)=>token !==refreshToken);
    res.status(200).json("user logout successfully!");
})

app.listen(8000,function(err){
    if(err){
        console.log("error in server",err);
    }
    console.log("server is running");
});
