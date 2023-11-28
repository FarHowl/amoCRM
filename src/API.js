const express = require("express");
const axios = require("axios");
const cache = require("./Utils/MemoryCache");
const router = express.Router();

const authorizeOAuth2 = require("./Utils/AuthorizeOAuth2");

// Requirement to make possible to provide .env secrets
require("dotenv").config();

// Initial route that listens for widget start up
router.get("/", async (req, res) => {
    try {
        const code = req?.query?.code;

        if (code) {
            cache.set("authCode", code, 60 * 20);

            // Authorize with OAuth2 and save the access and refresh tokens
            authorizeOAuth2();

            res.status(200).send({ message: "Successfull authorization!" });
            console.log("Success");
        } else throw new Error("There was no code provided");
    } catch (error) {
        res.status(500).send({ status: 500, timestamp: new Date(), error });
    }
});

router.get("/initContact", async (req, res) => {
    try {
        const name = req?.query?.name;
        const email = req?.query?.email;
        const phone = req?.query?.phone;

        if (!name || !email || !phone) throw new Error("Please, enter all fields");

        const accessToken = cache.get("access_token");
        if (!accessToken) {
            authorizeOAuth2();
        }
        const query = "?query=" + phone;

        // Trying to search any contacts in amoCRM
        const searchResponse = await axios.get(process.env.AMO_URL + "/api/v4/contacts" + query, {
            headers: { Authorization: "Bearer " + accessToken },
        });

        let client_id;
        // Create new contact if it does not exist
        if (!searchResponse.data) {
            const createContactResponse = await axios.post(
                process.env.AMO_URL + "/api/v4/contacts",
                    {
                        name,
                        email,
                        phone,
                    },
                {
                    headers: {
                        Authorization: "Bearer " + accessToken,
                    },
                }
            );
            client_id = createContactResponse.data._embedded.contacts[0].id;
        }
        // Update the contact
        else {
            const updateContactResponse = await axios.patch(
                process.env.AMO_URL + "/api/v4/contacts" + "/{" + client_id + "}",
                {
                    id: client_id,
                    custom_fields_values: [
                        {
                            name,
                            email,
                            phone,
                        },
                    ],
                },
                {
                    headers: { Authorization: "Bearer " + accessToken },
                }
            );
            client_id = updateContactResponse.data._embedded.contacts[0].id;
        }

        // Create lead
        const createLeadResponse = await axios.post(
            process.env.AMO_URL + "/api/v4/leads",
            [
                {
                    name: "Сделка для примера",
                    created_by: client_id,
                    price: 20000,
                },
            ],
            {
                headers: { Authorization: "Bearer " + accessToken },
            }
        );
    } catch (error) {
        // res.status(500).send({ status: 500, timestamp: new Date(), error });
        console.log(error.response.data["validation-errors"][0].errors);
    }
});

module.exports = router;
