import {  useEffect, useState } from 'react';
import {useNavigate } from 'react-router-dom';
import axios from 'axios';



const PrivateRoute = ({ children }) => {

  const [user, setUser] = useState(null);

  const navigate = useNavigate();
const backendUrl = import.meta.env.VITE_BACKEND_URL 
 
  useEffect(() => {
    axios.get(`${backendUrl}/validate/123`, {
      withCredentials: true
    })
 .then((res) => {
      setUser(res.data.user); 
      

     
      // Save user from JWT
    })

   
    .catch(() => {
      axios.post(`${backendUrl}/logout`, {}, { withCredentials: true });
      navigate("/");
    });
  },[]);

  if (user === null) return <h2>Loading...</h2>;


  if (!user) return <div>Loading...</div>;

  //  Pass user as prop to the page 
  return children && typeof children === 'function' ? children(user) : children;
};


export default PrivateRoute