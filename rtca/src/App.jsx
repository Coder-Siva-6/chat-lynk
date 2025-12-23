
import Signin from './Components/Signin'
import Login from './Components/Login'
import Data from './Components/Data'
import PrivateRoute from './Components/auth.log.controller'
import { BrowserRouter,Routes,Route} from 'react-router-dom'

import './App.css'


function App() {
  

  return (
     <BrowserRouter>
     <Routes>
      <Route path='/signin' element={<Signin/>}></Route>
       <Route path='/' element={<Login/>}></Route>
       <Route path='/data' element={<PrivateRoute >{(user) => <Data user={user}  />}</PrivateRoute>} ></Route>
    
     </Routes>
      </BrowserRouter>  
  
  )
}

export default App
