import {Server} from 'socket.io'
import { jwtDecode } from "jwt-decode";
import { PrismaClient } from '@prisma/client'
import { socketHandler } from './socketHandler.js';
const prisma = new PrismaClient()
import cors from "cors"

export const socketServer = (server)=>{
    const io = new Server(server);

    io.engine.use(cors({
        origin: "*",
        credentials: true
    }));


    io.use(async(socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error("Authentication error: No token provided"));
        }
        
        try{
            const data = jwtDecode(token);
            const user = await prisma.user.findUnique({
                where:{
                    id: data.id
                }
            });
            if (!user) {
                return next(new Error("Authentication error: User not found"));
            }
            socket.join(data.id)
            socket.user = user;
            next();
        }catch(error){
            next(new Error("Authentication error: Invalid token"));
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.user.username);
        socketHandler(socket, io);
    });
}