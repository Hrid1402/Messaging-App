import React, {useRef, useState, useEffect} from 'react'
import noPicture from '../assets/noPicturePfp.png'
import addPhotoIcon from '../assets/add.png'
import ImageCropper from './ImageCropper.jsx'
import '../styles/UserProfile.css'  
import axios from 'axios'
import {toast} from 'react-toastify';
import 'ldrs/ring'
import Cookies from 'js-cookie'

function UserProfile({user, isOpen}) {
    const inputFile = useRef(null)
    const [imageURL, setImageURL] = useState(null);
    const [croppedImage, setCroppedImage] = useState(null)

    const [editMode, setEditMode] = useState(false);
    const [wasModified, setWasModified] = useState(false);
    const [description, setDescription] = useState(user.description ?? "");

    const [loadingDescription, setLoadingDescription] = useState(false);
    const [loadingPfp, setLoadingPfp] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setWasModified(false);
            setDescription(user.description ?? "");
            setEditMode(false);
        }
    }, [isOpen, user.username, user.description]);

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
        if (fileType === 'image/gif'){
            setImageURL(URL.createObjectURL(file));
            await handleCropDone(URL.createObjectURL(file));
        }else{
            setImageURL(URL.createObjectURL(file));
        }
        }
    };

    const handleCropDone = async(croppedImageUrl) => {
        try {
            setLoadingPfp(true);
            const response = await fetch(croppedImageUrl);
            const blob = await response.blob();
            const formData = new FormData();
            formData.append("image", blob);
            const pfpData = await axios.post(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API}`,formData);
            console.log(pfpData.data.data.url);
            const pfpURL = pfpData.data.data.url;
            console.log(pfpURL);
            if(pfpURL){
                const result = await axios.put(`${import.meta.env.VITE_SERVER_URL}/auth/user`,{
                    picture: pfpURL
                } ,{
                    headers: {
                        Authorization: `Bearer ${Cookies.get("jwt")}`,
                        "Content-Type": "application/json"
                    }});
                if(result){
                    setCroppedImage(croppedImageUrl);
                } 
            }
        } catch (error) {
            console.log("Error changing pfp", error);
        }finally{
            setLoadingPfp(false);
        }
      }
    async function saveChanges(){
        console.log(description);
        setLoadingDescription(true);
        try{
            await axios.put(`${import.meta.env.VITE_SERVER_URL}/auth/user`,{
                description: description
            } ,{
                headers: {
                    Authorization: `Bearer ${Cookies.get("jwt")}`,
                    "Content-Type": "application/json"
                }});
        }catch(error){
            console.log("Error changing description", error);
        }finally{
            setWasModified(true);
            setEditMode(false);
            setLoadingDescription(false);
        }
        
    }

    if(imageURL){
        return(
        <>
            {
            loadingPfp ? 
                <div style={{height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <l-ring
            size="100"
            stroke="10"
            bg-opacity="0"
            speed="3"
            color="black" ></l-ring>
                </div>
            : 
            croppedImage ? 
            <div>
                <h1>Profile picture changed!</h1>
                <img src={croppedImage} alt="cropped image" className='changedPFP'/>
                <h2>Reload the page to see the changes</h2>
            </div>
            : 
            <ImageCropper yourImage={imageURL} onCropCancel={()=>setImageURL(null)} onCropDone={handleCropDone}/>}

        </>)
    }

  return (
    <div className='userProfileContainer' key={isOpen ? "open" : "closed"}>
        <input type='file' id='file' ref={inputFile} style={{display: 'none'}} onChange={e=>handleFile(e)}/>
        <h1 className='profileTXT'>Profile</h1>
        <button className='UP_pfp' onClick={()=>inputFile.current.click()}>
            <img src={user.picture ?? noPicture} alt="profile picture" className='currentPFP' />
            <img src={addPhotoIcon} alt="addImage" className='addPhotoIcon'/>
        </button>
        <h1 className='pfUsername'>{user.username }</h1>
        {loadingDescription ? 
        <l-ring
        size="100"
        stroke="10"
        bg-opacity="0"
        speed="3"
        color="black" ></l-ring>
         : wasModified ? 
        <h2>The description was modified, restart the page to see the changes!</h2> :
        <>
            <h2 className='pf_descrTxt'>Description:</h2>
            {editMode ? <textarea className='descrInput' type="text" value={description} onChange={e=>setDescription(e.target.value)}/>: user.description && user.description.trim() != "" ? <h2 className='pf_descr'>{user.description}</h2> : 
            <h2 className='pf_descr noDescr' >No description yet. Add one!</h2>}
            
            <div className='descrButtons'>
                {editMode ? <button onClick={()=>saveChanges()}>Save changes</button> : null}
                {editMode ? <button onClick={()=>setEditMode(false)}>Cancel</button> : <button onClick={()=>{setDescription(user.description ?? ""), setEditMode(true)}}>Modify description</button>}     
            </div>
        </>}
        
    </div>
   
  )
}

export default UserProfile