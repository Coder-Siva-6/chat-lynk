
const {generateToken} = require('./jwt.token.js');
const bcrypt = require('bcrypt');
const User = require('../models/db.model.js');
const jwt = require('jsonwebtoken');




const signUp =  async (req,res)=>{

    const{name,email,phone,password}= req.body

    const userEmail = await User.findOne({email})
    const userPhone = await User.findOne({phone})

    if(userEmail ){
        return res.status(405).json({message:'Email  already exists'})

    }
    if(userPhone){
        return res.status(405).json({message:'Phone number  already exists'})

    }


    if(!name || !email || !phone || !password)
    {
     return res.status(400).json({message:'All fields are required'})
    }

    if(phone.toString().length != 10){
         return res.status(406).json({message:'Invalid phone number'})

    }

    if(password.toString().length < 6)
    {
     return res.status(406).json({message:'Password must contain minimum 6 letter or numbers'})
    }



    const salt = await bcrypt.genSalt(10)
    const newPass = await bcrypt.hash(password,salt) // encrypting password bycrypt means module
       try{
            const addUser = await User(
             {name,
             email,
             phone,
             password:newPass 
             }
        )
       await addUser.save()
         res.status(201).json({message:"User addded sucessfully",name,email,phone,newPass})  
          
        
       }catch(err){
        console.log('server error')
        res.status(500).json({message:'server Eror',err})
       }

    
}

 
 

























 const logIn = async(req,res)=>{
    const{num,pass} =req.body
  
  try{
     if( !num || !pass){
         return res.status(401).json({message:'All fields are required'})
     }

     const user = await User.findOne({phone:num})
     
      
    
      if(!user){
      return res.status(401).json({message:'User is not registered with this phone number'})
      } 
        const decode = await bcrypt.compare(pass,user.password)
        if(decode){
       generateToken(user._id,res)
       }
       
       if(!decode){
        return res.status(406).json({message:'Invalid  password'})
       }
       

     }catch(err){
      console.log("error in login controller",err.message)
      res.status(500).json({message:'internal Server Error'})
     }

     
} 



const logOut = async (req,res)=>{
  try{
    res.cookie('jwt',{maxAge:0})
    res.status(200).json({message:'logged out sucessfully'})
  }
  catch(err){
      console.log("error in logout controller",err.message)
      res.status(500).json({message:'internal Server Error'})
     }
}




//////////////////////////contacts///////////////////////////////////////



 const contact = async (req,res)=>{
  const{name,phone,myPhone} =  req.body
  if(!name || !phone || !myPhone){

    console.log("contact uname , password field is empty")
    res.status(400).json({message:'all fields are required'})
  }
  const update = await User.updateOne(
    {
      phone:myPhone
    },{
      $push:{
        contacts:{
          name:name,
          phone:phone,
          message:[]

        }
      }
    })
   console.log(update)
   res.status(200).json({message:'sucess'})

}



 const  mess = async (req,res)=>{
  const{sentPhone,recivePhone,message}=req.body

  try{
   const up = await User.updateOne(
      {
        phone:sentPhone, //my phone number
        "contacts.phone":recivePhone, // recevier phone number
      },
      {
        $push:{
          "contacts.$.message":{
            type:"send",
            text:message,
          }
        }
      }
    )
   const check = await User.findOne({phone:recivePhone,"contacts.phone":sentPhone})
   if(!check)   /// incase in recevier dont save our contact create an contact details withour name insteded of using number
      await User.updateOne(
    {
       
      phone:recivePhone
    },{
      $push:{
        contacts:{
          name:sentPhone, // newly added
          phone:sentPhone,
          message:[]

        }
      }
    })
if(up){
     const revup = await User.updateOne(
      {
        phone:recivePhone,
        "contacts.phone":sentPhone,
      },
      {
        $push:{
          "contacts.$.message":{
            type:"recived",
            text:message,
          }
        }
      }
    )
    res.status(201).json({message:'messsage added sucessfully',up,revup})
  }
  }catch{
    console.log('message add erro')
    res.status(400).json({message:" Message adding server error "})
  }
  
  

}




