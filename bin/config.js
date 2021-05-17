module.exports = {
  PORT: normalizePort(process.env.PORT || 3000),
  HOST: "localhost",
  URL: "mongodb://localhost:27017/portfolios",
  secretKey: "123-456-abc",
};

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }

  return false;
}
