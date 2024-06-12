const mongoose = require("mongoose");
const app = require("./app");
const { DB_HOST } = require("./config");

const PORT = 3001;
mongoose
  .connect(DB_HOST)
  .then(() => {
    app.listen(PORT, () => {
      console.log("Server running. Use our API on port: 3001");
    });
    console.log("Database connect success");
  })
  .catch((error) => {
    console.log(error.message, "error");
    process.exit(1);
  });
