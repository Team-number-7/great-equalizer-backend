import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';

const app: Express = express();

const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.post('/transactions', (req: Request, res: Response) => {
  const name: string = req.body.name as string;
  const value: string = req.body.value as string;
  console.log(name, value);
  res.send('⚡️Name+Value');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
