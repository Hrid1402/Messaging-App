import express from 'express'
import {createServer} from 'node:http'
import 'dotenv/config'
import {authRouter} from "./routes/authRoutes.js"
import { socketServer } from './socket/socketServer.js'
import cors from "cors"

const app = express();
const server = createServer(app);
socketServer(server);

const PORT = process.env.PORT ?? 3000;

app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

app.use("/auth", authRouter);

app.get("/", (req, res)=>{
    res.json({message:"Online"});
})

server.listen(PORT,()=>{console.log(`Listening on http://localhost:${PORT}`)});