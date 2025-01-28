import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie'
import '../styles/Login.css'
import 'ldrs/ring'

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleLogin(){
        try{
            setLoading(true);
            const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/auth/login`,
                {
                    username: username,
                    password: password
                }).catch(err=>{console.log(err.response.data), setMessage(err.response.data.message);});
            console.log(response.data);
            setMessage(response.data.message);
            Cookies.set("jwt", response.data.accessToken);
            navigate("/");
        }catch(error){
            console.log("Error logging into the account", error)
        }finally{
            setLoading(false);
        }
        
    }
  return (
    <>
        <div className='loginContainer'>
            <div className='login'>
            <h1>Login</h1>
            
            {loading ? 
            <div style={{height:'70%', display: 'flex', justifyContent: 'center', alignItems:'center'}}>
                 <l-ring
                size="100"
                stroke="10"
                bg-opacity="0"
                speed="3"
                color="black">
                </l-ring>
            </div>
            : 
            <>
                <h2>
                New here? <Link to='/register'>Create an account</Link>
                </h2>
                <div className='LoginBlock'>
                    <div className='LoginInputBlock'>
                        <h2>Username</h2>
                        <input type="text" value={username} onChange={(e)=>setUsername(e.target.value)}/>
                    </div>
                    <div className='LoginInputBlock'>
                        <h2>Password</h2>
                        <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)}/>
                    </div>
                    <button type='button' onClick={()=>handleLogin()}>Login</button>
                    <h3>{message}</h3>
                </div>
            </>
            }
            </div>
        </div>
    </>
  )
}

export default Login