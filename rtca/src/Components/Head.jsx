
import { useState } from 'react';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import axios from 'axios';
import { IoMdPersonAdd } from "react-icons/io";
import Addcontact from './Addcontact';
import profile from '../assets/profile.webp'




const Head = ({ user }) => {


    const [profilePicture, setProfilePicture] = useState(false);
    const [image, setImage] = useState(null);
    const [prevImage, setPrevImage] = useState(null);
    const [add,setAdd] = useState(false);


    const backendUrl = import.meta.env.VITE_BACKEND_URL;


    const handleProfileUpload = async (e) => {
        const file = e.target.files[0];
        setImage(file);
        setPrevImage(URL.createObjectURL(file));

        if (file) {
            const phone = user.phone;
            const formData = new FormData();
            formData.append('image', file);
            formData.append('phone', phone);
            setTimeout(()=>{
                        setProfilePicture(!profilePicture)
                    },2000)


            await axios.post(`${backendUrl}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
                .then((response) => {
                    console.log('Image uploaded successfully:', response.data);
                    
                    
                })
                .catch((error) => { console.error('Error uploading image:', error); });

        }
    }





    return (
        <div >
           
            <div className='  flex justify-between items-center bg-blue-700  p-2 py-3  md:px-5   text-white px-5'>
                <h1 className='font-engagement text-3xl md:text-4xl font-semibold tracking-wider md:p-1'>Chat-Lynk</h1>





             {user && <div className='flex  items-center gap-5 md:gap-5'>




                    <IoMdPersonAdd type='btn' onClick={() => setAdd(!add)} className="w-6 h-6 cursor-pointer md:hidden self-end" />
                    <img onClick={() => setProfilePicture(!profilePicture)}


                        src={prevImage ? prevImage :
                            user?.profilePicture?.data
                                ? `data:${user.profilePicture.contentType};base64,${user.profilePicture.data}`
                                : profile // <-- replace with your fallback image path
                        }
                        alt={profile}
                        className="w-8 h-8 md:w-12 md:h-12 md:mx-5 shadow-2xl shadow-amber-600 rounded-full object-cover "
                        style={{ backgroundPosition: 'center', backgroundSize: 'cover' }}
                    />

                </div>}


            </div>
            {/* Contact creator */}
            {
                add && <Addcontact id='add' user={user} setAdd={setAdd} add={add} />
            }






















            {profilePicture && <div className=' fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-120%] bg-white  rounded-full shadow-lg z-20 realative' >
                <img onClick={() => setProfilePicture(!profilePicture)}
                    src={prevImage ? prevImage :
                        user?.profilePicture?.data
                            ? `data:${user.profilePicture.contentType};base64,${user.profilePicture.data}`
                            : '/default-avatar.png' // <-- replace with your fallback image path
                    }
                    alt="Profile"
                    className="w-50 h-50 rounded-full object-cover"

                />
                <label htmlFor="in">

                    <i> <ModeEditIcon className="absolute z-21 top-[80%] left-[50%]  translate-x-[30%] rounded-full p-3  bg-white" sx={{ fontSize: 50 }} /> </i>
                </label>
                <input type="file" id='in' className='hidden'
                    accept="image/*"
                    onChange={(e)=>handleProfileUpload(e)} />







            </div>}

        </div>
    )
}
export default Head;