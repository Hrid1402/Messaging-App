
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
import bcrypt from 'bcrypt'
import { body, validationResult } from "express-validator"
import 'dotenv/config'
import jwt from 'jsonwebtoken'


export const validateUser = [
    body("username").trim()
        .notEmpty().withMessage(`Username can't be empty.`)
        .isLength({ min: 1, max: 15 }).withMessage(`Username max length its 15 letters.`)
        .custom(async (value) => {
            const user = await prisma.user.findFirst({
                where:{
                    username: value
                }
            })
            if(user){
                throw new Error("Username already exists.");
            }
            return true
        }).withMessage(`Username already exists.`),
    body("password").trim()
        .notEmpty().withMessage(`Password can't be empty.`)
        .isLength({ min: 8, max: 64 }).withMessage(`Password length needs to be between 8 - 64.`)
  ];

export async function userRegister(req, res){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: errors.array()[0].msg
        });
    }
    const {username, password} = req.body;
    console.log(username);
    console.log(password);
    const hashedPassword = bcrypt.hashSync(password, 10);
    try {
        const user = await prisma.user.create({
            data:{
                username: username,
                password: hashedPassword,
                
            }
        })
    
        return res.status(201).json({
          message: "User created successfully!",
          user: { username: user.username},
        });
      } catch (error) {
        console.log(error);
      }
}

export async function userLogin(req, res){
    const {username, password} = req.body;
    try{
        const user = await prisma.user.findFirst({
            where:{
                username:username
            }
        });
        console.log(user);
        if(!user){
            return res.status(400).json({message: "User doesn't exist"});
        }
        if(!bcrypt.compareSync(password, user.password)){
            return res.status(400).json({message: "Wrong password or username"});
        }
        const accessToken = jwt.sign({id: user.id}, process.env.SIGNATURE_TOKEN, { expiresIn: "1d" });
        return res.status(200).json({ message: "Login successful", accessToken: accessToken });
    }catch(error){
        console.log(error);
    }
}
export async function getUser(req, res){
    try{
        const user = req.user;
        res.status(200).json({
            id: user.id,
            username: user.username,
            description: user.description,
            picture: user.picture,
            newRequests: user.newRequests,
            modifiedChats: user.modifiedChats,
            friends: user.friends,
            chats: user.chats,
            sended: user.sendedRequests,
            received: user.receivedRequests
        })
    }catch(error){
        console.log(error);
    }
}

export async function putUser(req, res){
    try{
        const {username, description, picture, friends, chats, newRequests, modifiedChats} = req.body;
        const user = await prisma.user.update({
            where:{
                id: req.user.id
            },
            data:{
                username: username,
                description: description,
                newRequests: newRequests,
                picture: picture,
                friends: friends,
                modifiedChats: modifiedChats,
                chats: chats
            }
        });
        res.status(200).json({
            id: user.id,
            username: user.username,
            description: user.description,
            newRequests: newRequests,
            picture: user.picture,
            friends: user.friends,
            chats: user.chats
        })
    }catch(error){
        console.log(error);
    }
}

export async function searchUser(req, res){
    try{
        const {username} = req.body;
        console.log(username);
        const users = await prisma.user.findMany({
            where:{
                username:{
                    contains: username,
                    mode: 'insensitive'
                }
            }, select:{
                id: true,
                username: true,
                picture: true,
                description: true
            }
        });
        res.status(200).json(users);
    }catch(error){
        console.log(error);
    }
}