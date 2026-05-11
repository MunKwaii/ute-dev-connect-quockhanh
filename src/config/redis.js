const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log('Connected to Redis successfully!');
    } catch (error) {
        console.error('Could not connect to Redis:', error);
    }
}

// Gọi hàm kết nối
connectRedis();

module.exports = redisClient;
