import React, { useEffect, useState, useRef } from 'react'
import dotsIcon from '../assets/dots.svg'
import noPicture from '../assets/noPicturePfp.png' 
import sendIcon from '../assets/sendIcon.svg'
import imageIcon from  '../assets/imageIcon.svg'
import shareIcon from '../assets/share.svg'
import messageIcon from '../assets/message.svg'
import generativeIcon from '../assets/generative.svg'
import AI_Icon from '../assets/AI_Icon.png'
import bottomArrow from '../assets/arrow.svg'
import gifIcon from '../assets/gifIcon.png'
import spinner from '../assets/spinner.svg'
import {toast} from 'react-toastify';
import FriendProfile from './FriendProfile.jsx';
import MessageInf from './MessageInf.jsx'
import GifSearcher from './GifSearcher.jsx'
import GenerationAI from './GenerationAI.jsx'
import '../styles/MainChat.css'
import Rodal from 'rodal';
import axios from 'axios';

import 'rodal/lib/rodal.css';


function MainChat({chat, friend, user, socket, updateCurrentChatData, chats, modifiedChats, setModifiedChats}) {
    const [friendDialogOpen, setFriendDialogOpen] = useState(false);
    const [messageInfDialogOpen, setMessageInfDialogOpen] = useState(false);
    const [messageInfData, setMessageInfData] = useState(null);
    const containerRef = useRef(null);
    const inputImageRef = useRef(null);
    const [curImage, setCurImage] = useState(null);
    const [showImageDialog, setShowImageDialog] = useState({state: false, img: null});
    const [showGifModal, setShowGifModal] = useState(false);
    const [showGenerationModal, setShowGenerationModal] = useState(false);
    const [message, setMessage]  = useState("")

    const [messageLoading, setMessageLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const [tempMessage, setTempMessage] = useState(null);
    const [scrollDownBTN, setScrollDownBTN] = useState(false);

    const currentChat = chat ? chats.find(c => c.id === chat.id) : null;

    const [background, setBackground] = useState(currentChat ? currentChat.background: null);

    useEffect(()=>{
        if (!containerRef.current) return;
        const handleScroll = () => {
            const isBottom = containerRef.current.scrollHeight - containerRef.current.scrollTop - containerRef.current.clientHeight < 100;
            setScrollDownBTN(!isBottom);
        };
    
        containerRef.current.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => {
            containerRef.current.removeEventListener('scroll', handleScroll);
        }
    },[friend])

    useEffect(()=>{
        setBackground(currentChat ? currentChat.background: null);
    },[currentChat])
    useEffect(()=>{
        const handleMessage = (data)=>{
            console.log("socket received", data);
            if(data.authorID === user.id){
                console.log("Message sent by myself");
                setMessageLoading(false);
            }
            updateCurrentChatData(data.chat, data.chats);
        }
        socket.on('receivedMessage', handleMessage);
        if(chat!=null){
            containerRef.current.style.scrollBehavior = 'smooth';
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
        return () => {
            socket.off("receivedMessage", handleMessage);
        };
        
    }, [socket, chat, chats]);

    useEffect(()=>{
        const handleMessage = (data) => {
            console.log("message received", data);
            const isFromCurrentChat = friend && friend.id === data.authorID
            if(data.modifiedChats){
                if(!isFromCurrentChat){
                    setModifiedChats(data.modifiedChats);
                }else{
                    const newModifiedChats = modifiedChats.filter(c=>c.id === currentChat.id);
                    socket.emit('updateModifiedChats', {userID: user.id, modifiedChats:newModifiedChats});
                }
                
            }
            if(isFromCurrentChat){
                return
            }
            toast.info(
                <div>
                    <h4 style={{ margin: '0', fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                    {data.username}
                    </h4>
                    <p style={{ margin: '5px 0 0', fontSize: '16px', color: '#555' }}>
                    {data.isImage ? `${data.username} shared a photo` :data.content.length > 60 ? data.content.substring(0, 60) + "..." : data.content}
                    </p>
                </div>,
                { icon: false}
            );
        }

        const handleChangeBackground = (data) => {
            console.log("change background received", data);
            updateCurrentChatData(data.chat);
            if(data.fromID === user.id){
                toast.success('Chat background updated successfully!');
            }else{
                toast(`${data.fromName} updated the background!`);
            }
            
            
        };
        socket.on('messageNotification', handleMessage);
        socket.on('changeBackground', handleChangeBackground);
        return () => {
            socket.off("messageNotification", handleMessage);
            socket.off('changeBackground', handleChangeBackground);
        };
    }, [socket, friend])

    useEffect(()=>{
        if(currentChat && modifiedChats.includes(currentChat.id)){
            const newModifiedChats = modifiedChats.filter(c=>c.id === currentChat.id);
            setModifiedChats(newModifiedChats);
            socket.emit('updateModifiedChats', {userID: user.id, modifiedChats:newModifiedChats});
        }
    }, [friend])

    useEffect(()=>{
        if(containerRef.current){
            containerRef.current.style.scrollBehavior = 'auto';
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    },[friend]);

    if(chat==null){
        return(
            <div className='snapTalk_intr'>
                <h1 className='title'>Welcome to Snap<span className='talk'>Talk</span>!</h1>
                <h2 className='subtitle'>The easiest way to stay connected with your friends.</h2>
                <div className='characteristics'>
                    <div className='SnapContentBlock'>
                        <img src={messageIcon}/>
                        <p>Send instant messages with friends</p>
                    </div>
                    <div className='SnapContentBlock'>
                        <img src={imageIcon}/>
                        <p>Share your favorite photos and GIFs and moments</p>
                    </div>
                    <div className='SnapContentBlock'>
                        <img src={AI_Icon}/>
                        <p>Create stunning images on the go with our AI image generator!</p>
                    </div>
                    <div className='SnapContentBlock'>
                        <img src={shareIcon}/>
                        <p>Everything you need in one place</p>
                    </div>
                </div>
            </div>
        )
    }
    function showMessageInf(value){
        setMessageInfDialogOpen(value);
    }

    function addMessageInfData(value){
        setMessageInfData(value)
    }

    async function sendMessage(newMessage, isImage, notBlob){
        console.log(newMessage);
        if(newMessage.trim("") == ""){
            return
        }
        if(isImage){
            console.log("Image");
            let pictureURL = "";
            if(!notBlob){
                setImageLoading(true);
                const response = await fetch(newMessage);
                const blob = await response.blob();
                
                const formData = new FormData();
                formData.append("image", blob);
                const picture = await axios.post(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API}`,formData);
                pictureURL = picture.data.data.url;
                setImageLoading(false);
            }else{
                pictureURL = newMessage;
            }
            socket.emit('sendMessage', {chatID: chat.id, content: pictureURL, authorID:user.id, toID: friend.id, username: user.username, isImage: true});
            setMessage("");
            setCurImage(null);
        }else{
            socket.emit('sendMessage', {chatID: chat.id, content: newMessage, authorID:user.id, toID: friend.id, username: user.username, isImage: false});
            setMessageLoading(true);
            setTempMessage({content: message});
            setMessage("");
            setCurImage(null);
        }
        
    }
    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendMessage(message);
        }
      };

    function handleImage(event){
        const file = event.target.files[0];
        if (file) {
            const fileName = file.name;
            const fileSize = file.size;
            const fileType = file.type;
            const validImageTypes = ['image/png', 'image/jpeg', 'image/gif'];

        if (!validImageTypes.includes(fileType)) {
            toast.error('The file is not a valid image (PNG, JPG, GIF).');
            return;
        }
        const maxSizeInBytes = 32 * 1024 * 1024;
        if (fileSize > maxSizeInBytes) {
            toast.error('The file is too big');
            return;
        }
        console.log(`Selected file: ${fileName}\nSize: ${fileSize} bytes\nType: ${fileType}`);
        setCurImage(URL.createObjectURL(file));
    }
    }

    function scrollBottom(){
        if(containerRef.current){
            containerRef.current.style.scrollBehavior = 'smooth';
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }

  return (
    <>
        <Rodal visible={friendDialogOpen} onClose={()=>setFriendDialogOpen(false)} customStyles={{maxWidth:'600px',width:'80vw', height:'60vh'}}>
            <FriendProfile chatID={currentChat.id} isOpen={friendDialogOpen} simple={true} chat={true} id={friend.id} username={friend.username} description={friend.description} pfp={friend.picture} socket={socket} myID={user.id} myUsername={user.username} closeModal={()=>setFriendDialogOpen(false)}/>
        </Rodal>

        <Rodal visible={messageInfDialogOpen} onClose={()=>setMessageInfDialogOpen(false)} customStyles={{maxWidth:'430px',width:'80vw', height:'60vh'}}>
            {messageInfData? <MessageInf id={messageInfData.id} content={messageInfData.content} date={messageInfData.date} fromMe={messageInfData.fromMe} image={messageInfData.image} socket={socket} user={user} chatID={currentChat.id} toID={friend.id} showMessageInf={showMessageInf}/> : null}
        </Rodal>

        <Rodal visible={showImageDialog.state} onClose={()=>setShowImageDialog({state:false, img: null})} customStyles={{width:'fit-content', height:'fit-content', maxHeight: '80vh', maxWidth: '80vw', backgroundColor:'rgba(0, 0, 0, 0.53)', overflowY: 'hidden'}}>
            <img src={showImageDialog.img} alt="photo" style={{
           maxHeight: '80vh',
           maxWidth: '80vw',
           height: 'auto',
           width: 'auto',
           objectFit: 'contain'
        }}/>
        </Rodal>

        <Rodal visible={showGifModal} onClose={()=>setShowGifModal(false) } customStyles={{maxWidth:'600px',width:'80vw', height:'70vh'}} >
            <GifSearcher isOpen={showGifModal} sendMessage={sendMessage} closeModal={()=>setShowGifModal(false)}/>
        </Rodal>


        <Rodal visible={showGenerationModal} onClose={()=>setShowGenerationModal(false) } customStyles={{maxWidth:'800px',width:'80vw', height:'80vh'}} >
            <GenerationAI sendMessage={sendMessage} closeModal={()=>setShowGenerationModal(false)}/>
        </Rodal>

        <div className='MainChatContainer' style={{...(background && background.startsWith('#') ? {backgroundColor:background} : background ? {backgroundImage:background, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor:'rgba(0,0,0,0.4)', backgroundBlendMode: 'darken'} : {backgroundColor:'#192e52'} )}}> 
            <header className='headerFriendData'>
                <button className='friendUserDataBTN' onClick={()=>setFriendDialogOpen(true)}>
                    <img src={friend.picture ?? noPicture} />
                    <h1>{friend.username}</h1>
                </button>
            </header>
            
            <main className='allMessagesContainer' ref={containerRef}>
                {
                    currentChat.messages.map(m=>{
                        return <Message messageData={m} key={m.id} friend={friend} showMessageInf={showMessageInf} addMessageInfData={addMessageInfData} setShowImageDialog={setShowImageDialog} temp={false}/>
                    })
                }
                {
                    messageLoading && <Message messageData={tempMessage} temp={true}></Message>
                }

            </main>
            <button onClick={()=>scrollBottom()} className={`ScrollDownBTN ${!scrollDownBTN ? 'hideScrollBTN' : ''}`}><img src={bottomArrow} alt='Scroll Bottom'></img></button>
            <footer className='InputArea'>
                {curImage ? 
                    <>
                        <img src={curImage} className='prevIMG'/>
                        {
                            imageLoading ?
                            <div style={{alignSelf:'center'}}>
                                <button disabled={true}  >Loading...</button>
                            </div> :
                            <div className='imageBTNS'>
                                <button onClick={()=>sendMessage(curImage, true)}>Send</button>
                            <button onClick={()=>setCurImage(null)}>Cancel</button>
                        </div>

                        }
                        
                    </>
                : 
                    <>
                        <input type="file" style={{display:'none'}} ref={inputImageRef} onChange={e=>handleImage(e)}/>
                        <textarea value={message} onChange={(e)=>setMessage(e.target.value)} onKeyDown={handleKeyPress}></textarea>
                        <button onClick={()=>inputImageRef.current.click()} className={`image_btn ${message ? 'hidden' : ''}`}><img src={imageIcon} alt='img'></img></button>
                        <button onClick={()=>setShowGifModal(true)} className={`gif_btn ${message ? 'hidden' : ''}`}><img src={gifIcon} alt='gif'></img></button>
                        <button onClick={()=>setShowGenerationModal(true)} className={`generative_btn ${message ? 'hidden' : ''}`}><img src={generativeIcon} alt='generative AI'></img></button>
                        <button onClick={()=>sendMessage(message)} className={`send_btn ${!message ? 'hidden' : ''}`} disabled={messageLoading}><img src={messageLoading ? spinner : sendIcon} alt='Send'></img></button>
                    </>
                }
                
            </footer>
        </div>
    </>
    
  )
}

function Message({messageData:{id, content, createdAt, authorID, deleted, edited, image}, friend, showMessageInf, addMessageInfData, setShowImageDialog, temp}) {
    if(temp){
        return(
            <div className= 'message messageSendedByMe loadingMessage'>
                <h2 className='messageContent'>{content}</h2>
            </div>
        )
    }

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