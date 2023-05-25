const express = require('express');
const fs = require('fs/promises');
const path = require('path');

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