const jwt = require('jsonwebtoken');






module.exports = {
  verifyToken: async (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token) 
        {
         return res.status(401).json({ message: "Unauthorized: No token found" });
       }
  try {
    const decoded = jwt.verify(token,process.env.JWT_SECRET); // use same secret used to sign
    if(!decoded){
     return res.status(401).json({error:'Invalid token'})   
    }
 
    req.user = decoded
    next();
  } catch (err) {
    return res.status(403).send({ message: "Invalid or expired token" });
  }

}}