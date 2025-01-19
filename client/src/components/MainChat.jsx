import React, { useEffect, useState, useRef } from 'react'
import dotsIcon from '../assets/dots.svg'
import noPicture from '../assets/noPicturePfp.png'
import {toast} from 'react-toastify';
import FriendProfile from './FriendProfile.jsx';
import MessageInf from './MessageInf.jsx'
import GifSearcher from './GifSearcher.jsx'
import '../styles/MainChat.css'
import Rodal from 'rodal';
import axios from 'axios';
import 'rodal/lib/rodal.css';


function MainChat({chat, friend, user, socket, updateCurrentChatData, chats}) {

    const [friendDialogOpen, setFriendDialogOpen] = useState(false);
    const [messageInfDialogOpen, setMessageInfDialogOpen] = useState(false);
    const [messageInfData, setMessageInfData] = useState(null);
    const containerRef = useRef(null);
    const inputImageRef = useRef(null);
    const [curImage, setCurImage] = useState(null);
    const [showImageDialog, setShowImageDialog] = useState({state: false, img: null});
    const [showGifModal, setShowGifModal] = useState(false);
    const [message, setMessage]  = useState("")
    const currentChat = chat ? chats.find(c => c.id === chat.id) : null;
    useEffect(()=>{
        socket.on('receivedMessage', (data) => {
            console.log("socket received", data);
            updateCurrentChatData(data.chat, data.chats);
        });
        if(chat!=null){
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [socket, chat, chats]);

    useEffect(()=>{
        socket.on('messageNotification', (data) => {
            console.log("message received", data);
            toast.info(
                <div>
                    <h4 style={{ margin: '0', fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                    {data.username}
                    </h4>
                    <p style={{ margin: '5px 0 0', fontSize: '16px', color: '#555' }}>
                    {data.content.length > length ? data.content.substring(0, 50) + "..." : data.byMe}
                    </p>
                </div>,
                { icon: false }
                );
        });
    }, [socket])

    useEffect(()=>{
        if(chat!=null){
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    },[]);

    if(chat==null){
        return(
            <div>
                <h2>Welcome to the messaging app!</h2>
            </div>
        )
    }
    function showMessageInf(value){
        setMessageInfDialogOpen(value);
    }

    function addMessageInfData(value){
        setMessageInfData(value)
    }

    async function sendMessage(newMessage, isImage, isGif){
        console.log(newMessage);
        if(newMessage.trim("") == ""){
            return
        }
        if(isImage){
            console.log("Image");
            let pictureURL = "";
            if(!isGif){
                const response = await fetch(newMessage);
                const blob = await response.blob();
                
                const formData = new FormData();
                formData.append("image", blob);
                const picture = await axios.post(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API}`,formData);
                pictureURL = picture.data.data.url;
            }else{
                pictureURL = newMessage;
            }
            socket.emit('sendMessage', {chatID: chat.id, content: pictureURL, authorID:user.id, toID: friend.id, username: user.username, isImage: true});
            setMessage("");
            setCurImage(null);
        }else{
            socket.emit('sendMessage', {chatID: chat.id, content: newMessage, authorID:user.id, toID: friend.id, username: user.username, isImage: false});
            setMessage("");
            setCurImage(null);
        }
        
    }

    function handleImage(event){
        const file = event.target.files[0];
        if (file) {
            const fileName = file.name;
            const fileSize = file.size;
            const fileType = file.type;
            const validImageTypes = ['image/png', 'image/jpeg', 'image/gif'];

        if (!validImageTypes.includes(fileType)) {
            alert(`Error: The file "${fileName}" is not a valid image (PNG, JPG, GIF).`);
            return;
        }
        const maxSizeInBytes = 32 * 1024 * 1024;
        if (fileSize > maxSizeInBytes) {
            alert(`Error: The file "${fileName}" is too large. Max size is 32 MB.`);
            return;
        }
        console.log(`Selected file: ${fileName}\nSize: ${fileSize} bytes\nType: ${fileType}`);
        setCurImage(URL.createObjectURL(file));
    }
    }

  return (
    <>
        <Rodal visible={friendDialogOpen} onClose={()=>setFriendDialogOpen(false)} height={600} width={530}>
            <FriendProfile id={friend.id} username={friend.username} description={friend.description} pfp={friend.picture} socket={socket} myID={user.id} myUsername={user.username}/>
        </Rodal>

        <Rodal visible={messageInfDialogOpen} onClose={()=>setMessageInfDialogOpen(false)} height={600} width={530}>
            {messageInfData? <MessageInf id={messageInfData.id} content={messageInfData.content} date={messageInfData.date} fromMe={messageInfData.fromMe} image={messageInfData.image} socket={socket} user={user} chatID={currentChat.id} toID={friend.id} showMessageInf={showMessageInf}/> : null}
        </Rodal>

        <Rodal visible={showImageDialog.state} onClose={()=>setShowImageDialog({state:false, img: null})} customStyles={{ height: 'fit-content', width: 'fit-content', maxHeight: '80vh', maxWidth: '80vw', backgroundColor:'rgba(0, 0, 0, 0.53)', overflowY: 'hidden'}}>
            <img src={showImageDialog.img} alt="photo" style={{height:'100%', width:'100%', objectFit:'contain'}}/>
        </Rodal>

        <Rodal visible={showGifModal} onClose={()=>setShowGifModal(false) } customStyles={{ height: '60vh', width: '50vw',}} >
            <GifSearcher isOpen={showGifModal} sendMessage={sendMessage} closeModal={()=>setShowGifModal(false)}/>
        </Rodal>


        <div className='MainChatContainer'>
            <header className='headerFriendData'>
                <button className='friendUserDataBTN' onClick={()=>setFriendDialogOpen(true)}>
                    <img src={friend.picture ?? noPicture} />
                    <h1>{friend.username}</h1>
                </button>
            </header>
            <main className='allMessagesContainer' ref={containerRef}>
                {
                    currentChat.messages.map(m=>{
                        return <Message messageData={m} key={m.id} friend={friend} showMessageInf={showMessageInf} addMessageInfData={addMessageInfData} setShowImageDialog={setShowImageDialog}/>
                    })
                }

            </main>
            <footer className='InputArea'>
                {curImage ? 
                    <>
                        <img src={curImage} className='prevIMG'/> 
                        <button onClick={()=>setCurImage(null)}>Cancel</button>
                        <button onClick={()=>sendMessage(curImage, true)}>Send</button>
                    </>
                : 
                    <>
                        <input type="file" style={{display:'none'}} ref={inputImageRef} onChange={e=>handleImage(e)}/>
                        <textarea value={message} onChange={e=>setMessage(e.target.value)}></textarea>
                        <button onClick={()=>inputImageRef.current.click()}>Img</button>
                        <button onClick={()=>setShowGifModal(true)}>Gif</button>
                        <button onClick={()=>sendMessage(message)}>Send</button>
                    </>
                }
                
            </footer>
        </div>
    </>
    
  )
}

function Message({messageData:{id, content, createdAt, authorID, deleted, edited, image}, friend, showMessageInf, addMessageInfData, setShowImageDialog}) {
    const myMessage = authorID != friend.id;
    const date = new Date(createdAt);
    const userLocalTime = new Intl.DateTimeFormat(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(date);

    return (
        <div className={`message ${myMessage ? 'messageSendedByMe' : ''}`} onClick={image ? ()=>setShowImageDialog({state:true, img:content}) : null}>
            {!deleted ? 
            <>
                {edited ? <h2 className='messageEdited'>Edited</h2> : null}
                {!image ? <h2 className='messageContent'>{content}</h2> : <img src={content} alt='photo'/>}
                <div className='messageBottom'>
                    <h3 className='messageDateShort'>{userLocalTime}</h3>
                    <button className='messageConfig' onClick={(e)=>{e.stopPropagation(),addMessageInfData({id:id, content:content, date:date, fromMe:myMessage, image:image}), showMessageInf(true)}}><img src={dotsIcon} alt="moreInf" /></button>
                </div>
            </>
            : <h2 className='messageDeleted'>This message was deleted</h2>    
            }
        </div>
    )
  }



export default MainChat