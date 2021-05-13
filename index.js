const express = require("express");
const morgan = require("morgan");
const path = require("path");
const mongoose = require("mongoose");
const passport = require("passport");
const cookieParser = require("cookie-parser");

const config = require("./bin/config");
const authenticate = require("./authenticate");

const userRouter = require("./routes/userRouter");
const portfolioRouter = require("./routes/portfolioRouter");

const app = express();

const connect = mongoose.connect(config.URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(config.secretKey));

app.use(passport.initialize());

app.use(express.static(__dirname + "/public"));

//
app.use("/users", userRouter);
app.use("/portfolios", portfolioRouter);

connect.then(
  (db) => console.log("Connected correctly to db"),
  (err) => console.log(err)
);

module.exports = app;
