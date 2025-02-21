"use strict";

const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Load API credentials from environment variables
const SHIPSTATION_API_KEY = process.env.SHIPSTATION_API_KEY;
const SHIPSTATION_API_SECRET = process.env.SHIPSTATION_API_SECRET;
const BASE_URL = "https://ssapi.shipstation.com/";

if (!SHIPSTATION_API_KEY || !SHIPSTATION_API_SECRET) {
  console.error("❌ ShipStation API credentials are missing.");
  process.exit(1);
}

// ✅ Function to generate Basic Auth header
const getAuthHeader = () => {
  return `Basic ${Buffer.from(
    `${SHIPSTATION_API_KEY}:${SHIPSTATION_API_SECRET}`
  ).toString("base64")}`;
};

app.post("/get-rates", async (req, res) => {
  const {
    weightValue,
    weightunits,
    fromPostalCode,
    toCountry,
    toState,
    toPostalCode,
    toCity,
  } = req.body;
  try {
    const requestData = {
      carrierCode: "fedex_walleted",
      serviceCode: null,
      packageCode: null,
      fromPostalCode: fromPostalCode,
      toState: toState,
      toCountry: toCountry,
      toPostalCode: toPostalCode,
      toCity: toCity,
      weight: {
        value: weightValue,
        units: weightunits,
      },
      // dimensions: {
      //   units: "inches",
      //   length: 7,
      //   width: 5,
      //   height: 6,
      // },
      confirmation: "delivery",
      residential: false,
    };
    // ✅ Make API request to ShipStation
    const response = await axios.post(
      `${BASE_URL}shipments/getrates`,
      requestData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: getAuthHeader(),
        },
      }
    );

    // ✅ Send response back to client
    res.json(response.data);
  } catch (error) {
    console.error(
      "❌ Error fetching shipping rates:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: "Failed to get shipping rates",
      details: error.response?.data || error.message,
    });
  }
});

app.get("/get-carriers", async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}carriers`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(
          `${SHIPSTATION_API_KEY}:${SHIPSTATION_API_SECRET}`
        ).toString("base64")}`,
      },
    });
    console.log("Available Carriers:", response.data);
    res.status(200).json({ data: response.data });
  } catch (error) {
    console.error(
      "Error fetching carriers:",
      error.response?.data || error.message
    );
  }
});

// ✅ Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
