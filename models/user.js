const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');

const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (v) => validator.isEmail(v),
        message: 'Некорректный email',
      },
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    name: {
      type: String,
      required: true,
      minlength: [2, 'Минимальная длина поля "Имя" - 2'],
      maxlength: [30, 'Максимальная длина поля "Имя" - 30'],
    },
  },
  { versionKey: false },
);

// eslint-disable-next-line
userSchema.statics.findUserByCredentials = async function (email, password) {
  const user = await this.findOne({ email }).select('+password');

  if (!user) {
    return Promise.reject(new Error('Неправильные почта или пароль'));
  }

  const check = await bcrypt.compare(password, user.password);

  if (!check) {
    return Promise.reject(new Error('Неправильные почта или пароль'));
  }
  return user;
};

module.exports = mongoose.model('user', userSchema);
