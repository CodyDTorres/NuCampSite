const express = require("express");
const cors = require("./cors");
const authenticate = require("../authenticate");
const Favorite = require("../models/favorite");
const { response } = require("../app");

const favoriteRouter = express.Router();

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))

  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    console.log("get");
    Favorite.find({ user: req.user._id })
      .populate("user")
      .populate("campsites")
      .then((favorites) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(favorites);
      })
      .catch((err) => next(err));
  })

  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then((favorite) => {
        if (favorite) {
          for (var i = 0; i < req.body.length; i++) {
            if (favorite.campsites.indexOf(req.body[i]._id) === -1) {
              favorite.campsites.push(req.body[i]._id);
            }
          }
          favorite
            .save()
            .then((favorite) => {
              console.log("Favorite Done ", favorite);
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            })
            .catch((err) => next(err));
        } else {
          Favorite.create({ user: req.user._id }).then((favorite) => {
            for (var i = 0; i < req.body.length; i++) {
              if (favorite.campsites.indexOf(req.body[i]._id) === -1) {
                favorite.campsites.push(req.body[i]._id);
              }
            }
            console.log("Favorite Done ", favorite);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorite);
          });
        }
      })
      .catch((err) => next(err));
  })

  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites");
  })

  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({ user: req.user._id })
      .then((favorite) => {
        if (favorite) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favorite);
        } else {
          res.json("Nothing to delete");
        }
      })
      .catch((err) => next(err));
  });

favoriteRouter
  .route("/:campsiteId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))

  .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      "GET operation not supported on /favorites/" + req.params.campsiteId
    );
  })

  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then((favorite) => {
        if (favorite) {
          if (favorite.campsites.indexOf(req.params.campsiteId) === -1) {
            favorite.campsites.push(req.params.campsiteId);
            favorite.save().then((favorite) => {
              console.log("Favorite Made", favorite);
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            });
          }
        } else {
          Favorite.create({
            user: req.user._id,
            campsites: [req.params.campsiteId],
          }).then((favorite) => {
            console.log("Favorite made", favorite);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorite);
          });
        }
      })
      .catch((err) => next(err));
  })

  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      "PUT operation not supported on /favorites/" + req.params.campsiteId
    );
  })

  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id }).then((favorite) => {
      if (favorite) {
        let index = favorite.campsites.indexOf(req.params.campsiteId);
        if (index >= 0) {
          favorite.campsites.splice(index, 1);
          favorite.save().then((favorite) => {
            console.log("Favorite removed", favorite);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorite);
          });
        } else {
          res.json("No Campsite with the corresponding Id");
        }
      } else {
        err = new Error("Favorite not found");
        err.statusCode = 404;
        return next(err);
      }
    });
  });

module.exports = favoriteRouter;
