import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import tweetsRouter from './router/tweets.js';
import authRouter from './router/auth.js';
import { config } from './config.js';
import { initSocket } from './connection/socket.js';
import { connectDB } from './db/database.js';
import { csrfCheck } from './middleware/csrf.js';

const app = express();

const corsOption = {
  origin: config.cors.allowedOrigin,
  optionsSuccessStatus: 200,
  credentials: true,
};

app.use(cors(corsOption));
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(morgan('tiny'));

app.get('/', (req, res) => {
  res.sendStatus(200);
  return '서버 홈';
});
app.use(csrfCheck);

app.use('/tweets', tweetsRouter);
app.use('/auth', authRouter);

app.use((req, res, next) => {
  res.sendStatus(404);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.sendStatus(500);
});

connectDB()
  .then((db) => {
    console.log(`Server is started.... ${new Date()}`);
    const server = app.listen(config.port);
    initSocket(server);
  })
  .catch(console.error);
