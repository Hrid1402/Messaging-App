import React, { useEffect, useState } from 'react'
import '../styles/GifSearcher.css'
import axios from 'axios'
import 'ldrs/ring'

import Masonry from 'react-masonry-css';

function GifSearcher({isOpen, sendMessage, closeModal}) {
    const giftsLimit = 50;
    const [searchedGifts, setSearchedGifts] = useState([]);
    const [toSearch, setToSearch] = useState("");
    const [searched, setSearched] = useState("Trending");

    const [loading, setLoading] = useState(true);
    
    useEffect(()=>{
        setLoading(true)
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
            }finally{
                setLoading(false);
            }
        };
        fetchTrendingGifts();
    },[isOpen]);

    async function searchGif(gif){
        try{
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 2000));
            const response = await axios.get(`https://api.giphy.com/v1/gifs/search?api_key=${import.meta.env.VITE_GIPHY}&q=${gif}&limit=${giftsLimit}&offset=0&rating=pg-13`)
            setSearchedGifts(response.data.data);
            console.log(response.data.data);
        }catch(error){
            console.error("Error searching GIFs:", error);
        }finally{
            setLoading(false);
            setSearched(gif);
        }
        
    }
  return (
    <>
        <h1 className='gifTitle'>Search for a GIF!</h1>
        <div className='gifInput'>
            <input type="text" value={toSearch} onChange={e=>setToSearch(e.target.value)} />
            {!loading && <button onClick={()=>searchGif(toSearch)}>Search</button>}
        </div>
        <h2 className='resultsGif'>{!loading ? `Results for: ${searched}` : `Searching ${toSearch}...`}</h2>
        {loading ? 
        <l-ring
        size="100"
        stroke="10"
        bg-opacity="0"
        speed="3"
        color="black" ></l-ring>
        :
        <Masonry breakpointCols={2} className="results" columnClassName="results-column">
            {searchedGifts.length > 0 ? searchedGifts.map(gif=>{
                return <button className='gif' key={gif.id} onClick={async()=>{await sendMessage(gif.images.original.url, true, true), closeModal()}}><img  src={gif.images.downsized_medium.url} alt={gif.title}/></button>
            }): searchedGifts.length == 0 ? <h2 className='gifNoFound'>Sorry, no results</h2> : null}
        </Masonry>    
        }
    </>
  )
}

export default GifSearcher