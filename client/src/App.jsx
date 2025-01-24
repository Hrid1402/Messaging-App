import { useEffect, useState, useRef } from 'react'
import { socket, connectSocket } from './socket'
import Rodal from 'rodal';
import 'rodal/lib/rodal.css';
import './styles/App.css'
import { useNavigate } from 'react-router-dom'
import axios from 'axios';
import Cookies from 'js-cookie'
import AddFriend from './components/AddFriend.jsx'
import PendingRequests from './components/PendingRequests.jsx'
import MyFriends from './components/MyFriends.jsx'
import ChatsList from './components/ChatsList.jsx'
import noPicture from './assets/noPicturePfp.png'
import addFriend from './assets/addFriend.svg'
import friendsIcon from './assets/friendsIcon.svg'
import requestIcon from './assets/requestIcon.svg'
import { ToastContainer} from 'react-toastify'
import MainChat from './components/MainChat.jsx'
import UserProfile from './components/UserProfile.jsx'
import 'ldrs/infinity'

function App() {
  const [user, setUser] = useState(null);
  const [userProfileDialog, setUserProfileDialog] = useState(false);

  const [openDialog_fr, setOpenDialog_fr] = useState(false);
  const [openDialog_pr, setOpenDialog_pr] = useState(false);
  const [openDialog_mf, setOpenDialog_mf] = useState(false);

  const [newRequests, setNewRequests]  = useState(false);
  const [modifiedChats, setModifiedChats] = useState([]);
  const [myFriends, setMyFriends] = useState([]);
  const [chats, setChats] = useState([]);
  const [currentChatData, setCurrentChatData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [sideBarOpen, setSideBarOpen] = useState(true);

  const sideBarRef = useRef(null);

  const navigate = useNavigate();

  function toggleSideBar(){
    setSideBarOpen(!sideBarOpen);
  }

  function updateFriends(newFriendList){
    setMyFriends(newFriendList);
  }

  function updateChats(newChatsList){
    setChats(newChatsList);
  }

  function updateCurrentChatData(newCurrentChatData, allChats){
    setChats(allChats.map(chat=>
      chat.id === newCurrentChatData.id ? newCurrentChatData : chat));
  }

  function changeCurrentChat(newCurrentChatData, friend){
    setCurrentChatData({chat:newCurrentChatData, friend:friend});
  }
  function emptyCurrentChat(){
    setCurrentChatData(null);
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sideBarRef.current && sideBarRef.current.contains(event.target)) {
        toggleSideBar();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(()=>{
    const fetchUserData = async() => {
      try{
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/auth/user`, {
          headers: {
              Authorization: `Bearer ${Cookies.get("jwt")}`,
              "Content-Type": "application/json"
          }})
        const data = response.data;
        connectSocket(Cookies.get("jwt"));
        setUser(data)
        setMyFriends(data.friends);
        setChats(data.chats);
        setNewRequests(data.newRequests);
        setModifiedChats(data.modifiedChats);
        console.log(`Logged as ${data.username}`);
        console.log(data)
      }catch(error){
        console.log("Error fetching user data:",error)
      }finally{
        setLoading(false);
      }
    }
    fetchUserData(); 
  },[])
  return (
    <>
      <ToastContainer autoClose={5000} pauseOnHover={false} pauseOnFocusLoss={false}/>
      {
        loading ? 
        <l-infinity
        size="105"
        stroke="4"
        stroke-length="0.15"
        bg-opacity="0.1"
        speed="1.3"
        color="white" 
        ></l-infinity>
      :
        user ? 
        <>
         <Rodal visible={openDialog_fr} onClose={()=>setOpenDialog_fr(false)} customStyles={{maxWidth:'430px',width:'80vw', height:'60vh'}}>
            <AddFriend isOpen={openDialog_fr} user={user} socket={socket} updateFriends={updateFriends} friends={myFriends} updateChats={updateChats} emptyCurrentChat={emptyCurrentChat}/>
          </Rodal>

          <Rodal visible={openDialog_pr} onClose={()=>setOpenDialog_pr(false)} customStyles={{maxWidth:'430px',width:'80vw', height:'60vh'}}>
            <PendingRequests isOpen={openDialog_pr} user={user} socket={socket} updateFriends={updateFriends} updateChats={updateChats} setNewRequests={setNewRequests} newRequests={newRequests}/>
          </Rodal>

          <Rodal visible={openDialog_mf} onClose={()=>setOpenDialog_mf(false)} customStyles={{maxWidth:'430px',width:'80vw', height:'60vh'}}>
            <MyFriends isOpen={openDialog_mf} user={user} socket={socket} myFriends={myFriends}/>
          </Rodal>

          <Rodal visible={userProfileDialog} onClose={()=>setUserProfileDialog(false)} customStyles={{maxWidth:'430px',width:'80vw', height:'75vh'}}>
            <UserProfile user={user} logout={()=>{Cookies.remove("jwt"), navigate(0)}} isOpen={userProfileDialog}/>
          </Rodal>
          <main className='content' >
            <div ref={sideBarRef} className={`backgroundSideBar ${sideBarOpen ? '' : 'none'}`} ></div>
            <button className='sideBarButton' onClick={()=>toggleSideBar()}></button>
            <aside className={`sideBar ${sideBarOpen ? '' : 'closed'}`}>
              <button className='accountInf' onClick={()=>setUserProfileDialog(true)}>
                <div className='account'>
                  <img src={user.picture ?? noPicture} alt="profile picture" />
                  <h2>{user.username}</h2>
                </div>
              </button>
              <div className='friendsInf'>
                <button onClick={()=>setOpenDialog_fr(true)}><img src={addFriend}/> Add Friend</button>
                <button className={`${newRequests ? 'newChangeButton' : ''}`} onClick={()=>setOpenDialog_pr(true)}><img src={requestIcon}></img> Pending Requests</button>
                <button onClick={()=>setOpenDialog_mf(true)}><img src={friendsIcon}></img> My Friends</button>
                
              </div>
              <div>
                <h2>Chats</h2>
                <ChatsList chats={chats} user={user} changeCurrentChat={changeCurrentChat} currentChat={currentChatData ? currentChatData.chat : null} friends={myFriends} modifiedChats={modifiedChats} setModifiedChats={setModifiedChats}/>
              </div>
            </aside>
            <section>
              <MainChat chat={currentChatData ? currentChatData.chat : null} friend={currentChatData ? currentChatData.friend : null} user={user} socket={socket} updateCurrentChatData={updateCurrentChatData} chats={chats} modifiedChats={modifiedChats} setModifiedChats={setModifiedChats}/>
            </section>
          </main>
        </>: 
        <>
          <h1>Messaging app</h1>
          <button onClick={()=>navigate("/login")}>Login</button>
          <button onClick={()=>navigate("/register")}>Register</button>
        </>
      }
      
    </>
  )
}

export default App
