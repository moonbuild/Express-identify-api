import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

import identifyRouter from './router/identify-router';

dotenv.config()

const app = express()
const PORT = process.env.PORT ?? 3000

app.use(cors());
app.use(express.json())

// link to identifyRouter
app.use('/identify', identifyRouter)

app.listen(PORT, ()=>{
    console.log(`Identify Endpoint running on http://localhost:${PORT}/identify`)
    console.log(`You can check identify health on http://localhost:${PORT}/identify/health`)
})