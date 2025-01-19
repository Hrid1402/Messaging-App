import React, {useState, useEffect} from 'react'
import axios from 'axios';
import Cookies from 'js-cookie'
import noPicture from '../assets/noPicturePfp.png'
import {toast} from 'react-toastify';

function AddFriend({user, socket, updateFriends, friends, updateChats, emptyCurrentChat}) {
    const [searchedUser, setSearchedUser] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [searchedFriends, setSearchedFriends] = useState([]);
    const [realSearchedUser, setRealSearchedUser] = useState("");

    const [sendedRequests, setSendedRequest] = useState(user.sended);



    useEffect(()=>{
        socket.on('updateFriendRequestsSended', (data) => {
          console.log(data);
          toast("Request sent!");
          setSendedRequest(data);
        });

        socket.on('updateAcceptedRequestSended', (data) => {
          console.log(data);
          toast.success(`${data.to} accepted your request!`);
          setSendedRequest(data.sended);
          updateFriends(data.friends);
          updateChats(data.chats);
        });

        socket.on('updateDeclinedRequestSended', (data) => {
          console.log(data);
          toast.warn(`${data.to} declined your request.`, {
            icon: false
          });
          setSendedRequest(data.sended);
        });

        socket.on('friendDeleted', (data)=>{
          console.log(data);
          updateFriends(data.friends);
          updateChats(data.chats);
          emptyCurrentChat();
          if(data.byMe){
            toast.success("You Deleted " + data.username, {
              icon: false
            });
          }else{
            toast.warn(data.username + " deleted you.", {
              icon: false
            });
          }
      
    });
      },[socket])


  async function searchUser(username){
    username = username.trim();
    if(username == ""){
      return
    }
    console.log("Searching...")
    const users = await axios.post(`${import.meta.env.VITE_SERVER_URL}/auth/searchUser`, {
      username: username
    },{
      headers: {
          Authorization: `Bearer ${Cookies.get("jwt")}`,
          "Content-Type": "application/json"
      }});
    console.log(users.data)
    setSearchedFriends(users.data);
    setRealSearchedUser(username);
    setShowSearch(true);
  }

  async function sendFriendRequest(friend){
    console.log(import.meta.env.VITE_SERVER_URL);
    console.log("Sending Request...")
    socket.emit('friendRequest', { fromID : user.id, toID: friend.id, fromName: user.username, toName: friend.username});
  }


  return (
    <>
        <h2 className='friendsTxt'>Send Friend Request</h2>
        <h5>Search for friends by name and add them to your list.</h5>
        <div className='addFriend'>
        <div className='addFInput'>
            <h4>Name</h4>
            <input type="text" value={searchedUser} onChange={e=>{setSearchedUser(e.target.value)}}/>
        </div>
            <button onClick={()=>searchUser(searchedUser)}>Search</button>
        </div>
        { showSearch? <h2>Results for '{realSearchedUser}'</h2> : null}
        <div className='foundUsers'>
            {
            searchedFriends.map(f =>{
                if(f.id == user.id || friends.some(e=>e.id===f.id)){
                    return
                }
                const noFReqSentBefore = !sendedRequests.some(e => e.toID === f.id);
                return (
                <div className='userToAdd' key={f.username}>
                    <img src={f.picture ?? noPicture} />
                    <h2>{f.username}</h2>
                    {noFReqSentBefore ? <button onClick={()=>sendFriendRequest(f)}>Send Request</button> : <button disabled={true}>Sended!</button>}
                </div>)
            })
        }
        </div>
    </>
  )
}

export default AddFriend