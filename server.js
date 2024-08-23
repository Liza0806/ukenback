const mongoose = require("mongoose");
const app = require("./app");
const { DB_HOST } = require("./config");

mongoose.connect(DB_HOST).then(() => {
  console.log("Database connect success");
}).catch((error) => {
  console.log(error.message, "error");
  process.exit(1);
});

module.exports = (req, res) => {
  app(req, res);  // Передаем запрос и ответ в Express приложение
};



// const mongoose = require("mongoose");
// const app = require("./app");
// const { DB_HOST } = require("./config");

// const PORT = 3201;
// mongoose
//   .connect(DB_HOST)
//   .then(() => {
//     app.listen(PORT, () => {
//       console.log("Server running. Use our API on port: 3001");
//     });
//     console.log("Database connect success");
//   })
//   .catch((error) => {
//     console.log(error.message, "error");
//     process.exit(1);
//   });
