import React from 'react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import userImg from '../assets/user.webp'

const chatwindow = ({ selectedContact, inonline ,handleChatExit}) => {

  return (
    <div className="h-20 fixed top-0 md:top-17  w-full bg-gray-100 border-b border-gray-300 px-4  flex items-center gap-3">
     
      {selectedContact && (
        
        <img
          src={selectedContact?.profilePicture?.data
            ? `data:${selectedContact.profilePicture.contentType};base64,${selectedContact.profilePicture.data}`
            : userImg // <-- replace with your fallback image path
          }
          alt="Profile"
          className="w-14 h-14 rounded-full object-cover"

        />
      )}
      <div className='mt-2'>
        <h1 className="text-xl font-semibold font-roboto text-gray-900">
          {selectedContact ? selectedContact.name : 'Select a contact'}

  
        </h1>
     
        
        {selectedContact &&
          <p className='font-roboto-slab text-[12px] tracking-wide font-medium'>
            {selectedContact?.phone === inonline?.phone ? 'Online' : 'Offline'}
          </p>}



      </div>
      <button onClick={handleChatExit} className=' md:hidden absolute right-[5%]  p-2 '><ArrowBackIcon   sx={{ fontSize: 30}} className=' rotate-180 '/>
      </button>
      


    </div>
  )
}
export default chatwindow