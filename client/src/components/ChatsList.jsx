import React from 'react'
import noPicture from '../assets/noPicturePfp.png'
import '../styles/ChatList.css'

function ChatsList({chats, user, changeCurrentChat}) {
  return (
    <div className='allChats'>
        {
            chats.map(c=>{
                const friend = c.participants.find(i=>i.id != user.id);
                return(
                    <button key={c.id} className='chatListBTN' onClick={()=>changeCurrentChat(c, friend)}>
                        <img src={friend.picture ?? noPicture} />
                        <h1>{friend.username}</h1>
                    </button>
                )
            })
        }
    
    </div>
  )
}

export default ChatsList