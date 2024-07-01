const express = require("express");
const axios = require("axios");
const app = express();
const cors = require("cors");
app.use(cors());
const username = "joshseo0628@gmail.com";
const password = "xujinge20020628!";
const appKey = "bmb3ol4iV11rKxPA";
// Function to get session token
async function getSessionToken() {
  try {
    const response = await axios.post(
      "https://identitysso.betfair.com/api/login",
      new URLSearchParams({
        username,
        password,
      }),
      {
        headers: {
          "X-Application": appKey,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (response.status === 200 && response.data.token) {
      return response.data.token;
    } else {
      throw new Error(
        `Failed to get session token: ${response.status} ${response.data}`
      );
    }
  } catch (error) {
    console.error("Error getting session token:", error);
    throw error;
  }
}

// Function to get market catalogue
async function getMarketCatalogue(sessionToken) {
  const apiEndpoint =
    "https://api.betfair.com/exchange/betting/rest/v1.0/listMarketCatalogue/";

  const requestBody = {
    filter: {
      eventTypeIds: ["7"], // EventTypeId for horse racing
      marketCountries: [""], // Country code for Great Britain
      marketTypeCodes: ["WIN"], // Market type for WIN
      // marketStartTime: {
      //   from: "2024-06-14T00:00:00Z",
      //   to: "2024-06-14T23:59:59Z",
      // },
    },
    maxResults: "100",
    marketProjection: ["EVENT", "COMPETITION", "RUNNER_METADATA"],
  };

  try {
    const response = await axios.post(apiEndpoint, requestBody, {
      headers: {
        "X-Application": appKey,
        "X-Authentication": sessionToken,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(
        `Failed to get market catalogue: ${response.status} ${response.data}`
      );
    }
  } catch (error) {
    console.error("Error getting market catalogue:", error);
    throw error;
  }
}
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/api/betting-data", async (req, res) => {
  try {
    const sessionToken = await getSessionToken();
    console.log("Session token:", sessionToken);

    const marketCatalogue = await getMarketCatalogue(sessionToken);

    res.json(marketCatalogue);
  } catch (error) {
    res.status(500).send("Error getting betting data");
  }
});
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
