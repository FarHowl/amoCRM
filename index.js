const express = require("express");

// Axios for making requests
const axios = require("axios");

const router = require("./src/API");

// Server settings
const app = express();
const port = 80;
app.use(express.json());
app.use("", router);

app.listen(port, () => {
    console.log("I am alive");
});
