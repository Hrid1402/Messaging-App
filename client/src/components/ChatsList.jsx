import React from 'react'
import noPicture from '../assets/noPicturePfp.png'
import '../styles/ChatList.css'
import axios from 'axios';
import Cookies from 'js-cookie'

function ChatsList({chats, user, changeCurrentChat, currentChat, friends, modifiedChats, setModifiedChats}) {
    
  return (
    <div className='allChats'>
        {
            chats.map(c=>{
                const friend = c.participants.find(i=>i.id != user.id);
                if(friends.some(f => f.id === friend.id)){
                    const isSelected = currentChat && currentChat.id === c.id;
                    const modified = modifiedChats.includes(c.id);
                    async function updateChat(){
                        if(modified){
                            const newModifiedChats = modifiedChats.filter(e=>e.id === c.id);
                            setModifiedChats(newModifiedChats);
                            try{
                                await axios.put(`${import.meta.env.VITE_SERVER_URL}/auth/user`,{
                                    modifiedChats: newModifiedChats
                                  },{
                                    headers: {
                                        Authorization: `Bearer ${Cookies.get("jwt")}`,
                                        "Content-Type": "application/json"
                                    }});
                            }catch(error){
                                console.log("Error updating modified chats", error);
                            }
                        }
                    }

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