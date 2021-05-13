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

secureServer.listen(app.get("secPort"), config.HOST, () => {
  console.log(
    `Server listening on https://${config.HOST}:${app.get("secPort")}`
  );
});
