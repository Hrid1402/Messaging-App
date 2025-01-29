import React, {useState} from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Register.css'
import 'ldrs/ring'

function Register() {
        const [username, setUsername] = useState("");
        const [password, setPassword] = useState("");
        const [confirmPassword, setConfirmPassword] = useState("");
        const [message, setMessage] = useState("");
        const [loading, setLoading] = useState(false);
        const [showPassword, setShowPassword] = useState(false);
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
          <div className='registerContainer'>
              <div className='register'>
              <h1>Register</h1>
              {loading ? 
                <div style={{height:'70%', display: 'flex', justifyContent: 'center', alignItems:'center'}}>
                <l-ring
               size="100"
               stroke="10"
               bg-opacity="0"
               speed="3"
               color="black">
               </l-ring>
                </div>: 
                <>
                    <h2>
                    Already have an account? <Link to='/login'>Log in</Link>
                    </h2>
                    <div className='RegisterBlock'>
                        <h3 className='errorMessage'>{message}</h3>
                        <div className='RegisterInputBlock'>
                            <h2>Username</h2>
                            <input maxLength={15} required type="text" value={username} onChange={(e)=>setUsername(e.target.value)}/>
                        </div>
                        <div className='RegisterInputBlock'>
                            <h2>Password</h2>
                            <input minLength={8} pattern={confirmPassword ?  confirmPassword : undefined} required type={showPassword ? "text" : "password"} value={password} onChange={(e)=>setPassword(e.target.value)}/>
                            
                        </div>
                        <div className='RegisterInputBlock'>
                            <h2>Confirm password</h2>
                            <input minLength={8} maxLength={64} pattern={password} required type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)}/>
                        </div>
                        <div className='showPasswordContainer'>
                            <input type="checkbox" onChange={()=>setShowPassword(prev=>!prev)}/>
                            <h2>Show password</h2>
                        </div>
                        <button type='button' onClick={()=>handleRegister()} disabled={!(password===confirmPassword && password.length >= 8 && 1<=username<=15)}>Register</button>
                    </div>
                </>
              }
              </div>
          </div>
      </>
    )
}

export default Register