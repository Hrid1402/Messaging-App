import { useEffect, useState } from 'react'
import './styles/App.css'
import { useNavigate } from 'react-router-dom'
import axios from 'axios';
import Cookies from 'js-cookie'

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(()=>{
    axios.get("http://localhost:3000/auth/user", {
      headers: {
          Authorization: `Bearer ${Cookies.get("jwt")}`,
          "Content-Type": "application/json"
      }}).then(r=>{setUser(r.data), console.log(r.data)}).catch(err=>{console.log(err.response.data)});
    console.log("user");
    console.log(user);
  },[])
  return (
    <>
      <h1>Messaging app</h1>
      {
        user ? 
        <>
          <h2>Welcome back {user.username}!</h2>
          <button onClick={()=>{Cookies.remove("jwt"), navigate(0)}}>Log out</button>
        </>: 
        <>
          <button onClick={()=>navigate("/login")}>Login</button>
          <button onClick={()=>navigate("/register")}>Register</button>
        </>
      }
      
    </>
  )
}

export default App
