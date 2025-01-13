import React, { useEffect, useState, useRef } from 'react'
import noPicture from '../assets/noPicturePfp.png'
import '../styles/MainChat.css'

function MainChat({chat, friend, user, socket, updateCurrentChatData, chats}) {
    const containerRef = useRef(null);
    const [message, setMessage]  = useState("")
    const currentChat = chats.find(c => c.id === chat.id);
    useEffect(()=>{
        socket.on('receivedMessage', (data) => {
            console.log("socket received", data);
            updateCurrentChatData(data);
        });
    }, [chat, socket, chats]);


    function sendMessage(newMessage){
        socket.emit('sendMessage', {chatID: chat.id, content: newMessage, authorID:user.id, toID: friend.id});
        setMessage("");
    }

  return (
    <div className='MainChatContainer'>
        <header className='headerFriendData'>
            <button className='friendUserDataBTN'>
                <img src={friend.picture ?? noPicture} />
                <h1>{friend.username}</h1>
            </button>
        </header>
        <main className='allMessagesContainer' ref={containerRef}>
            {
                currentChat.messages.map(m=>{
                    return <Message messageData={m} key={m.id} friend={friend}/>
                })
            }

        </main>
        <footer className='InputArea'>
            <textarea value={message} onChange={e=>setMessage(e.target.value)}></textarea>
            <button onClick={()=>sendMessage(message)}>Send</button>
        </footer>
    </div>
  )
}

function Message({messageData:{content, createdAt, authorID}, friend}) {
    const myMessage = authorID != friend.id;
    return (
        <div className={`message ${myMessage ? 'messageSendedByMe' : ''}`}>
            <h2>{content}</h2>
        </div>
    )
  }



export default MainChat