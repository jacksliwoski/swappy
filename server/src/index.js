import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config.js';
import { guardian } from './routes/guardian.js';
import { users } from './routes/users.js';
import { merchants } from './routes/merchants.js';
import { listings } from './routes/listings.js';

const app = express();
app.use(helmet());
app.use(express.json({limit:'1mb'}));
app.use(cors({ origin: config.corsOrigin }));
app.use(morgan('dev'));

app.get('/api/health', (req,res)=>res.json({ok:true,time:new Date().toISOString(),mock:config.mock}));
app.use('/api/guardian', guardian);
app.use('/api/users', users);
app.use('/api/merchants', merchants);
app.use('/api', listings);

app.listen(config.port, ()=>console.log(`[swappy-visa] http://localhost:${config.port} (mock=${config.mock})`));
