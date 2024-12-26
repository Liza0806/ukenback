const crypto = require("crypto");
const express = require("express");
const router = express.Router();

const publicKey = "sandbox_i12268588677"; // Замените на свой publicKey
const privateKey = "sandbox_93roLVYVFi02op5MIGUTNx1xBzhOf7Vpvsa6LxMF"; // Замените на свой privateKey
/**
 * @swagger
 * /create-payment:
 *   post:
 *     summary: Создать платеж через LiqPay
 *     description: Создает платежные данные для LiqPay, включая подпись и возвращает их клиенту.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Сумма платежа
 *               currency:
 *                 type: string
 *                 description: Валюта платежа (например, USD, UAH)
 *               description:
 *                 type: string
 *                 description: Описание платежа
 *               order_id:
 *                 type: string
 *                 description: Уникальный идентификатор заказа
 *     responses:
 *       200:
 *         description: Успешно возвращены данные платежа.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: string
 *                   description: Закодированные данные платежа
 *                 signature:
 *                   type: string
 *                   description: Подпись данных платежа
 */
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
    result_url: "https://uken.netlify.app/payments/success",
    server_url: "https://ukenback.vercel.app/api/payment/liqpay-callback",
  };
  const data = Buffer.from(JSON.stringify(paymentData)).toString("base64");
  const signature = crypto
    .createHash("sha1")
    .update(privateKey + data + privateKey)
    .digest("base64");

  res.json({ data, signature });
});

/**
 * @swagger
 * /liqpay-callback:
 *   post:
 *     summary: Обработчик callback уведомлений от LiqPay
 *     description: Проверяет подпись и обрабатывает уведомления о статусе платежа от LiqPay.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: string
 *                 description: Закодированные данные платежа
 *               signature:
 *                 type: string
 *                 description: Подпись данных
 *     responses:
 *       200:
 *         description: Уведомление успешно обработано.
 *       400:
 *         description: Недействительная подпись.
 */
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
