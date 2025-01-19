import React from 'react'
import noPicture from '../assets/noPicturePfp.png'
import '../styles/ChatList.css'

function ChatsList({chats, user, changeCurrentChat, currentChat, friends}) {
    
  return (
    <div className='allChats'>
        {
            chats.map(c=>{
               
                const friend = c.participants.find(i=>i.id != user.id);
                if(friends.some(f => f.id === friend.id)){
                    const isSelected = currentChat && currentChat.id === c.id;
                    return(
                        <button key={c.id} className={`chatListBTN chatModification ${isSelected ? 'chatListBTN_ACTIVE' : ''}`} onClick={()=>changeCurrentChat(c, friend)} disabled={isSelected}>
                            <img src={friend.picture ?? noPicture} />
                            <h1>{friend.username}</h1>
                        </button>
                    )
                }
                
                
            })
        }
    
    </div>
  )
}

export default ChatsList