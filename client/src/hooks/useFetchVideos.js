import { useState, useEffect } from 'react';
import useLocalStorage from './useLocalStorage';

const useFetchVideos = (startDate, endDate) => {
    const [videos, setVideos] = useLocalStorage('nbaVideos', []);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [shouldFetch, setShouldFetch] = useState(true);

    useEffect(() => {
        const fetchVideos = async () => {

            const lastFetchTime = localStorage.getItem('lastFetchTime');
            const now = new Date().getTime();

            // Avoid fetching if data is fresh (within 1 hour)
            if (lastFetchTime && now - lastFetchTime < 60 * 60 * 1000 && !shouldFetch) {
                console.log("Skipping fetch, data is fresh...");
                setLoading(false);
                return;
            }
            

            if (!shouldFetch) {
                console.log('Using cached videos...');
                setLoading(false);
                return;
            }

            console.log('Fetching new videos...');

            if (!startDate || !endDate || isNaN(new Date(startDate)) || isNaN(new Date(endDate))) {
                console.warn("Invalid dates provided, skipping fetch.");
                setLoading(false);
                return;
            }

            // const playlistId = "PL_HppZy-GwSwvUSkRfc6O6ktJ-T5bwcar"; // House of Highlights Playlist

            const nbaChannelId = "UCWJ2lWNubArHWmf3FIHbfcQ"; 
            const searchQuery = "Full Game Highlights";

            // Adjust start and end dates for correct filtering
            const startDateISO = new Date(startDate).toISOString();

            const adjustedEndDate = new Date(endDate);

            // Set time to end of the day.
            adjustedEndDate.setHours(23, 59, 59, 999); 
            const endDateISO = adjustedEndDate.toISOString();

            let nextPageToken = '';
            let allVideos = [];

            try {
                do {
                    // Old query
                    const base = import.meta.env.VITE_API_BASE_URL;

                    if(!base) {
                        throw new Error("VITE_API_BASE_URL is not defined");
                    }
                    const url = `${base.endsWith('/') ? base : base + '/'}videos?q=${searchQuery}&channelId=${nbaChannelId}&publishedAfter=${startDateISO}&publishedBefore=${endDateISO}&pageToken=${nextPageToken}`;

                    // const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=30&playlistId=${playlistId}&key=${apiKey}&pageToken=${nextPageToken}`;
                    
                    console.log('Fetching:', url);
                    const response = await fetch(url);

                    if (!response.ok) {
                    const errText = await response.text();
                    throw new Error(`API error ${response.status}: ${errText}`);
                    }

                    const data = await response.json();

                    if (data.items) {

                        //  Check the full response.
                        console.log("Raw API Response:", data); 
                        allVideos = [...allVideos, ...data.items.map(video => ({
                            id: video.id.videoId || video.snippet.resourceId?.videoId,
                            snippet: video.snippet
                        }))]; // Append results instead of replacing them
                    }
                    
                    nextPageToken = data.nextPageToken || '';
                } while (nextPageToken && allVideos.length < 200);

                //Remove duplicates and sort by published date (newest to oldest).
                const uniqueVideos = Array.from(new Map(allVideos.map(video => [video.id, video])).values())
                .sort((a, b) => new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt));            

                // Strict filtering: Only keep videos where title contains "Full Game Highlights".
                const filteredVideos = uniqueVideos.filter(video =>
                    video.snippet.title.toLowerCase().includes("full game highlights")
                );

                console.log("Final processed videos for rendering:", filteredVideos);
                console.log("Total videos found:", filteredVideos.length);

                // Store only the videos array.
                setVideos(filteredVideos);

                // Store last fetch time.
                localStorage.setItem("lastFetchTime", now);
                console.log("Processed videos for rendering:", allVideos);
                
                setShouldFetch(false);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching videos:', error);
                setError(error.message);
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchVideos, 1000);

        return () => clearTimeout(timeoutId);

    }, [startDate, endDate, shouldFetch]);

    return { videos, loading, error, setShouldFetch };
};

export default useFetchVideos;
