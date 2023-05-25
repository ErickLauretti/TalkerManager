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

app.get('/talker', async (req, res) => {
  const talkers = await readDoc();
  if(talkers) {
    return res.status(200).json(talkers);
  }
  return [];
});