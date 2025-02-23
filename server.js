const mongoose = require("mongoose");
const app = require("./app");
const { DB_HOST } = require("./config");
const { createEventsForNextMonth } = require('./scheduler');

mongoose.connect(DB_HOST).then(() => {
  console.log("Database connect success");
}).catch((error) => {
  console.log(error.message, "error");
  process.exit(1);
});
createEventsForNextMonth();

module.exports = (req, res) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  app(req, res);  // Передаем запрос и ответ в Express приложение
};


///////////////////////////////////////////////////////////////////////////////////
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


