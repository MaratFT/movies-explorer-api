const router = require('express').Router();

const { celebrate, Joi } = require('celebrate');

const {
  getUserCurrentMovie,
  createUserCurrentMovie,
  deleteUserCurrentMovie,
} = require('../controllers/movies');

const regex = require('../utils/regex');

// const auth = require("../middlewares/auth");

// router.use(auth);

router.get('/movies', getUserCurrentMovie);

router.post(
  '/movies',
  celebrate({
    body: Joi.object().keys({
      country: Joi.string().required(),
      director: Joi.string().required(),
      duration: Joi.number().required(),
      year: Joi.string().required(),
      description: Joi.string().required(),
      image: Joi.string().required().pattern(new RegExp(regex)),
      trailerLink: Joi.string().required().pattern(new RegExp(regex)),
      nameRU: Joi.string().required(),
      nameEN: Joi.string().required(),
      thumbnail: Joi.string().required().pattern(new RegExp(regex)),
      movieId: Joi.number().required(),
    }),
  }),
  createUserCurrentMovie,
);

router.delete(
  '/movies/:movieId',
  celebrate({
    params: Joi.object().keys({
      movieId: Joi.string().length(24).hex().required(),
    }),
  }),
  deleteUserCurrentMovie,
);

module.exports = router;
