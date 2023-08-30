const router = require('express').Router();

const NotFoundError = require('../errors/not-found-error');

const routesUsers = require('./users');
const routesMovies = require('./movies');

const auth = require('../middlewares/auth');

router.use('/', routesUsers);

router.use(auth);

router.use('/', routesMovies);

router.use('*', (req, res, next) => {
  next(new NotFoundError('Маршрут не найден'));
});

module.exports = router;
