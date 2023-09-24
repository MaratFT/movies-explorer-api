const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const CREATED_CODE = 201;

const BadRequestError = require('../errors/bad-request-error');
const ExistsDatabaseError = require('../errors/exists-database-error');
const UnauthorizedError = require('../errors/unauthorized-error');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.createUser = async (req, res, next) => {
  const { email, name } = req.body;

  try {
    const hash = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({
      name,
      email,
      password: hash,
    });

    res.status(CREATED_CODE).send({
      name: user.name,
      email: user.email,
      _id: user._id,
    });
  } catch (error) {
    if (error.code === 11000) {
      next(new ExistsDatabaseError('Уже существует такой пользователь'));
    }
    if (error.name === 'ValidationError') {
      next(
        new BadRequestError('Переданы некорректные данные при создании профиля'),
      );
    }
    next(error);
  }
};

module.exports.updateUser = async (req, res, next) => {
  const { name, email } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email },
      { runValidators: true, new: true },
    );

    res.send(user);
  } catch (error) {
    if (error.code === 11000) {
      next(
        new ExistsDatabaseError('Уже существует пользователь с таким email'),
      );
    }
    if (error.name === 'ValidationError') {
      next(
        new BadRequestError(
          'Переданы некорректные данные при обновлении профиля',
        ),
      );
    }
    next(error);
  }
};

module.exports.getUserCurrent = async (req, res, next) => {
  const { _id } = req.user;

  try {
    const user = await User.findById(_id);

    res.send(user);
  } catch (error) {
    next(error);
  }
};

module.exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findUserByCredentials(email, password);

    const token = jwt.sign(
      { _id: user._id },
      NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
      {
        expiresIn: '7d',
      },
    );

    res.send({ token });
  } catch (error) {
    if (error) {
      next(new UnauthorizedError('Неправильные почта или пароль'));
    }
    next(error);
  }
};
