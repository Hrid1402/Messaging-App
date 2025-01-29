import React, { useState } from 'react'
import noPicture from '../assets/noPicturePfp.png'
import X_ICON from '../assets/x_icon.svg'
import '../styles/ChatList.css'

function ChatsList({chats, user, changeCurrentChat, currentChat, friends, modifiedChats}) {
    
    const [chatName, setChatName] = useState("");

  return (
    <div className='allChats'>
        {
        friends.length == 0 ?
            null
        :
        <>
            <h2 className='chatsTitle'>Chats</h2>
            <div className='chatNameInput'>
                <input type="text" placeholder='Search' value={chatName} onChange={e=>setChatName(e.target.value)}/>
                <button className={`clearButton ${!chatName ? 'hidden' : ''}`} onClick={()=>setChatName("")}><img src={X_ICON} alt="clean" /></button>
            </div>
        </>
        }
        
        {
            chats.map(c=>{
                const friend = c.participants.find(i=>i.id != user.id);
                if(friends.some(f => f.id === friend.id)){
                    if(!friend.username.toLowerCase().startsWith(chatName.toLowerCase()) && chatName){
                        return
                    }
                    const isSelected = currentChat && currentChat.id === c.id;
                    const modified = modifiedChats.includes(c.id);
                    return(
                        <button key={c.id} className={`chatListBTN ${modified ? 'chatModification' : ''} ${isSelected ? 'chatListBTN_ACTIVE' : ''}`} onClick={()=>changeCurrentChat(c, friend)} disabled={isSelected}>
                            <img src={friend.picture ?? noPicture} />
                            <h1 className='btnUsername'>{friend.username}</h1>
                        </button>
                    )
                }
                
                
            })
        }
    
    </div>
    
  )
}

export default ChatsList