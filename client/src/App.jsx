import { useEffect, useState, useRef } from 'react'
import { socket } from './socket'
import Rodal from 'rodal';
import 'rodal/lib/rodal.css';
import './styles/App.css'
import { useNavigate } from 'react-router-dom'
import axios from 'axios';
import Cookies from 'js-cookie'
import AddFriend from './components/AddFriend.jsx'
import PendingRequests from './components/PendingRequests.jsx'
import MyFriends from './components/MyFriends.jsx'
import noPicture from './assets/noPicturePfp.png'
import { ToastContainer} from 'react-toastify';

function App() {
  const [user, setUser] = useState(null);
  const [openDialog_fr, setOpenDialog_fr] = useState(false);
  const [openDialog_pr, setOpenDialog_pr] = useState(false);
  const [openDialog_mf, setOpenDialog_mf] = useState(false);
  const [myFriends, setMyFriends] = useState([]);
  const navigate = useNavigate();

  function updateFriends(newFriendList){
    setMyFriends(newFriendList);
  }

  useEffect(()=>{
    axios.get(`${import.meta.env.VITE_SERVER_URL}/auth/user`, {
      headers: {
          Authorization: `Bearer ${Cookies.get("jwt")}`,
          "Content-Type": "application/json"
      }}).then(r=>{
        setUser(r.data)
        setMyFriends(r.data.friends);
        console.log(`Logged as ${r.data.username}`);
        console.log(r.data)
        socket.connect();
      }).catch(err=>{console.log(err.response.data)});
  },[])
  return (
    <>
      <ToastContainer autoClose={5000}/>
      <h1>Messaging app</h1>
      {
        user ? 
        <>
         <Rodal visible={openDialog_fr} onClose={()=>setOpenDialog_fr(false)} height={600} width={430}>
            <AddFriend user={user} socket={socket} updateFriends={updateFriends} friends={myFriends}/>
          </Rodal>

          <Rodal visible={openDialog_pr} onClose={()=>setOpenDialog_pr(false)} height={600} width={430}>
            <PendingRequests user={user} socket={socket} updateFriends={updateFriends}/>
          </Rodal>

          <Rodal visible={openDialog_mf} onClose={()=>setOpenDialog_mf(false)} height={600} width={430}>
            <MyFriends user={user} socket={socket} myFriends={myFriends}/>
          </Rodal>
          <main className='content'>
            <aside>
              <div className='accountInf'>
                <div className='account'>
                  <img src={user.picture ?? noPicture} alt="profile picture" />
                  <h2>{user.username}</h2>
                </div>
                <button onClick={()=>{Cookies.remove("jwt"), navigate(0)}}>Log out</button>
              </div>
              <div className='friendsInf'>
                <h2>Friends</h2>
                <button onClick={()=>setOpenDialog_mf(true)}>My Friends</button>
                <button onClick={()=>setOpenDialog_fr(true)}>Add Friend</button>
                <button onClick={()=>setOpenDialog_pr(true)}>Pending Requests</button>
              </div>
              <div>
                <h2>Messages</h2>
              </div>
            </aside>
            <section></section>
          </main>
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
