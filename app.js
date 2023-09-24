require('dotenv').config();

const helmet = require('helmet');

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');

const routes = require('./routes');

const errorHandler = require('./middlewares/error-handler');

const { PORT = 3000, DB_URL } = process.env;

const { requestLogger, errorLogger } = require('./middlewares/logger');

const allowedCors = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://movexp.nomoredomainsicu.ru',
  'https://movexp.nomoredomainsicu.ru',
];

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

const app = express();

app.use(helmet());

app.use(bodyParser.json());

app.use(requestLogger);

// eslint-disable-next-line
app.use((req, res, next) => {
  const { origin } = req.headers;

  const { method } = req;
  const DEFAULT_ALLOWED_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE';
  const requestHeaders = req.headers['access-control-request-headers'];

  if (allowedCors.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  if (method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', DEFAULT_ALLOWED_METHODS);
    res.header('Access-Control-Allow-Headers', requestHeaders);

    return res.end();
  }

  next();
});

app.use(routes);

app.use(errorLogger);

app.use(errors());

app.use(errorHandler);

app.listen(PORT, () => {
  // eslint-disable-next-line
  console.log(`Приложение запущено на порту ${PORT}`);
});
