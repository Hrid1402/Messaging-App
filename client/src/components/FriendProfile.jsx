import React from 'react'
import noPicture from '../assets/noPicturePfp.png'
import '../styles/FriendProfile.css'


function FriendProfile({simple=false, id, username, description ,pfp, socket, myID, myUsername}) {

  function removeFriend(){
    console.log("Removing " + username);
    socket.emit('removeFriend', { fromID : myID, toID: id, fromName: myUsername, toName: username});
  }
  return (
    <div className='friendProfileContainer'>
        <img src={pfp ?? noPicture} />
        <h1>{username}</h1>
        {description && <h2>{description}</h2>}
        {!simple && <button onClick={()=>removeFriend()}>Remove friend</button>}
    </div>
  )
}

export default FriendProfile