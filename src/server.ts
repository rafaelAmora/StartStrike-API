import "dotenv/config";
import express from "express";
import { errorHadling } from "./middlewares/errorHandling.js";
import { router } from "./routes/index.js";
import { limiter } from "./middlewares/rateLimit.js";
import cors from 'cors'

import "./jobs/syncJob.js";
const app = express();


app.use(express.json());
const allowedOrigins = [ "https://seu-frontend.com"]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error("Origem não permitida pelo CORS"))
    }
  }
}))
app.use(limiter)
app.use(router)

app.use(errorHadling)
const PORT: number = 3000;

app.listen(PORT, () => console.log(`server is running on port ${PORT}`));
