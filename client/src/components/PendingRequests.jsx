import React, {useEffect, useState} from 'react'
import noPicture from '../assets/noPicturePfp.png'
import {toast} from 'react-toastify';
import '../styles/PendingRequests.css'


function PendingRequests({user, socket, updateFriends, updateChats}) {
  const [friendRequests, setFriendRequests] = useState(user.received);

  useEffect(()=>{
    socket.on('updateFriendRequests', (data) => {
      toast(`${data.from} wants to be friends!`);
      setFriendRequests(data.received);
    });

    socket.on('updateAcceptedRequest', (data) => {
      console.log(data);
      toast.success(`Request from ${data.from} accepted!.`);
      setFriendRequests(data.received);
      updateFriends(data.friends);
      updateChats(data.chats);
    });

    socket.on('updateDeclinedRequest', (data) => {
      console.log(data);
      toast(`Request from ${data.from} declined.`);
      setFriendRequests(data.received);
    });

  },[socket])

  function acceptFriendRequest(friend){
    console.log("Accept", friend);
    socket.emit('acceptFriendRequest', { fromID : friend.fromID, toID: user.id, fromName: friend.fromName, toName: user.username});
  }

  function declineFriendRequest(friend){
    console.log("Declined", friend);
    socket.emit('declineFriendRequest', { fromID : friend.fromID, toID: user.id, fromName: friend.fromName, toName: user.username});
  }

  return (
    <>
      <h1>Pending Requests</h1>
      <div className='PR_container'>
      {friendRequests.length != 0 ? 
        friendRequests.map(r=>{
          return (
            <div key={r.id} className='pendingRequest'>
              <div className="PR_User">
                <img src={r.picture ?? noPicture} />
                <h2>{r.fromName}</h2>
              </div>
              <div className='PR_btns'>
                <button onClick={()=>acceptFriendRequest(r)}>Accept</button>
                <button onClick={()=>declineFriendRequest(r)}>Decline</button>
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