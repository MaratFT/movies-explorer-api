const Movie = require('../models/movie');

const CREATED_CODE = 201;

const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');
const ForbiddenError = require('../errors/forbidden-error');

module.exports.getUserCurrentMovie = async (req, res, next) => {
  const { _id } = req.user;

  try {
    const movie = await Movie.find({ owner: _id }).populate('owner');

    res.send(movie);
  } catch (error) {
    next(error);
  }
};

module.exports.createUserCurrentMovie = async (req, res, next) => {
  const { _id } = req.user;
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;

  try {
    const movie = await Movie.create({
      country,
      director,
      duration,
      year,
      description,
      image,
      trailerLink,
      nameRU,
      nameEN,
      thumbnail,
      movieId,
      owner: _id,
    });
    const populatedMovie = await movie.populate('owner').execPopulate();
    res.status(CREATED_CODE).send(populatedMovie);
  } catch (error) {
    if (error.name === 'ValidationError') {
      next(
        new BadRequestError('Переданы некорректные данные при создании фильма'),
      );
    }
    next();
  }
};

module.exports.deleteUserCurrentMovie = async (req, res, next) => {
  const { movieId } = req.params;

  try {
    const movie = await Movie.findById(movieId)
      .populate('owner')
      .orFail(new Error('NotFoundMovie'));
    if (String(req.user._id) !== String(movie.owner._id)) {
      next(
        new ForbiddenError(
          `Избранный фильм другого пользователя (${movie.owner._id})`,
        ),
      );
    } else if (String(req.user._id) === String(movie.owner._id)) {
      const movieDeleted = await Movie.deleteOne(movie);
      res.send(movieDeleted);
    }
  } catch (error) {
    if (error.kind === 'ObjectId') {
      next(new BadRequestError('Некорректный запрос избранного фильма'));
    }
    if (error.message === 'NotFoundMovie') {
      next(
        new NotFoundError(
          `Избранный фильм с указанным _id (${movieId}) не найден`,
        ),
      );
    }
    next();
  }
};
