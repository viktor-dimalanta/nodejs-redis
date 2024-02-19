We use Express to create a simple web server.
We use Axios to make HTTP requests to the OpenWeather API.
We use Redis to cache the API response.
We define a middleware function cacheMiddleware to check if the response for a given URL is present in the Redis cache. If it is, we send the cached data as the response. If not, we call the next middleware, which is the route handler.
In the route handler, we fetch the weather data from the OpenWeather API based on the city specified in the request parameters (:city). We use the req.originalUrl as the cache key to ensure caching based on the request URL.
We cache the fetched data in Redis using the client.setex method with an expiration time of 5 minutes (300 seconds).
We handle errors from the OpenWeather API, such as when a city is not found or when there's a server error, and return appropriate HTTP status codes and error messages.
