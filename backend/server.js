const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB } = require('./db');

const laureatesRoutes = require('./routes/laureates');
const statsRoutes = require('./routes/stats');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173'
}));

app.use(express.json());

app.use('/api/laureates', laureatesRoutes);
app.use('/api/stats', statsRoutes);

connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`🚀 Serwer działa na http://localhost:${process.env.PORT}`);
  });
}).catch(console.error);