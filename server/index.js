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

app.use(limiter);

// Caching in-memory.
let cachedReponse = null;
let lastFetched = 0;
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

app.get('/api/videos', async (req, res) => {
    const { q, channelId, publishedAfter, publishedBefore, pageToken } = req.query;

    const now = Date.now();
    if (cachedReponse && now - lastFetched < CACHE_DURATION) {
        console.log('Serving from cache');
        return res.json(cachedReponse);
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

        cachedReponse = response.data;
        lastFetched = Date.now();
        console.log('📡 Fetched from YouTube API');
        res.json(response.data);

    } catch (error) {
        console.error('Error fetching from YouTube API:', error.message);
        res.status(500).json({ error: 'Failed to fetch data from YouTube API' });
    }
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
