const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors())
app.use(bodyParser.json());

// Define your Space-Track credentials
const loginData = new FormData();
loginData.append("identity", "username");
loginData.append("password", "password");

// Space-Track base URL
const spaceTrackBaseUrl = 'https://www.space-track.org';

let isLoggedIn = false;

// Route to log in and fetch satellite data
app.post('/fetch-debris', async (req, res) => {

    try {
        if (!isLoggedIn) {
            // Log in to space-track.org
            const loginResponse = await axios.post(`${spaceTrackBaseUrl}/ajaxauth/login`, loginData, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (loginResponse.status === 200) {
                console.log('Login successful');
                cookie = loginResponse.headers['set-cookie'];
                isLoggedIn = true;
            } else {
                return res.status(401).json({ error: 'Login failed' });
            }
        }

        // Fetch satellite data from Space-Track
        const url = req.body.url;

        // Pass satellite group from the request body
        const satelliteDataResponse = await axios.get(url, {
            maxBodyLength: Infinity,
            headers: { 'Cookie': cookie }
        });
        console.log(satelliteDataResponse.data)

        // Log out from space-track.org after the data is fetched
        const logoutResponse = await axios.get(`${spaceTrackBaseUrl}/ajaxauth/logout`, {
            headers: { 'Cookie': cookie }
        });
        console.log(logoutResponse.data);
        isLoggedIn = false;

        // Send satellite data back to client
        return res.json(satelliteDataResponse.data);

    } catch (error) {
        console.error('Error fetching satellite data:', error);
        res.status(500).json({ error: 'Error fetching satellite data' });
    }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});