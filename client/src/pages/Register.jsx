import React, {useState} from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import 'ldrs/ring'

function Register() {
        const [username, setUsername] = useState("");
        const [password, setPassword] = useState("");
        const [message, setMessage] = useState("");
        const [loading, setLoading] = useState(false);
        const navigate = useNavigate();
  
      async function handleRegister(){
        try {
            setLoading(true);
            const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/auth/register`,
                {
                    username: username,
                    password: password
                }).catch(err=>{console.log(err.response.data), setMessage(err.response.data.message);});
            console.log("data", response.data);
            setMessage(response.data.message);
            navigate("/");
            
        } catch (error) {
            console.log("Error register account", error)
        }finally{
            setLoading(false);
        }
    }
    return (
      <>
          <div>
              <h1>Register</h1>
              {loading ? 
                <l-ring
                    size="100"
                    stroke="10"
                    bg-opacity="0"
                    speed="3"
                    color="black">
                </l-ring>: 
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
              }
              
          </div>
      </>
    )
}

export default Register