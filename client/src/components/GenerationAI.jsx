import React, { useState } from 'react'
import {AIReply, generateImage} from './AI.js'
import cubicLoading from '../assets/cubicLoading.gif'
import AI_Placeholder from '../assets/AI_Placeholder.png'
import axios from 'axios'
import '../styles/GenerationAI.css'

function GenerationAI({sendMessage, closeModal}) {
    const [userPrompt, setUserPrompt] = useState("");
    const [blobImage, setBlobImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingSend, setLoadingSend] = useState(false);
    
    async function sendImage(){
        setLoadingSend(true);
        try {
            const response = await fetch(blobImage);
            const blob = await response.blob();
            const formData = new FormData();
            formData.append("image", blob);
            const AI_Image = await axios.post(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API}`,formData);
            const AI_Image_URL = AI_Image.data.data.url;
            await sendMessage(AI_Image_URL, true, true);
        } catch (error) {
            console.log("Error sending Ai image", error);
        }finally{
            setLoadingSend(false);
            closeModal();
        }
    }

    async function generateAI_Image(){
        setLoading(true)
        setBlobImage(null);
        console.log("Prompt", userPrompt);
        try {
            const prompt = await AIReply(userPrompt);
            setBlobImage(await generateImage(prompt));
        } catch (error) {
            console.log("Error generating image", error)
        }finally{
            setLoading(false)
        }
        
    }
  return (
    <div className={`AI_container ${loadingSend ? 'full' : ''}`}>
        <h1>Bring Ideas to Life with AI</h1>
        {
            loadingSend ? 
            <div style={{height:'100%', display: 'flex', justifyContent: 'center', alignItems:'center'}}>
                <l-ring
                size="100"
                stroke="10"
                bg-opacity="0"
                speed="3"
                color="black" ></l-ring>
            </div>: 
            <>
                <img src={blobImage ? blobImage  : loading ? cubicLoading : AI_Placeholder} className="Generated" alt="generated Image" />
                <textarea disabled={loading} className='GenerateInput' type="text" value={userPrompt} onChange={e=>setUserPrompt(e.target.value)}/>
                {!loading && <button className='generateBTN' onClick={()=>generateAI_Image()} disabled={!userPrompt}>Start Imagining</button>}
                {blobImage && <button className='sendBTN' onClick={()=>sendImage()}>Send</button>}
            </>
        }
        
    </div>
  )
}

export default GenerationAI