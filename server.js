const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function normalizePhone(phone) {
  phone = phone.replace(/\D/g, "");

  if (phone.startsWith("0")) {
    return "254" + phone.substring(1);
  }

  if (phone.startsWith("254")) {
    return phone;
  }

  return phone;
}

async function sendSTK(phone, amount, reference, description) {
  try {

    const payload = {
      payment_account_id: parseInt(process.env.PAYMENT_ACCOUNT_ID),
      phone,
      amount,
      reference,
      description
    };

    const response = await axios.post(
      "https://optimapaybridge.co.ke/api/v2/stkpush.php",
      payload,
      {
        headers: {
          "X-API-Key": process.env.API_KEY,
          "X-API-Secret": process.env.API_SECRET,
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );

    return {
      success: true,
      phone,
      response: response.data
    };

  } catch (error) {

    return {
      success: false,
      phone,
      error: error.response?.data || error.message
    };
  }
}

app.post("/bulk-stk", async (req, res) => {

  const {
    numbers,
    amount,
    reference,
    description
  } = req.body;

  if (!numbers || !Array.isArray(numbers)) {
    return res.status(400).json({
      success: false,
      message: "Numbers array required"
    });
  }

  const results = [];

  for (const rawPhone of numbers) {

    const phone = normalizePhone(rawPhone);

    const result = await sendSTK(
      phone,
      amount,
      reference,
      description
    );

    results.push(result);

    await delay(2000);
  }

  res.json({
    success: true,
    total: results.length,
    results
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running...");
});
