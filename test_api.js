const jwt = require('jsonwebtoken');
require('dotenv').config();

const token = jwt.sign(
    { id: "651a3a1b2c3d4e5f60718290", role: "admin" }, // Nhut Tan
    process.env.JWT_SECRET || 'ute_social_network_secret',
    { expiresIn: '1h' }
);

fetch('http://localhost:5000/api/chat/conversations', {
    headers: { Authorization: `Bearer ${token}` }
}).then(res => res.json()).then(data => {
    console.log("Data type:", Array.isArray(data) ? "Array" : typeof data);
    console.log("Data:", data);
}).catch(err => {
    console.error("Error:", err);
});
