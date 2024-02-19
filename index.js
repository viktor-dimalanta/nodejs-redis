const express = require('express');
const axios = require('axios');
const redis = require('redis');

const app = express();
const port = 3000;

// Create a Redis client
const client = redis.createClient({
    legacyMode: true
});

// Perform Redis operations
client.set('key', 'value', (err, reply) => {
    if (err) {
        console.error('Error setting Redis key:', err);
    } else {
        console.log('Redis key set:', reply);
        // Continue with other Redis operations...
    }
});

// Define a middleware function to check cache before fetching from the API
function cacheMiddleware(req, res, next) {
    const cacheKey = req.originalUrl; // Use request URL as cache key
    // Check if data is cached in Redis
    client.get(cacheKey, (err, data) => {
        if (err) throw err;

        if (data !== null) {
            // If data is found in cache, send it
            res.send(JSON.parse(data));
        } else {
            // If data is not found in cache, call the next middleware
            next();
        }
    });
}

// Define a route that fetches weather data from the OpenWeather API and caches it
app.get('/weather/:city', cacheMiddleware, async (req, res) => {
    try {
        const city = req.params.city;
        // Fetch data from the OpenWeather API
        const apiKey = '3112fa80a027dc13663e30c279bd6dbc';
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        const response = await axios.get(apiUrl);
        const data = response.data;
        // Cache the fetched data in Redis
        client.setex(req.originalUrl, 300, JSON.stringify(data)); // Cache for 5 minutes (300 seconds)
        res.json(data);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            res.status(404).json({ error: 'City not found' });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

// Close the Redis client connection when done
client.quit((err) => {
    if (err) {
        console.error('Error closing Redis client:', err);
    } else {
        console.log('Redis client closed');
    }
});
// Start the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
