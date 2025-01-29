import React, { useEffect, useState, useRef } from 'react'
import noPicture from '../assets/noPicturePfp.png'
import {toast} from 'react-toastify';
import axios from 'axios'
import 'ldrs/ring'
import {solidColors, backgroundThemes, animatedBackgrounds} from './Themes.js'
import '../styles/FriendProfile.css'


function FriendProfile({isOpen, chatID, chat=false, simple=false, id, username, description ,pfp, socket, myID, myUsername, closeModal}) {
  const [changeBackgroundMode, setChangeBackgroundMode] = useState(null);
  const [loading, setLoading] = useState(null);
  const inputFile = useRef(null)

  useEffect(()=>{
    setChangeBackgroundMode(null);
  },[isOpen]);

  function removeFriend(){
    console.log("Removing " + username);
    socket.emit('removeFriend', { fromID : myID, toID: id, fromName: myUsername, toName: username});
  }
  function changeBackground(background, isImage){
    socket.emit('changeBackground', { fromID : myID, toID: id, fromName: myUsername, chatID: chatID, background: isImage ? `url(${background})` : background});
    closeModal();
  }

  async function handleFile(event){
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
          await uploadCustomBackground(URL.createObjectURL(file));
        }
  };

  async function uploadCustomBackground(image){
    try {
      setLoading(true);
      const response = await fetch(image);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append("image", blob);
      const backgroundData = await axios.post(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API}`,formData);
      const backgroundURL = backgroundData.data.data.url;
      console.log(backgroundURL);
      changeBackground(backgroundURL, true)
    } catch (error) {
        console.log("Error uploading background picture", error);
    }finally{
      setLoading(false);
    }
  }

  if(changeBackgroundMode){
    return(
      <div className='changeBackgroundMode'>
        <h1>Update background</h1>
        {
        loading ? 
        <l-ring
        size="100"
        stroke="10"
        bg-opacity="0"
        speed="3"
        color="black" ></l-ring> 
        : 
        <>
          <input type='file' id='file' style={{display: 'none'}} ref={inputFile} onChange={(e)=>handleFile(e)}></input> 
          <button onClick={()=>inputFile.current.click()}>Upload your own</button>
          <h2>Solid colors:</h2>
          <div className='solidColors'>
          {
            solidColors.map((c, i) =>{
              return(
                <button className='solidColor' key={i} onClick={()=>changeBackground(c.color, false)}>
                  <div className='solidColorContent' style={{backgroundColor:c.color}}></div>
                  <h3>{c.name}</h3>
                </button>
              )
            })
          }
          </div>
          <h2>Themes</h2>
          <div className='Themes'>
            {
              backgroundThemes.map((t, i) =>{
                return(
                  <button className='theme' key={i} onClick={()=>changeBackground(t.url, true)}>
                    <img src={t.url}></img>
                    <h3>{t.name}</h3>
                  </button>
                )
              })
            }
          </div>
          <h2>Animated</h2>
          <div className='animations'>
          {
            animatedBackgrounds.map((t, i) =>{
              return(
                <button className='animated' key={i} onClick={()=>changeBackground(t.url, true)}>
                  <img src={t.url}/>
                  <h3>{t.name}</h3>
                </button>
              )
            })
          }
          </div>
        </>
        }
      </div>
    )
  }
  return (
    <div className='friendProfileContainer'>
        <img src={pfp ?? noPicture} />
        <h1>{username}</h1>
        {description && <h2>{description}</h2>}
        {chat && <button onClick={()=>setChangeBackgroundMode(true)}>Edit chat background</button>}
        {!simple && <button onClick={()=>removeFriend()}>Remove friend</button>}
    </div>
  )
}

export default FriendProfile