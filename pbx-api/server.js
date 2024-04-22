const express = require("express");
const bodyParser = require("body-parser");
const errorHandler = require("express-json-errors");
const cors = require("cors");
const compression = require("compression");
var path = require("path");
const config = require("./config/app.js");
const routes = require("./routes");
const middlewareErrorParser = require("./middleware/ErrorParser");
const middlewarePathLogger = require("./middleware/PathLogger");
const imageController = require("./controllers/uploader.js");
const promptUpload = require("./controllers/promptsUpload.js");
const importExcelController = require("./controllers/importExcel.js");
const invoice_automate = require("./controllers/invoice_automate.js");
const cronPackage = require("./controllers/cron_package.js");
const profileUpload = require("./controllers/profileUpload");
const app = express();
app.options("*", cors());
app.use(cors({ credentials: true, origin: true }));
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ type: "application/json" }));
app.use(express.urlencoded({ extended: false }));
app.use(imageController);
app.use(promptUpload);
app.use(importExcelController);
app.use(invoice_automate);
app.use(cronPackage);
app.use(profileUpload);

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", process.env.APP_URL);
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

// only on debug mode
if (config.debug) {
  // path logger
  app.use(middlewarePathLogger);
}

// use routes
app.use("/", routes);
app.use(middlewareErrorParser);
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");
app.set("view engine", "ejs");
app.use(express.static("app"));
app.use("/assets/uploads", express.static("assets/uploads"));

// app.use(express.static("app"));
app.use(express.static("app"));
// app.use("/assets", express.static("assets"));
app.use("/assets/uploads", express.static("assets/uploads"));
// app.use("/app/assets/uploads", express.static("uploads"));
// app.use("/uploads", express.static("uploads"));
// app.use(express.static(path.join(__dirname, "/app/assets/uploads")));
// Start server
app.listen(config.port, () => {
  console.log(
    "Express server listening on %d, in %s mode",
    config.port,
    app.get("env")
  );
});

// Expose app
module.exports = app;
