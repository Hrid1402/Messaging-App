import { ExtractJwt, Strategy } from "passport-jwt";
import passport from "passport";
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
import 'dotenv/config'

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SIGNATURE_TOKEN,
  };
  
  passport.use(
    new Strategy(opts, async (payload, done) => {
      try {
        const user = await prisma.user.findUnique({
            where:{
                id: payload.id
              }, include:{
                friends:true,
                sendedRequests:true,
                receivedRequests: true,
                chats: {
                  include:{
                    participants: true,
                    messages: {
                      orderBy:{
                        createdAt: "asc"
                      }
                    }
                  },
                  orderBy:{
                      updatedAt: "desc"
                  }
                }
              }
        });
        if (user) return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );