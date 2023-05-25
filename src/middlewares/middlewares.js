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

module.exports = {
  validadeInputs,
  validationCaracters,
};