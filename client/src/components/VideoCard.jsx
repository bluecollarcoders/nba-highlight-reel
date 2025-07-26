import React from 'react';

function VideoCard({ video, onClick, isFavorite, toggleFavorite, removeFavorite, isFavoritesView }) {
  const videoId = video.id; // Now `id` is correctly set in useFetchVideos.js
  const thumbnailUrl = video?.snippet?.thumbnails?.medium?.url || "fallback-image.jpg"; // ✅ Prevent errors


    return (
        <div className='video-card'>
            <img
                src={thumbnailUrl}
                alt={video.snippet.title}
                onClick={onClick}
            />
            <h3>{video.snippet.title}</h3>
            <div className='video-actions'>
                {!isFavoritesView ? (
                    <button onClick={() => toggleFavorite(video)} className={isFavorite ? 'favorite active' : 'favorite'}>
                        {isFavorite ? '⭐ Favorited' : '☆ Favorite'}
                    </button>
                ) : (
                    <button onClick={() => removeFavorite(videoId)} className="remove-favorite">
                        ❌ Remove
                    </button>
                )}
            </div>
        </div>
    );
}

export default VideoCard;
