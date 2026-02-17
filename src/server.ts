import express from 'express'
import 'dotenv/config'
import router from './router'
import { connectDB } from './config/db'
import cors from 'cors'
import { corsConfig } from './config/cors'

// db connect
connectDB()

const app = express()

// Cors
app.use(cors(corsConfig))

// read data from forms - global middleware
app.use(express.json())

app.use('/api', router)

export default app;