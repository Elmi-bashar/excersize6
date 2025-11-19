const express = require("express");
const app = express();
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const { router: dataRouter, verifyToken } = require("./api/data");
const homeRouter = require("./api/home");
const indexRouter = require("./api/index");
const loginRouter = require("./api/login"); 
const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: "Too many login attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(express.json());

// Routes
app.use("/", homeRouter);
app.use("/index", indexRouter);
app.use("/data", verifyToken, dataRouter);
app.use("/login", loginRouter);

// Swagger
const swaggerDocument = YAML.load("./openapi.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
