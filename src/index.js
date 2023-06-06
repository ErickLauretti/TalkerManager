const express = require('express');
const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const {
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
  validateRateByBody,
  validateRateIsDecimalByBody,
  validateRateIsDecimalByBodys,
  } = require('./middlewares/middlewares');

const app = express();
app.use(express.json());

const HTTP_OK_STATUS = 200;
const PORT = process.env.PORT || '3001';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Servidor up na porta 3001');
});

const CAMINHO = './talker.json';

const readDoc = async () => {
  try {
    const read = await fs.readFile(path.resolve(__dirname, CAMINHO), 'utf-8');
    return JSON.parse(read);
  } catch (error) {
    console.error(error);
  }
};

const validateDate = (date) => {
  const regex = /^(0[1-9]|[1-2]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
  return regex.test(date);
};

const validateTalker = async (req, res, next) => {
  const talker = await readDoc();
  const { id } = req.params;
  const speaker = talker.find((e) => Number(id) === e.id);
  if (!speaker) {
    res.status(404).json({
      message: 'Pessoa palestrante não encontrada',
    });
  } else {
    next();
  }
};

const validateRateByQuery = (req, res, next) => {
  const { rate } = req.query;
  const numero = Number(rate);
  const inteiro = Number.isInteger(numero);
  const rateBetween = (numero >= 1 && numero <= 5);
  if ((!inteiro || !rateBetween) && rate) {
    res.status(400).json({
      message: 'O campo "rate" deve ser um número inteiro entre 1 e 5',
    });
  } else {
    next();
  }
};

const validateQ = async (req, res, next) => {
  const talker = await readDoc();
  const { rate, q, date } = req.query;
  if ((!q || q.length === 0) && !rate && !date) {
    return res.status(200).json(talker);
  }
  next();
};

const validateWatchedAtByQuery = (req, res, next) => {
  const { date } = req.query;
  const data = validateDate(date);
  if (!data && date) {
    return res.status(400).json({
      message: 'O parâmetro "date" deve ter o formato "dd/mm/aaaa"',
    });
  }
  next();
};

const makeToken = () => {
  const buffer = crypto.randomBytes(8);
  const password = buffer.toString('hex');
  return password;
};

app.get('/talker', async (_req, res) => {
  const talkers = await readDoc();
  if (talkers) {
    return res.status(200).json(talkers);
  }
  return [];
});

app.get('/talker/search',
validateAuthentication,
validateRateByQuery,
validateQ,
validateWatchedAtByQuery,
async (req, res) => {
  const talker = await readDoc();
  const { rate, q, date } = req.query;
  const talkerFilter = talker.filter((talkers) => talkers.name.includes(q) || !q);
  const filtered = talkerFilter.filter((talkers) =>
  (talkers.talk.rate === Number(rate) || !rate) && (talkers.talk.watchedAt === date || !date));
  return res.status(200).json(filtered);
});

app.get('/talker/:id', async (req, res) => {
  const { id } = req.params;
  const talker = await readDoc();
  const findTalker = talker.find((e) => Number(id) === e.id);
  if (findTalker) {
    return res.status(200).json(findTalker);
  }
    return res.status(404).json({
      message: 'Pessoa palestrante não encontrada',
    });
});

app.post('/login', validadeInputs, validationCaracters, (req, res) => {
  const { email, password } = req.body;
  const newToken = makeToken();
  const login = {
    email,
    password,
  };
  if (login) {
    return res.status(200).json({
      token: newToken,
    });
  }
});

app.post('/talker',
validateAuthentication,
validateNameAndAge,
validateName,
validateAge,
validateTalk,
validateWatchedAt,
validateRate,
validateRateIsDecimal,
async (req, res) => {
  const talker = await readDoc();
  const { name, age, talk: { watchedAt, rate } } = req.body;
  const nextId = talker.length + 1;
  const newTalker = {
    id: nextId,
    name,
    age,
    talk: {
      watchedAt,
      rate,
    },
  };
  talker.push(newTalker);
  fs.writeFile(path.resolve(__dirname, CAMINHO), JSON.stringify(talker));
  return res.status(201).json(newTalker);
});

app.put('/talker/:id',
validateAuthentication,
validateNameAndAge,
validateName,
validateAge,
validateTalk,
validateWatchedAt,
validateRate,
validateRateIsDecimal,
validateTalker,
async (req, res) => {
  const talker = await readDoc();
  const { id } = req.params;
  const { name, age, talk: { watchedAt, rate } } = req.body;
  const attTalkers = talker.map((talkers) => {
    if (talkers.id === Number(id)) {
      return { ...talkers,
        name,
        age,
        talk: {
          watchedAt,
          rate,
        } };
    } return talkers;
  });
  fs.writeFile(path.resolve(__dirname, CAMINHO), JSON.stringify(attTalkers));
  const attTalker = attTalkers.find((e) => e.id === Number(id));
  return res.status(200).json(attTalker);
});

app.patch('/talker/rate/:id',
validateAuthentication,
validateRateByBody,
validateRateIsDecimalByBodys,
async (req, res) => {
  const talker = await readDoc();
  const { rate } = req.body;
  const { id } = req.params;
  const newTalker = talker.map((talkers) => {
    if (talkers.id === Number(id)) {
      return {
        ...talkers,
        talk: {
          ...talkers.talk,
          rate } };
    } return talkers;
  });
  fs.writeFile(path.resolve(__dirname, CAMINHO), JSON.stringify(newTalker));
  return res.status(204).json({});
});

app.delete('/talker/:id', validateAuthentication, async (req, res) => {
  const talker = await readDoc();
  const { id } = req.params;
  const deleteTalker = talker.filter((e) => e.id !== Number(id));
  fs.writeFile(path.resolve(__dirname, CAMINHO), JSON.stringify(deleteTalker));
  return res.status(204).json({
    deleteTalker,
  });
});

module.exports = {
  readDoc,
};