import React, {useState} from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';

function Register() {
        const [username, setUsername] = useState("");
        const [password, setPassword] = useState("");
        const [message, setMessage] = useState("");
        const navigate = useNavigate();
  
      async function handleRegister(){
        console.log(username);
        console.log(password);
        const response = await axios.post("http://localhost:3000/auth/register",
            {
                username: username,
                password: password
            }).catch(err=>{console.log(err.response.data), setMessage(err.response.data.message);});
        if(!response) return;
        console.log("data", response.data);
        setMessage(response.data.message);
        navigate("/");
    }
    return (
      <>
          <div>
              <h1>Register</h1>
              <div>
                  <div>
                      <h2>Username</h2>
                      <input type="text" value={username} onChange={(e)=>setUsername(e.target.value)}/>
                  </div>
                  <div>
                      <h2>Password</h2>
                      <input type="text" value={password} onChange={(e)=>setPassword(e.target.value)}/>
                  </div>
                  <button type='button' onClick={()=>handleRegister()}>Register</button>
                  <h3>{message}</h3>
              </div>
          </div>
      </>
    )
}

export default Register