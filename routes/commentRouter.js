const express = require("express");

const Portfolios = require("../models/portfolios");
const authenticate = require("../authenticate");

const imageRouter = express.Router();

imageRouter
  .route("/:portfolioId/image/")
  .get((req, res, next) => {
    Portfolios.findById(req.params.portfolioId)
      .populate("image.comments.author")
      .then(
        (portfolio) => {
          if (portfolio != null) {
            res.statusCode = 200;
            res.setHeader("Context-Type", "json");
            res.json(portfolio.image);
          } else {
            err = new Error(`Portfolio ${req.params.portfolioId} not found`);
            err.statusCode = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.setHeader("Context-Type", "text");
    res.end(
      `POST operation is not supported on /portfolios/${req.params.portfolioId}/image`
    );
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    Portfolios.findById(req.params.portfolioId)
      .then(
        (portfolio) => {
          if (
            portfolio != null &&
            portfolio.author == req.user._id &&
            !req.body.comments
          ) {
            portfolio.image = req.body;
            portfolio
              .save()
              .then(
                (portfolio) => {
                  res.statusCode = 200;
                  res.setHeader("Context-Type", "json");
                  res.json(portfolio);
                },
                (err) => next(err)
              )
              .catch((err) => next(err));
          } else if (portfolio != null) {
            err = new Error(`Portfolio ${req.params.portfolioId} not found`);
            err.statusCode = 404;
            return next(err);
          } else if (portfolio.author == req.user._id) {
            err = new Error(
              `Not allowed to change portfolios/${req.params.portfolioId}/image`
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
    res.statusCode = 403;
    res.setHeader("Context-Type", "text");
    res.end(
      `DELETE operation is not supported on /portfolios/${req.params.portfolioId}/image`
    );
  });

imageRouter
  .route("/:portfolioId/image/comments")
  .get((req, res, next) => {
    Portfolios.findById(req.params.portfolioId)
      .populate("image.comments.author")
      .then(
        (portfolio) => {
          if (portfolio != null) {
            res.statusCode = 200;
            res.setHeader("Context-Type", "json");
            res.json(portfolio.image.comments);
          } else {
            err = new Error(`Portfolio ${req.params.portfolioId} not found`);
            err.statusCode = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    Portfolios.findById(req.params.portfolioId)
      .then((portfolio) => {
        if (portfolio != null) {
          req.body.author = req.user._id;
          portfolio.image.comments.push(req.body);
          portfolio
            .save()
            .then(
              (portfolio) => {
                Portfolios.findById(portfolio._id)
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
              },
              (err) => next(err)
            )
            .catch((err) => next(err));
        } else {
          err = new Error(`Portfolio ${req.params.portfolioId} not found`);
          err.statusCode = 404;
          return next(err);
        }
      })
      .catch((err) => next(err));
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.setHeader("Context-Type", "text");
    res.end(
      `PUT operation is not supported on /portfolios/${req.params.portfolioId}/image/comments`
    );
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Portfolios.findById(req.params.portfolioId)
      .then((portfolio) => {
        if (portfolio != null) {
          portfolio.image.comments.forEach((comment) => {
            portfolio.image.comments.id(comment._id).remove();
          });
          portfolio
            .save()
            .then(
              (portfolio) => {
                res.statusCode = 200;
                res.setHeader("Context-Type", "application/json");
                res.json(portfolio);
              },
              (err) => next(err)
            )
            .catch((err) => next(err));
        } else {
          err = new Error(`Portfolio ${req.params.portfolioId} not found`);
          err.statusCode = 404;
          return next(err);
        }
      })
      .catch((err) => next(err));
  });

imageRouter
  .route("/:portfolioId/image/comments/:commentId")
  .get((req, res, next) => {
    Portfolios.findById(req.params.portfolioId)
      .populate("image.comments.author")
      .then(
        (portfolio) => {
          if (
            portfolio != null &&
            portfolio.image.comments.id(req.params.commentId) != null
          ) {
            res.statusCode = 200;
            res.setHeader("Context-Type", "json");
            res.json(portfolio.image.comments.id(req.params.commentId));
          } else if (portfolio == null) {
            err = new Error(`Portfolio ${req.params.portfolioId} not found`);
            err.statusCode = 404;
            return next(err);
          } else {
            err = new Error(`Comment ${req.params.commentId} not found`);
            err.statusCode = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.setHeader("Context-Type", "text");
    res.end(
      `POST operation is not supported on /portfolios/${req.params.portfolioId}/image/comments/${req.params.commentId}`
    );
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    Portfolios.findById(req.params.portfolioId)
      .then(
        (portfolio) => {
          if (
            portfolio != null &&
            portfolio.image.comments.id(req.params.commentId) != null &&
            String(portfolio.image.comments.id(req.params.commentId).author)
          ) {
            req.body.author = req.user._id;
            if (req.body.comment) {
              portfolio.image.comments.id(req.params.commentId).comment =
                req.body.comment;
            }
            portfolio
              .save()
              .then(
                (portfolio) => {
                  Portfolios.findById(portfolio._id)
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
                },
                (err) => nexta(err)
              )
              .catch((err) => next(err));
          } else if (portfolio == null) {
            err = new Error(`Portfolio ${req.params.portfolioId} not found`);
            err.statusCode = 404;
            return next(err);
          } else if (
            portfolio.image.comments.id(req.params.commentId) != null
          ) {
            err = new Error(`Comment ${req.params.commentId} not found`);
            err.statusCode = 404;
            return next(err);
          } else {
            err = new Error(
              `Not allowed to change portfolios/image/comments/${req.params.commentId}`
            );
            err.statusCode = 403;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Portfolios.findById(req.params.portfolioId)
      .then(
        (portfolio) => {
          if (
            portfolio != null &&
            portfolio.image.comments.id(req.params.commentId) != null &&
            String(portfolio.image.comments.id(req.params.commentId).author) ==
              String(req.user._id)
          ) {
            portfolio.image.comments.id(req.params.commentId).remove();
            portfolio
              .save()
              .then(
                (portfolio) => {
                  Portfolios.findById(portfolio._id)
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
                },
                (err) => next(err)
              )
              .catch((err) => next(err));
          } else if (portfolio == null) {
            err = new Error(`Portfolio ${req.params.portfolioId} not found`);
            err.statusCode = 404;
            return next(err);
          } else if (
            portfolio.image.comments.id(req.params.commentId) != null
          ) {
            err = new Error(
              `Not allowed to delete portfolios/image/comments/${req.params.commentId}`
            );
            err.statusCode = 403;
            return next(err);
          } else {
            err = new Error(`Comment ${req.params.commentId} not found`);
            err.statusCode = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

module.exports = imageRouter;
