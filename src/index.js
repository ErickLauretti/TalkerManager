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
  validateRateIsDecimal } = require('./middlewares/middlewares');

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

const readDoc = async () => {
  try {
    const read = await fs.readFile(path.resolve(__dirname, './talker.json'), 'utf-8');
    return JSON.parse(read);
  } catch (error) {
    console.error(error);
  }
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
  fs.writeFile(path.resolve(__dirname, './talker.json'), JSON.stringify(talker));
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
  fs.writeFile(path.resolve(__dirname, './talker.json'), JSON.stringify(attTalkers));
  const attTalker = attTalkers.find((e) => e.id === Number(id));
  return res.status(200).json(attTalker);
});

app.delete('/talker/:id', validateAuthentication, async (req, res) => {
  const talker = await readDoc();
  const { id } = req.params;
  const del = talker.filter((e) => e.id !== Number(id));
  fs.writeFile(path.resolve(__dirname, './talker.json'), JSON.stringify(del));
  return res.status(204).json({
    del,
  });
});

module.exports = {
  readDoc,
};