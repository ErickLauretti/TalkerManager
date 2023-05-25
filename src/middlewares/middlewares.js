const validadeInputs = (req, res, next) => {
  const { email, password } = req.body;
  const validacao = !email ? 'O campo "email" é obrigatório' : 'O campo "password" é obrigatório';
  if (email && password) {
    next();
  } else {
    return res.status(400).json({
      message: validacao,
    });
  }
};

const correctEmail = (email) => {
  const regex = /\S+@\S+\.\S+/;
  return regex.test(email);
};

const correctPassword = (password) => {
  const numberPassword = 6;
  return password.length >= numberPassword;
};

const validationCaracters = (req, res, next) => {
  const { email, password } = req.body;
  const validateEmail = correctEmail(email);
  const validadePassword = correctPassword(password);
  const validate = !validateEmail
  ? 'O "email" deve ter o formato "email@email.com"'
  : 'O "password" deve ter pelo menos 6 caracteres';
  if (validateEmail && validadePassword) {
    next();
  } else {
    return res.status(400).json({
      message: validate,
    });
  }
};

const validateAuthentication = (req, res, next) => {
  const { authorization } = req.headers;
  const type = typeof authorization === 'string';
  if (!authorization) {
    return res.status(401).json({
      message: 'Token não encontrado',
    });
  } if (authorization.length !== 16 || !type) {
    return res.status(401).json({
      message: 'Token inválido',
    });
  }
  return next();
};

const validateNameAndAge = (req, res, next) => {
  const { name, age } = req.body;
  const validate = !name ? 'O campo "name" é obrigatório'
  : 'O campo "age" é obrigatório';
  if (name && age) {
    next();
  } else {
    return res.status(400).json({
      message: validate,
    });
  }
};

const validateName = (req, res, next) => {
  const { name } = req.body;
  const validate = (name.length >= 3 && name !== undefined);
  if (validate) {
    next();
  } else {
    return res.status(400).json({
      message: 'O "name" deve ter pelo menos 3 caracteres',
    });
  }
};

const validateAge = (req, res, next) => {
  const { age } = req.body;
  const number = Number(age);
  const inteiro = Number.isInteger(number);
  const is18 = number >= 18;
  if (!inteiro || !is18) {
    res.status(400).json({
      message: 'O campo "age" deve ser um número inteiro igual ou maior que 18',
    });
  } else {
    next();
  }
};

const validateTalk = (req, res, next) => {
  const { talk } = req.body;
  if (!talk) {
    res.status(400).json({
      message: 'O campo "talk" é obrigatório',
    });
  } else {
    next();
  }
};

const validateDate = (date) => {
  const regex = /^(0[1-9]|[1-2]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
  return regex.test(date);
};

const validateWatchedAt = (req, res, next) => {
  const { talk: { watchedAt } } = req.body;
  const validate = validateDate(watchedAt);
  if (!watchedAt) {
    return res.status(400).json({
      message: 'O campo "watchedAt" é obrigatório',
    });
  } if (!validate) {
    return res.status(400).json({
      message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"',
    });
  }
  return next();
};

const validateRate = (req, res, next) => {
  const { talk: { rate } } = req.body;
  if (!rate && rate !== 0) {
    res.status(400).json({
      message: 'O campo "rate" é obrigatório',
    });
  } else {
    next();
  }
};

const validateRateIsDecimal = (req, res, next) => {
  const { talk: { rate } } = req.body;
  const inteiro = Number.isInteger(rate);
  const betweenOneAndFive = (rate >= 1 && rate <= 5);
  if (!inteiro || !betweenOneAndFive) {
    res.status(400).json({
      message: 'O campo "rate" deve ser um número inteiro entre 1 e 5',
    });
  } else {
    next();
  }
};

module.exports = {
  validadeInputs,
  validationCaracters,
  validateAuthentication,
  validateNameAndAge,
  validateName,
  validateAge,
  validateTalk,
  validateWatchedAt,
  validateRate,
  validateRateIsDecimal,
};