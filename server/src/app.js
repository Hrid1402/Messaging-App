import express from 'express'
import 'dotenv/config'
import {authRouter} from "./routes/authRoutes.js"
import cors from "cors"
const app = express();

const PORT = process.env.PORT ?? 3000;

app.use(express.json());
app.use(cors());

app.use("/auth", authRouter);

app.get("/", (req, res)=>{
    res.json({message:"Online"});
})

app.listen(PORT,()=>{console.log(`Listening on http://localhost:${PORT}`)});