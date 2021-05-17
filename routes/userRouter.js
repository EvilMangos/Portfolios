const express = require("express");
const passport = require("passport");

const User = require("../models/users");
const Portfolios = require("../models/portfolios");
const authenticate = require("../authenticate");

const imageRouter = require("./imageRouter");

const userRouter = express.Router();

userRouter.route("/signup").post((req, res, next) => {
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader("Context-Type", "application/json");
        res.json({ err: err });
      } else {
        if (req.body.firstname) user.firstname = req.body.firstname;
        if (req.body.lastname) user.lastname = req.body.lastname;
        user.save((err, user) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader("Context-Type", "application/json");
            res.json({ err: err });
          }
        });

        passport.authenticate("local")(req, res, () => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json({
            success: true,
            status: "Registration successfull",
          });
        });
      }
    }
  );
});

userRouter
  .route("/login")
  .post(passport.authenticate("local"), (req, res, next) => {
    const token = authenticate.getToken({ _id: req.user._id });
    res.setHeader("Content-Type", "application/json");
    res.json({
      success: true,
      token: token,
      status: "You are successfully logged in!",
    });
  });

userRouter.use("/:userId/portfolios", imageRouter);

userRouter.get("/:userId/portfolios", (req, res, next) => {
  console.log(req.params.userId);
  User.findById(req.params.userId)
    .then(
      (user) => {
        if (user != null) {
          Portfolios.find({ author: req.params.userId })
            .then(
              (portfolios) => {
                res.statusCode = 200;
                res.setHeader("Context-Type", "json");
                res.json(portfolios);
              },
              (err) => next(err)
            )
            .catch((err) => next(err));
        } else {
          err = new Error(`User ${req.params.userId} + not found`);
          err.statusCode = 404;
          return next(err);
        }
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
});

module.exports = userRouter;
