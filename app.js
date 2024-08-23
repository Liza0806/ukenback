const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");
const userRouter = require("./routes/user");
const groupRouter = require("./routes/group");
const eventsRouter = require("./routes/events");

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

dotenv.config();
app.use("/users/", userRouter);
app.use("/groups/", groupRouter);
app.use("/events/", eventsRouter);
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

module.exports = app;
