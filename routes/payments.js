const crypto = require("crypto");
const express = require("express");
const router = express.Router();

const publicKey = "sandbox_i12268588677"; // Замените на свой publicKey
const privateKey = "sandbox_93roLVYVFi02op5MIGUTNx1xBzhOf7Vpvsa6LxMF"; // Замените на свой privateKey

router.post("/create-payment", (req, res) => {
  const { amount, currency, description, order_id } = req.body;

  const paymentData = {
    version: 3,
    public_key: publicKey,
    action: "pay",
    amount,
    currency,
    description,
    order_id,
    result_url: "https://uken.netlify.app//users/payments/success", // адрес фронтенда для возврата пользователя
    server_url: "https://ukenback.vercel.app/api/payment/liqpay-callback",
  };

  const data = Buffer.from(JSON.stringify(paymentData)).toString("base64");
  const signature = crypto
    .createHash("sha1")
    .update(privateKey + data + privateKey)
    .digest("base64");

  res.json({ data, signature });
});

router.post('/liqpay-callback', (req, res) => {
    const { data, signature } = req.body;

    const generatedSignature = crypto.createHash('sha1')
        .update(privateKey + data + privateKey)
        .digest('base64');

    if (generatedSignature === signature) {
        const decodedData = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
        console.log('Payment Status:', decodedData.status);
        res.status(200).send('OK');
    } else {
        res.status(400).send('Invalid signature');
    }
});
module.exports = router;