/////////////// after login validate and sent data to front end \\\\\\\\\\\\\\\\
 const validate = async (req,res)=>{
  const id = req.params.id
  
  const decoded = jwt.decode(req.cookies.jwt)
    
  console.log("validate user id:",decoded)
  if(!id){
    console.log('noid')
    return(res.send("there is no id"))
  }
 console.log("id",id)
  const user = await User.findById(decoded.userId)
  try{
    if (user.profilePicture) {
     return res.json({
       user: {
         ...user.toObject(),
         profilePicture: {

           contentType: user.profilePicture.contentType,
           data: user.profilePicture.data.toString('base64')
         }

       }
     });

   }
  
   
   


  }
  catch{
     return res.json({message:'data without image',user})
   
  }

   




 }










////-----------------------------------------------------socket_io --------------------------------------------------------------------\\\\







const userSocketMap = {};

 const ioConnection = async (socket) => {
  const phone = socket.handshake.auth?.phone;
  if (!phone) {
    console.log("❌ Phone not provided");
    return;
  }
    socket.emit('online',{online:phone})                 // sending online status into frontend 
      await User.findOneAndUpdate({phone:phone},{
      $set:{isOnline:"true"},
    
      
     },{ new: true })
  
   
   
  userSocketMap[phone] = socket.id;
  console.log(`✅ Mapped ${phone} → ${socket.id}`);

  socket.on('send_message', async ({ toNumber, sendMessage }) => {
    const fromPhone = phone;

    try {
      await User.updateOne(
        { phone: fromPhone, "contacts.phone": toNumber },
        { $push: { "contacts.$.message": { type: "send", text: sendMessage } } }
      );

      const contactExists = await User.findOne({ phone: toNumber, "contacts.phone": fromPhone });

      if (!contactExists) {
        await User.updateOne(
          { phone: toNumber },
          {
            $push: {
              contacts: {
                name: fromPhone,
                phone: fromPhone,
                message: []
              }
            }
          }
        );
      }

      await User.updateOne(
        { phone: toNumber, "contacts.phone": fromPhone },
        { $push: { "contacts.$.message": { type: "recived", text: sendMessage } } }
      );

      const toSocket = userSocketMap[toNumber];
      if (toSocket) {
        socket.to(toSocket).emit('receive_message', { from: fromPhone, sendMessage });
      } else {
        console.log("❌ Target offline");
      }

    } catch (err) {
      console.error("❌ Message send/store error", err.message);
    }
  });

  socket.on('disconnect',async () => {
    socket.emit('offline',{offline:phone})
     await User.findOneAndUpdate({phone:phone},{
      $set:{isOnline:"false"},
      
     },{ new: true })
    for (let key in userSocketMap) {
      if (userSocketMap[key] === socket.id) {
        delete userSocketMap[key];
        console.log(`❌ Disconnected ${key}`);
         
    
  
   
   
        break;
      }
    }
  });
};


 const fetchMessage = async (req, res) => {
  const { myPhone, contactPhone } = req.body;

  try {
    if (!myPhone || !contactPhone) {
      return res.status(400).json({ message: "Both numbers required" });
    }

    const user = await User.findOne({ phone: myPhone });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const contact = user.contacts.find(c => c.phone === contactPhone);

    if (!contact) {
      return res.status(404).json({ message: "Contact not found", messages: [] });
    }

    res.status(200).json({ messages: contact.message });
  } catch (err) {
    console.error("❌ fetchMessage error:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};





///=================================================================addding contact to database


 const addContact = async (req, res) => {
  const {name,phone,myphone}=req.body
  try{
    if (!name || !phone || !myphone) {
    return res.status(401).json({ message: "All fields are required" });
    
    }
    if(phone.toString().length !== 10){
      return res.status(400).json({ message: "  Phone Number is not valid" });

    }

  const user = await User.findOne({phone:myphone});

    
    if (user) {
       user.contacts.filter((contact ) => { 
        if(contact.phone == phone)
        return res.status(401).json({ message: "Contact already exists" });
       }

       );
      
    
  }  

  user.contacts.push({
      name: name,
      phone: phone,
      message: []
    });

    await user.save();
    res.status(201).json({ message: "Contact added successfully" })







}catch{
    console.error(" addContact error:", err.message);
    res.status(500).json({ message: "Internal Server Error" })
  
}
}






 

module.exports = { signUp,logIn,logOut,contact,mess,validate,ioConnection,fetchMessage,addContact };
