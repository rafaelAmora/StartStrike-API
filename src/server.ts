import "dotenv/config";
import express from "express";
import { errorHadling } from "./middlewares/errorHandling.js";
import { router } from "./routes/index.js";

const app = express();
app.use(express.json());
app.use(router)

app.use(errorHadling)
const PORT: number = 3000;

app.listen(PORT, () => console.log(`server is running on port ${PORT}`));
