const express = require('express');
const router = express.Router()
const validateBody = require('../middlevares/vaidateBody')
const {schemas} = require('../models/groupModel')
const controllers =require('../controllers/payments/paymentsController');

router.get("/", controllers.getAllPayments);

router.post('/liqpay-callback', (req, res) => {
  const { data, signature } = req.body;

  if (!data || !signature) {
    return res.status(400).send('Invalid data or signature');
  }

  const generatedSignature = crypto.createHash('sha1')
    .update(privateKey + data + privateKey)
    .digest('base64');

  if (generatedSignature === signature) {
    try {
      const decodedData = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
      
      // Пример записи в БД, если нужно сохранять платеж
      Payment.create({
        userId: decodedData.user_id,
        amount: decodedData.amount,
        date: new Date(),
        method: decodedData.method,
        status: decodedData.status,
        order_id: decodedData.order_id,
        groupId: decodedData.group_id,
        period: decodedData.period,
        comment: decodedData.comment,
        discount: decodedData.discount,
        coach: decodedData.coach,
      });

      console.log('Payment Status:', decodedData.status); // Печать статуса в консоль (для логирования)
      res.status(200).send('OK');
    } catch (error) {
      console.error('Error decoding data:', error);
      res.status(400).send('Invalid data format');
    }
  } else {
    res.status(400).send('Invalid signature');
  }
});
module.exports = router