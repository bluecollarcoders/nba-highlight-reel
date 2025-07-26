import React, { useState, useMemo, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import VideoCard from './components/VideoCard';
import VideoModal from './components/VideoModal';
import Pagination from './components/Pagination';
import DatePicker from './components/DatePicker';
import useFetchVideos from './hooks/useFetchVideos';
import useFavorites from './hooks/useFavorites';
import logo from './assets/logo.svg';

const App = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = 4;
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);
  const defaultStartDate = last30Days.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(today);

  const { videos, loading, error, setShouldFetch } = useFetchVideos(startDate, endDate);
  const { favorites, toggleFavorite, removeFavorite } = useFavorites();

  useEffect(() => {
      console.log("Videos state in App before filtering:", videos);
  }, [videos]);

    // ✅ Reset pagination when switching favorites
  useEffect(() => {
    setCurrentPage(1);
  }, [showFavorites]);

  

  const filteredVideos = useMemo(() => {
    if (showFavorites) {
      return favorites.filter(video =>
        video?.snippet?.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return videos.filter(video =>
      video?.snippet?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [videos, searchTerm, showFavorites, favorites]);
  

  const totalPages = useMemo(() => {
    const totalVideos = showFavorites ? favorites.length : filteredVideos.length;
    return Math.max(1, Math.ceil(totalVideos / videosPerPage));
  }, [filteredVideos, favorites, showFavorites, videosPerPage]);

const paginatedVideos = useMemo(() => {
  const totalVideos = showFavorites ? favorites : filteredVideos;
  const totalPages = Math.ceil(totalVideos.length / videosPerPage);

  if (currentPage > totalPages) {
    setCurrentPage(1); // ✅ Reset page if out of range
  }

  const startIndex = (currentPage - 1) * videosPerPage;
  return totalVideos.slice(startIndex, startIndex + videosPerPage);
}, [filteredVideos, favorites, showFavorites, currentPage]);


  const handleDateChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    setShouldFetch(true);
  };

  const handleRefresh = () => {
    console.log("Refreshing videos...");
    localStorage.removeItem('nbaVideos');
    localStorage.removeItem('lastFetchTime'); // ✅ Clear fetch timestamp
    setShouldFetch(true);
};

  if (loading) {
    return (
      <div className="app">
        <h1>Highlight Reel</h1>
        <p>Loading videos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <h1>Highlight Reel</h1>
        <p style={{ color: 'red' }}>⚠️ {error}</p>
        <button onClick={handleRefresh}>Retry</button>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <img src={logo} alt="Highlight Reel Logo" className="logo" />
        <h1>Highlight Reel</h1>
      </header>
      <DatePicker onDateChange={handleDateChange} />
      <SearchBar onSearch={setSearchTerm} />

      <button
        className="toggle-favorites"
        onClick={() => {
          setShowFavorites(!showFavorites);
          setCurrentPage(1); // ✅ Reset pagination when toggling favorites
        }}
      >
        {showFavorites ? "Show All Videos" : "Show Favorites"}
      </button>


      {showFavorites && <p>Click ❌ to remove videos from favorites.</p>}

      <button className="refresh-button" onClick={handleRefresh}>Refresh Videos</button>

      <div className="video-list">
        {paginatedVideos.length > 0 ? (
        paginatedVideos.map((video) => {
          const videoId = video.id.videoId || video.id; // Ensure consistency

          return (
              <VideoCard 
                key={video.id.videoId || video.id} 
                video={video} 
                onClick={() => setSelectedVideo(video)}
                isFavorite={favorites.some((fav) => fav.id === (video.id.videoId || video.id))}
                toggleFavorite={toggleFavorite}
                removeFavorite={removeFavorite}
                isFavoritesView={showFavorites}
              />
          );
        })
      ) : (
        <p>No videos found. Try adjusting the search or date range.</p>
      )}

      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      <VideoModal video={selectedVideo} isOpen={!!selectedVideo} onClose={() => setSelectedVideo(null)} />
    </div>
  );
};

export default App;
