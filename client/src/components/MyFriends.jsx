import React, { useEffect, useState } from 'react'
import noPicture from '../assets/noPicturePfp.png'
import returnIcon from '../assets/return.png'
import FriendProfile from './FriendProfile.jsx';
import X_ICON from '../assets/x_icon.svg'
import '../styles/myFriends.css'

function MyFriends({isOpen, myFriends, socket, user}) {

    const [friendData, setFriendData] = useState(null);
    const [showFriendData, setShowFriendData] = useState(false);
    const [friendName, setFriendName] = useState("");

    useEffect(()=>{
      setFriendName("");
      setShowFriendData(false);
    }, [isOpen]);

    if(showFriendData){
        return(
          <>
            <button className='returnFriendBTN' onClick={()=>setShowFriendData(false)}><img src={returnIcon} alt='Return'></img></button>
            <FriendProfile id={friendData.id} username={friendData.username} pfp={friendData.pfp} description={friendData.description} socket={socket} myID={user.id} myUsername={user.username}></FriendProfile>
            
          </>
        )
      }
    
  return (
    <>
        <h1>My friends</h1>
        <div className='chatNameInputFriends'>
          <input type="text" placeholder='Search' value={friendName} onChange={e=>setFriendName(e.target.value)}/>
          <button className={`clearButtonFriends ${!friendName ? 'hidden' : ''}`} onClick={()=>setFriendName("")}><img src={X_ICON} alt="clean" /></button>
        </div>
        <div className='friendsContainer'>
            {
            myFriends.length == 0 ? <h3>No friends yet. Go find some!</h3> : 
            
            myFriends.map(f=>{
                if(!f.username.toLowerCase().startsWith(friendName.toLowerCase()) && friendName){
                  return
                }
                return (
                <button key={f.id} className='friendBlock' onClick={()=>{setShowFriendData(true), setFriendData({id: f.id, username: f.username, description: f.description, pfp: f.picture})}}>
                    <div className="PR_User">
                        <img src={f.picture ?? noPicture} />
                        <h2>{f.username}</h2>
                    </div>
                </button>
                )
            })
        }
        </div>
        
    </>
  )
}

export default MyFriends