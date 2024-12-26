const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const userRouter = require("./routes/user");
const groupRouter = require("./routes/group");
const eventsRouter = require("./routes/events");
const paymentRoutes = require("./routes/payments");

const path = require("path");

dotenv.config();

const app = express();
const formatsLogger = app.get("env") === "development" ? "dev" : "short";

// CORS options
const corsOptions = {
  origin: ["https://uken.netlify.app", "http://localhost:3000"],
  optionsSuccessStatus: 200,
};

// Swagger configuration
const swaggerDocument = require("./swaggerConfig.json");
const swaggerJsdocOptions = {
  definition: swaggerDocument, // Use JSON config
  apis: ["./routes/*.js"], // Include API annotations
};
const swaggerSpec = swaggerJsdoc(swaggerJsdocOptions);

// Swagger UI options
const swaggerUiOptions = {
  customCssUrl: "/theme-material.css", // Ensure this file is accessible
};

// Middleware
app.use(cors(corsOptions));
app.use(logger(formatsLogger));
app.use(express.json());

// Serve static files (including custom CSS for Swagger)
app.use(express.static(path.join(__dirname, "public")));

// Swagger documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, swaggerUiOptions)
);

// Favicon
app.get("/favicon.ico", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "favicon.ico"))
);

// Default route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Ukenback API" });
});

// Routes
app.use("/users/", userRouter);
app.use("/groups/", groupRouter);
app.use("/events/", eventsRouter);
app.use("/api/payment/", paymentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

// Error handler
app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

module.exports = app;
