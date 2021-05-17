const https = require("https");
const fs = require("fs");

const app = require("../index");
const config = require("./config");

app.set("secPort", config.PORT + 443);

const options = {
  key: fs.readFileSync(__dirname + "/key.pem"),
  cert: fs.readFileSync(__dirname + "/cert.pem"),
};

var secureServer = https.createServer(options, app);

secureServer.listen(app.get("secPort"));

secureServer.on("error", onError);
secureServer.on("listening", onListening);

function onListening() {
  console.log("Server listening on port " + secureServer.address().port);
}

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  switch (error.code) {
    case "EACCES":
      console.error(
        "Port " + secureServer.address().port + " requires elevated privileges"
      );
      process.exit(1);
    case "EADDRINUSE":
      console.error(
        "Port " + secureServer.address().port + " is already in use"
      );
      process.exit(1);
    default:
      throw error;
  }
}
