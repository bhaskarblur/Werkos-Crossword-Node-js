require('dotenv').config()
import bodyParser from 'body-parser';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import http from 'http';
import * as games from './routes/games';
import * as general from './routes/general';
import * as users from './routes/users';
var cron = require('node-cron');
const PORT = 10000;
const app= express();

const Pool = require('pg').Pool
const pool = new Pool({
  user: "postgres",
  host: process.env.HOST,
  database: "postgres",
  password: "RWSryOPhfHmTgWHcLJcO",
  port: process.env.PORT,
});

app.use(cors({
    credentials:true,
}));

app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.urlencoded({
    extended: true
  }));
app.use(bodyParser.json());

const server= http.createServer(app);
app.use(users.getRouter())
app.use(games.getRouter())
app.use(general.getRouter())

cron.schedule('10 0 * * *', async () => {
  const limit =  await pool.query('SELECT * from systemsettings;');
  await pool.query('UPDATE usertable set gamesleft=$1', [limit.rows[0].gameslimit])
  console.log("Games limit reset for all players!")
}, 
{ scheduled: true});

server.listen(PORT, () => {
    console.log("Server listening on port: "+PORT);
});

app.get('/', (req, res) => {
    res.send('Crossword app for mobile. Download now.');
  });


