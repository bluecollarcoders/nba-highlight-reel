import { useState, useEffect } from 'react';

const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);

  // Load favorites from local storage on component mount.
  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem('favoritesVideos')) || [];
    setFavorites(Array.isArray(storedFavorites) ? storedFavorites : []);
  }, []);

  // Save favorites to local storage whenever favorites change.
  useEffect(() => {
    localStorage.setItem('favoritesVideos', JSON.stringify(favorites));
  }, [favorites]);

  // Toggle favorite (add or remove) a video.
  const toggleFavorite = (video) => {
    const videoId = video.id.videoId || video.id; // ✅ Normalize ID
  
    setFavorites((prevFavorites) => {
      const isAlreadyFavorite = prevFavorites.some((fav) => fav.id === videoId);
      return isAlreadyFavorite
        ? prevFavorites.filter((fav) => fav.id !== videoId)
        : [...prevFavorites, { ...video, id: videoId }]; // ✅ Ensure consistent ID format
    });
  };
  

  // Remove a favorite directly.
  const removeFavorite = (videoId) => {
    setFavorites((prevFavorites) => prevFavorites.filter((fav) => fav.id !== videoId));
  };

  return { favorites, toggleFavorite, removeFavorite };
};

export default useFavorites;
