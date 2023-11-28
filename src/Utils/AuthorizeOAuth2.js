const axios = require("axios");
const cache = require("./MemoryCache")

// To make it possible to provide .env secrets
require("dotenv").config();

const authorizeOAuth2 = async () => {
    try {
        const code = cache.get("authCode");
        if (!code) throw new Error("There is no authorization code in memory");

        const response = await axios.post(process.env.AMO_URL + "/oauth2/access_token", {
            client_id: process.env.INTEGRATION_ID,
            client_secret: process.env.SECRET_KEY,
            grant_type: "authorization_code",
            code,
            redirect_uri: process.env.REDIRECT_URI,
        });

        cache.set("access_token", response.data.access_token, 86400);
        cache.set("refresh_token", response.data.access_token, 60 * 60 * 24 * 90);
    } catch (error) {
        throw error;
    }
};

module.exports = authorizeOAuth2;
