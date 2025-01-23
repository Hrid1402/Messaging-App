import React, { useEffect, useState } from 'react'
import noPicture from '../assets/noPicturePfp.png'
import FriendProfile from './FriendProfile.jsx';
import '../styles/myFriends.css'

function MyFriends({isOpen, myFriends}) {

    const [friendData, setFriendData] = useState(null);
    const [showFriendData, setShowFriendData] = useState(false);

    useEffect(()=>{
          setShowFriendData(false);
    }, [isOpen]);

    if(showFriendData){
        return(
          <>
            <FriendProfile id={friendData.id} username={friendData.username} pfp={friendData.pfp} description={friendData.description} simple={true}></FriendProfile>
            <button onClick={()=>setShowFriendData(false)}>Return</button>
          </>
        )
      }
    
  return (
    <>
        <h1>My friends</h1>
        <div className='friendsContainer'>
            {
            myFriends.length == 0 ? <h3>No friends yet. Go find some!</h3> : 
            
            myFriends.map(f=>{
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