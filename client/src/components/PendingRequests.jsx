import React, {useEffect, useState} from 'react'
import noPicture from '../assets/noPicturePfp.png'
import FriendProfile from './FriendProfile.jsx';
import axios from 'axios'
import {toast} from 'react-toastify';
import '../styles/PendingRequests.css'
import Cookies from 'js-cookie'


function PendingRequests({isOpen, user, socket, updateFriends, updateChats, setNewRequests, newRequests}) {
  const [friendRequests, setFriendRequests] = useState(user.received);

  const [friendData, setFriendData] = useState(null);
  const [showFriendData, setShowFriendData] = useState(false);

  async function updateNewRequest(){
    await axios.put(`${import.meta.env.VITE_SERVER_URL}/auth/user`,{
      newRequests: false
    },{
      headers: {
          Authorization: `Bearer ${Cookies.get("jwt")}`,
          "Content-Type": "application/json"
      }});
  }

  useEffect(()=>{
    setShowFriendData(false);
    if(isOpen){
      if(newRequests){
        try{
          setNewRequests(false);
          updateNewRequest();
        }catch(error){
          console.log("Error updating new request", error);
        }
      }
      
    }
  }, [isOpen]);

  useEffect(()=>{

    const handleUpdateFriendRequests = (data) =>{
      toast(`${data.from} wants to be friends!`);
      setFriendRequests(data.received);
      setNewRequests(true);
    }
    socket.on('updateFriendRequests', handleUpdateFriendRequests);

    const handleUpdateAcceptedRequest = (data) =>{
      console.log(data);
      toast.success(`Request from ${data.from} accepted!.`);
      setFriendRequests(data.received);
      updateFriends(data.friends);
      updateChats(data.chats);
    }
    socket.on('updateAcceptedRequest', handleUpdateAcceptedRequest);

    const handleUpdateDeclinedRequest = (data) => {
      console.log(data);
      toast(`Request from ${data.from} declined.`);
      setFriendRequests(data.received);
    }
    socket.on('updateDeclinedRequest', handleUpdateDeclinedRequest);

    return () =>{
      socket.off('updateFriendRequests', handleUpdateFriendRequests);
      socket.off('updateAcceptedRequest', handleUpdateAcceptedRequest);
      socket.off('updateDeclinedRequest', handleUpdateDeclinedRequest);
    }

  },[socket])

  function acceptFriendRequest(friend){
    console.log("Accept", friend);
    socket.emit('acceptFriendRequest', { fromID : friend.fromID, toID: user.id, fromName: friend.fromName, toName: user.username});
  }

  function declineFriendRequest(friend){
    console.log("Declined", friend);
    socket.emit('declineFriendRequest', { fromID : friend.fromID, toID: user.id, fromName: friend.fromName, toName: user.username});
  }

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
      <h1>Pending Requests</h1>
      <div className='PR_container'>
      {friendRequests.length != 0 ? 
        friendRequests.map(f=>{
          return (
            <div key={f.id} className='pendingRequest'role="button" tabIndex={0} onClick={()=>{setShowFriendData(true), setFriendData({id: f.from.id, username: f.from.username, description: f.from.description, pfp: f.from.picture})}}>
              <div className="PR_User"> 
                <img src={f.from.picture ?? noPicture} />
                <h2>{f.fromName}</h2>
              </div>
              <div className='PR_btns'>
                <button onClick={(e)=>{e.stopPropagation(), acceptFriendRequest(f)}}>Accept</button>
                <button onClick={(e)=>{e.stopPropagation(), declineFriendRequest(f)}}>Decline</button>
              </div>
            </div>
          )
        }) : <h2>No pending requests at the moment.</h2> 
      }
      </div>
      
    </>
  )
}

export default PendingRequests