const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
require('dotenv').config();

const app = express();

// This must be cors() with parentheses and BEFORE routes
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173'
})); 

// Optional: allow preflight requests
app.options('*', cors());

const PORT = process.env.PORT || 5001;
const API_KEY = process.env.YOUTUBE_API_KEY;

// Basic Rate Limiting (per IP)
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({
      error: 'Too many requests. Please try again in a moment.'
    });
  }
});

app.use('/api', limiter);

// In-memory cache per-request.
const cache = new Map();
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

app.get('/api/videos', async (req, res) => {
    const { q, channelId, publishedAfter, publishedBefore, pageToken } = req.query;
    
    const cacheKey = `${q}-${channelId}-${publishedAfter}-${publishedBefore}-${pageToken}`;
    const now = Date.now();

    // Serve from cache if available and fresh.
    if (cache.has(cacheKey)) {
        const { data, timestamp } = cache.get(cacheKey);
        if (now - timestamp < CACHE_DURATION) {
        console.log('✅ Serving from cache:', cacheKey);
        return res.json(data);
        }
    }

    try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                part: 'snippet',
                type: 'video',
                maxResults: 30,
                key: API_KEY,
                q,
                channelId,
                publishedAfter,
                publishedBefore,
                pageToken
            }
        });

        const data = response.data;

        cache.set(cacheKey, { data, timestamp: now });
        console.log('📡 Fetched and cached:', cacheKey);

        res.json(data);

    } catch (error) {
        console.error('❌ YouTube API Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch data from YouTube API' });
    }
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
