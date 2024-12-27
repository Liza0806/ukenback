const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerUiDist = require('swagger-ui-dist');
const pathToSwaggerUi = require('swagger-ui-dist').absolutePath()

const userRouter = require("./routes/user");
const groupRouter = require("./routes/group");
const eventsRouter = require("./routes/events");
const paymentRoutes = require("./routes/payments");

const app = express();
const path = require("path");
const formatsLogger = app.get("env") === "development" ? "dev" : "short";

const corsOptions = {
  origin: ["https://uken.netlify.app", "http://localhost:3000"], // разрешённые домены
  optionsSuccessStatus: 200,
};

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API документация',
      version: '1.0.0',
      description: 'Описание API',
    },
  },
  apis: ['./routes/*.js'], 
};
app.use(express.static(pathToSwaggerUi))
const swaggerSpec = swaggerJsdoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCssUrl: './public/swagger-ui-theme/theme-material.css',
}));

app.use(cors(corsOptions));
app.use(logger(formatsLogger));
app.use(express.json());

dotenv.config();
app.use(express.static(path.join(__dirname, "public")));
app.get("/favicon.ico", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "favicon.ico"))
);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Ukenback API" });
});

app.use("/users/", userRouter);
app.use("/groups/", groupRouter);
app.use("/events/", eventsRouter);
app.use("/api/payment/", paymentRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

module.exports = app;
