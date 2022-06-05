import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';

const app: Application = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.get('/test', async (req, res) => {
  res.status(200).json({ message: 'pass!' });
});

app.post('/transactions', (req: Request, res: Response) => {
  const name: string = req.body.name as string;
  const value: string = req.body.value as string;
  console.log(name, value);
  res.send('⚡️Name+Value');
});

export default app;
