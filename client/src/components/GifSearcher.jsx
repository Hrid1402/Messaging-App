import React, { useEffect, useState } from 'react'
import '../styles/GifSearcher.css'
import axios from 'axios'
import Masonry from 'react-masonry-css';

function GifSearcher({isOpen, sendMessage, closeModal}) {
    const giftsLimit = 30;
    const [searchedGifts, setSearchedGifts] = useState([]);
    const [toSearch, setToSearch] = useState("");
    const [searched, setSearched] = useState("Trending");
    
    useEffect(()=>{
        setToSearch("");
        setSearched("Trending");
        const fetchTrendingGifts = async () => {
            try {
                const response = await axios.get(
                    `https://api.giphy.com/v1/gifs/trending?api_key=${import.meta.env.VITE_GIPHY}&limit=${giftsLimit}&rating=pg-13`
                );
                setSearchedGifts(response.data.data);
            } catch (error) {
                console.error("Error fetching trending GIFs:", error);
            }
        };
        fetchTrendingGifts();
    },[isOpen]);

    async function searchGif(gif){
        try{
            const response = await axios.get(`https://api.giphy.com/v1/gifs/search?api_key=${import.meta.env.VITE_GIPHY}&q=${gif}&limit=${giftsLimit}&offset=0&rating=pg-13`)
            setSearchedGifts(response.data.data);
            console.log(response.data.data);
        }catch(error){
            console.error("Error searching GIFs:", error);
        }
        setSearched(gif);
    }
  return (
    <>
        <h1 className='gifTitle'>Search for a GIF!</h1>
        <div>
            <input type="text" value={toSearch} onChange={e=>setToSearch(e.target.value)} />
            <button onClick={()=>searchGif(toSearch)}>Search</button>
        </div>
        <h2 className='resultsGif'>Results for: {searched}</h2>
        <Masonry breakpointCols={4} className="results" columnClassName="results-column">
            {searchedGifts.length > 0 ? searchedGifts.map(gif=>{
                return <button className='gif' onClick={async()=>{await sendMessage(gif.images.original.url, true, true), closeModal()}}><img  src={gif.images.original.url} alt={gif.title} key={gif.id}/></button>
            }): searchedGifts.length == 0 ? <h2 className='gifNoFound'>Sorry, no results</h2> : null}
        </Masonry>
    </>
  )
}

export default GifSearcher