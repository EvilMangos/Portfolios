const express = require("express");

const Portfolios = require("../models/portfolios");
const authenticate = require("../authenticate");

const imageRouter = require("./imageRouter");

const portfolioRouter = express.Router();

portfolioRouter.use(imageRouter);

portfolioRouter
  .route("/")
  .get((req, res, next) => {
    Portfolios.find({})
      .populate("image.comments.author")
      .then(
        (Portfolios) => {
          res.statusCode = 200;
          res.setHeader("Context-Type", "application/json");
          res.json(Portfolios);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    req.body.author = req.user._id;
    if (!req.body.image.comments) {
      Portfolios.create(req.body)
        .then(
          (portfolio) => {
            console.log("Portfolio created: ", portfolio);
            res.statusCode = 200;
            res.setHeader("Context-Type", "application/json");
            res.json(portfolio);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    } else {
      err = new Error(`Bad request`);
      err.statusCode = 400;
      return next(err);
    }
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.setHeader("Context-Type", "text");
    res.end("PUT operation is not supported on /portfolios");
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Portfolios.remove({})
      .then(
        (resp) => {
          res.statusCode = 200;
          res.setHeader("Context-Type", "application/json");
          res.json(resp);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

portfolioRouter
  .route("/:portfolioId")
  .get((req, res, next) => {
    Portfolios.findById(req.params.portfolioId)
      .populate("image.comments.author")
      .then(
        (portfolio) => {
          res.statusCode = 200;
          res.setHeader("Context-Type", "json");
          res.json(portfolio);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.setHeader("Context-Type", "text");
    res.end(
      `POST operation is not supported on /portfolios/${req.params.portfolioId}`
    );
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    Portfolios.findById(req.params.portfolioId)
      .then(
        (portfolio) => {
          if (
            portfolio != null &&
            portfolio.author == req.user._id &&
            !req.body.image.comments
          ) {
            req.body.author = req.user._id;
            Portfolios.findByIdAndUpdate(
              req.params.portfolioId,
              { $set: req.body },
              { new: true }
            )
              .then(
                (portfolio) => {
                  res.statusCode = 200;
                  res.setHeader("Context-Type", "json");
                  res.json(portfolio);
                },
                (err) => next(err)
              )
              .catch((err) => next(err));
          } else if (portfolio == null) {
            err = new Error(`Portfolio ${req.params.portfolioId} not found`);
            err.statusCode = 404;
            return next(err);
          } else if (portfolio.author != req.user._id) {
            err = new Error(
              `Not allowed to change /portfolios/${req.params.portfolioId}`
            );
            err.statusCode = 403;
            return next(err);
          } else {
            err = new Error(`Bad request`);
            err.statusCode = 400;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    if (portfolio.author == req.user._id) {
      Portfolios.findByIdAndRemove(req.params.portfolioId)
        .then(
          (resp) => {
            res.statusCode = 200;
            res.setHeader("Context-Type", "json");
            res.json(resp);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    } else {
      err = new Error(
        `Not allowed to delete /portfolios/${req.params.portfolioId}`
      );
      err.statusCode = 403;
      return next(err);
    }
  });

module.exports = portfolioRouter;
