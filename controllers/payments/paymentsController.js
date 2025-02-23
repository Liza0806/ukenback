const mongoose = require("mongoose");
const { Payment } = require("../../models/paymentModel");

const getAllPayments = async (req, res) => {
  try {
    const data = await Payment.find({});
    res.json(data); // Статус 200 по умолчанию
  } catch (error) {
    console.error(error, "error");
    res.status(500).json({ message: `Error getting groups: ${error.message}` });
  }
};

module.exports = {
    getAllPayments
  };
  