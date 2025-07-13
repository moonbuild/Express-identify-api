import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import identifyRouter from './router/identify-router';

dotenv.config()

const app = express()
const PORT = process.env.PORT ?? 3000

app.use(cors());
app.use(express.json())

// logs for development
// TODO: Remove in final release
app.use((req, res, next)=>{
    console.log(`${new Date().toISOString()} | ${req.method} | ${req.path}`)
    next();
})

// link to identifyRouter
app.use('/identify', identifyRouter)

app.listen(PORT, ()=>{
    console.log(`Server running on http://localhost:${PORT}/identify`)
    console.log(`You can check idenitfy health on http://localhost:${PORT}/identify/health`)
})