import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import TransactionController from './controllers/TransactionController';
import Mongo from './Mongo';
import initialise from './createInitialise';

const app: Application = express();
const transactionController = new TransactionController(Mongo.getInstance());
const port = process.env.PORT;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req: Request, res: Response) => {
  transactionController.getTransactions(req, res);
});

app.get('/test', async (req, res) => {
  res.status(200).json({ message: 'pass!' });
});

app.post('/transactions', (req: Request, res: Response) => {
  transactionController.createTransaction(req, res);
});

app.listen(port, () => {
  initialise();
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

export default app;
