import React, {useState, useEffect} from 'react'
import axios from 'axios';
import Cookies from 'js-cookie'
import noPicture from '../assets/noPicturePfp.png'
import FriendProfile from './FriendProfile.jsx';
import {toast} from 'react-toastify';
import '../styles/AddFriend.css'
import 'ldrs/ring'
import 'ldrs/tailChase'


function AddFriend({isOpen, user, socket, updateFriends, friends, updateChats, emptyCurrentChat}) {
    const [searchedUser, setSearchedUser] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [searchedFriends, setSearchedFriends] = useState([]);
    const [realSearchedUser, setRealSearchedUser] = useState("");

    const [sendedRequests, setSendedRequest] = useState(user.sended);

    const [loading, setLoading] = useState(false);
    const [loadingAddFriend, setLoadingAddFriend] = useState(false);

    const [friendData, setFriendData] = useState(null);
    const [showFriendData, setShowFriendData] = useState(false);


    useEffect(()=>{
      setShowFriendData(false);
    }, [isOpen]);


    useEffect(()=>{
        socket.on('updateFriendRequestsSended', (data) => {
          console.log(data);
          toast("Request sent!");
          setLoadingAddFriend(false);
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
    setLoading(true);
    console.log("Searching...")
    try{
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
    }catch(error){
      console.log("Error searching friend", error);
    }finally{
      setLoading(false);
    }
  }

  async function sendFriendRequest(friend){
    setLoadingAddFriend(true);
    console.log("Sending Request...")
    socket.emit('friendRequest', { fromID : user.id, toID: friend.id, fromName: user.username, toName: friend.username});
  }

  if(showFriendData){
    return(
      <>
        <FriendProfile id={friendData.id} username={friendData.username} pfp={friendData.pfp} description={friendData.description} simple={true}></FriendProfile>
        <button onClick={()=>setShowFriendData(false)}>Return</button>
      </>
    )
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
          {!loadingAddFriend && <button onClick={()=>searchUser(searchedUser)} disabled={loading}>{loading ? 'Searching...' : 'Search'}</button>}
        </div>
        { loadingAddFriend ? 
        <l-tail-chase
        size="40"
        speed="1.75"
        color="black" 
      ></l-tail-chase> 
      : 
        
        showSearch? <h2>Results for '{realSearchedUser}'</h2> : null}
        <div className='foundUsers'>
            {
              !loadingAddFriend &&
            searchedFriends.map(f =>{
                if(f.id == user.id){
                  return
                }
                const alreadyFriend = friends.some(e=>e.id===f.id);
                const noFReqSentBefore = !sendedRequests.some(e => e.toID === f.id);
                return (
                <div className='userToAdd' key={f.username} onClick={()=>{setShowFriendData(true), setFriendData({id: f.id, username: f.username, description: f.description, pfp: f.picture})}} role="button" tabIndex={0}>
                    <div className='friendNamePfp'>
                      <img src={f.picture ?? noPicture} />
                      <h2>{f.username}</h2>
                    </div>
                    {alreadyFriend ? <button disabled={true}>Already friends</button> : noFReqSentBefore ? <button onClick={(e)=>{e.stopPropagation(), sendFriendRequest(f)}}>Send Request</button> : <button disabled={true}>Sended!</button>}
                </div>)
            })
        }
        </div>
    </>
  )
}

export default AddFriend