import React, { useEffect, useState } from 'react'
import '../styles/MessageInf.css'

function MessageInf({id, content, date, fromMe, image, socket, chatID, user, toID, showMessageInf}) {
    const [editMode, setEditMode] = useState(false);
    const [editedMessage, setEditedMessage] = useState(content);
    useEffect(()=>{
        setEditMode(false);
        setEditedMessage(content);
    }, [id])

    function deleteMessage(){
        socket.emit('deleteMessage', {id: id, chatID: chatID, authorID: user.id, toID: toID});
        showMessageInf(false);
    }

    function editMessage(){
        socket.emit('editMessage', {id: id, chatID: chatID, authorID: user.id, toID: toID, content:editedMessage});
        showMessageInf(false);
    }

    const fullDate = new Intl.DateTimeFormat(undefined, {
        dateStyle: 'short',
    }).format(date);

    const fullTime = new Intl.DateTimeFormat(undefined, {
        timeStyle: 'short'
    }).format(date);

    if(editMode){
        return(
        <div>
            <h1>Editing Message</h1>
            <input type="text" value={editedMessage} onChange={e=>setEditedMessage(e.target.value)}/>
            <div>
                <button onClick={()=>setEditMode(false)}>Cancel</button>
                <button onClick={()=>editMessage()}>Save</button>
            </div>
        </div>)
    }
  return (
    <div className='messageInformation'>
        <h1 className='MI_Title'>Message Information</h1>
        <h2 className='dateTime'>Content:</h2>
        {!image ? <h2 className='MI_Content'>{content}</h2> : <img className='msgInfImg' src={content} alt='photo'/>}
        <h2 className='dateTime'>Date:</h2>
        <h2 className='dateTimeText'>{fullDate}</h2>
        <h2 className='dateTime'>Time:</h2>
        <h2 className='dateTimeText'>{fullTime}</h2>
        {fromMe ? 
        <div className='btns'>
            {!image ? <button onClick={()=>setEditMode(true)}>Edit</button> : null}
            <button onClick={()=>deleteMessage()}>Delete</button>
        </div> : null}
    </div>
  )
}

export default MessageInf