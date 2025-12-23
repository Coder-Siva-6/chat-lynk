
const jwt = require('jsonwebtoken');




 const generateToken = (userId,res)=>{
    const token = jwt.sign({userId},process.env.JWT_SECRET,{expiresIn:'7d'})
     res.cookie("jwt",token,{
        maxAge: 7 * 24 *60 * 60*1000,
        httpOnly:true,
        
         sameSite:"strict",
       // sameSite:"none",
        //secure:process.env.NODE_ENV !== " development"
        secure:true
    }).json({message:'login successs from jwt',token})
    return token


}


module.exports = { generateToken };