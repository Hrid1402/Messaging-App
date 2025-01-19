import React, { useState } from 'react'
import noPicture from '../assets/noPicturePfp.png'

function MyFriends({myFriends}) {
    
  return (
    <>
        <h1>My friends</h1>
        <div className='friendsContainer'>
            {
            myFriends.length == 0 ? <h3>No friends yet. Go find some!</h3> : 
            
            myFriends.map(r=>{
                return (
                <button key={r.id} className='pendingRequest'>
                    <div className="PR_User">
                        <img src={r.picture ?? noPicture} />
                        <h2>{r.username}</h2>
                    </div>
                </button>
                )
            })
        }
        </div>
        
    </>
  )
}

export default MyFriends