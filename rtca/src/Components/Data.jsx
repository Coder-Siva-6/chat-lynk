
import  { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

import { IoMdPersonAdd } from "react-icons/io";
import Addcontact from './Addcontact';

import Head from './Head';
import Chats from './chats';
import ChatsInput from './chatinput'
import ContactList from './contacctlist'
import ChatWindow from './chatwindow'
import { FaBuildingCircleCheck } from 'react-icons/fa6';







const Data = ({user}) => {
  const [contacts, setContacts] = useState(user.contacts);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sendMessage, setSendMessage] = useState('');
 const [add,setAdd]=useState(false)
  const [emoji, setEmoji] = useState(false);
  const socketRef = useRef();
  const bottomRef = useRef(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const[recived,setRecived] = useState(false)
  const [inonline,setOnline] = useState(
    {phone:'',
    online:false,  })




 

  console.log(user.profilePicture )

    




  useEffect(() => {
    socketRef.current = io(`${backendUrl}`, {
      auth: { phone: user.phone },
      withCredentials: true,   
    });
                               /////////////////// socket online text
    socketRef.current.on('online',(user)=>{
      const {online} = user                         /////////////////// socket online text
      if(online){
        setOnline({
          phone:online,
          online:true,
          
        })
                     
      }else{
      console.log("offline")}           /////////////////// socket online text
    })
    
    socketRef.current.on('receive_message', (data) => {
      const { from, sendMessage } = data;
      
      if (selectedContact && from === selectedContact.phone) {
        setMessages((prev) => [...prev, { text: sendMessage, type: 'recived' }]);
       
      }
    });

  

    return () => {
      socketRef.current.disconnect();
     
        setOnline({
          phone:'',
          online:false,
        }
          
       )
      
      console.log('offline socket off ')                /////////////////// socket online text
     
    };
  }, [user.phone, selectedContact]);



  const handleContactClick = async (contact) => {
    setSelectedContact(contact);
    try {
      const res = await axios.post(`${backendUrl}/fetch-messages`, {
        myPhone: user.phone,
        contactPhone: contact.phone,
      }, {
        withCredentials: true
      });
      setMessages(res.data.messages);
      setRecived(!recived);
      if (window.innerWidth < 768) {
        document.querySelector('#chat-window').classList.remove('hidden');
        document.querySelector('#contact-list').classList.add('hidden');

      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };
  function handleChatExit() {
    document.querySelector('#chat-window').classList.add('hidden');
    document.querySelector('#contact-list').classList.remove('hidden');

  }





  const sendMessageToServer = () => {
    if (sendMessage.trim() === '' || !selectedContact) return;
    const data = { toNumber: selectedContact.phone, sendMessage };
    socketRef.current.emit('send_message', data);
    setMessages((prev) => [...prev, { text: sendMessage, type: 'send' }]);
    setSendMessage('');

  };





  return (



    
    <div className="h-screen w-full flex flex-col ">
      {/* Header Component */}
      <Head  user = {user}/>


      <div className="h-screen w-full flex md:fixed md:top-17 ">

      {/* Sidebar  left*/}
      <div id='contact-list' className=" w-full md:w-2/8 bg-white border-r border-gray-300 flex flex-col">

           <div className=' hidden  md:block bg-gray-200  '>
           <div className="   p-4 md:border-b md:border-gray-200 flex items-center justify-between mx-5 ">
            <h2 className=" text-md md:text-xl font-bold text-gray-800 font-roboto-slab">Contacts</h2>
            <div className='flex gap-2  '>
            <IoMdPersonAdd type='btn' onClick={() => setAdd(!add)} className="w-5 h-5 md:w-8 md:h-8 cursor-pointer" />
            </div >
            </div>

        </div>

        {/*......................................Contact adder Model .......................... */}
        {
          add && <Addcontact id='add'  user={user} setAdd={setAdd}  add={add}  /> //Component 
        }
                        {/* ------ Contact list--------- */}
        <ContactList inonline={inonline}  contacts={contacts} handleContactClick={handleContactClick} selectedContact={selectedContact} user={user} add={add}/>
                  
      </div>

      {/*------------------------------- --------Chat Window------------------------------------ */}
            <div id='chat-window' className="  relative hidden md:block w-full  flex flex-col overflow-y-auto   ">
        {/* chat window Header */}
         <ChatWindow handleChatExit={handleChatExit} inonline={inonline} selectedContact={selectedContact} user={user} />  
        {/*------------------------------------------ Messages------------------------------------*/}
        <Chats  messages={messages}  /> 
        {/* Input Box */}
        <ChatsInput setEmoji={setEmoji} selectedContact={selectedContact} sendMessage={sendMessage} setSendMessage={setSendMessage} sendMessageToServer={sendMessageToServer} emoji={emoji}/>
      </div>
    </div>
    </div>
  );
};

export default Data;