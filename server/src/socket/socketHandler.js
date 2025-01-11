import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const socketHandler = (socket, io)=>{
    
    socket.on('friendRequest', async(data) => {
        console.log('Friend request:', data);
        try{
            const frReq = await prisma.friendRequest.create({
                data:{
                    fromID: data.fromID,
                    fromName: data.fromName,
                    toID: data.toID,
                    toName: data.toName,
                }
            })
            console.log(frReq);
            const sendedReqs = await prisma.user.update({
                where:{
                    id: data.fromID,
                }, 
                data:{
                    sendedRequests: {
                        connect:{
                            id: frReq.id
                        }
                    }
                },
                select:{
                    sendedRequests: true
                }
            });

            const receivedReqs =await prisma.user.update({
                where:{
                    id: data.toID,
                }, 
                data:{
                    receivedRequests: {
                        connect:{
                            id: frReq.id
                        }
                    }
                }, select:{
                    receivedRequests: true
                }
            });
            console.log("the important one")
            console.log({sended:sendedReqs.sendedRequests, from: data.fromName});
            io.to(data.toID).emit('updateFriendRequests',  {received:receivedReqs.receivedRequests, from: data.fromName});
            io.to(data.fromID).emit('updateFriendRequestsSended', sendedReqs.sendedRequests);

        }catch(error){
            console.error('Error creating friend request:', error);
        }
    });

    socket.on('declineFriendRequest', async(data)=>{
        console.log("Declined Friend Requests!!!")
        console.log(data);
        try{
            await prisma.friendRequest.deleteMany({
                where:{
                    toID: data.toID,
                    fromID: data.fromID 
                }
            });

            const sendedReqs = await prisma.user.findUnique({
                where:{
                    id: data.fromID,
                },
                select:{
                    sendedRequests: true
                }
            });

            const receivedReqs = await prisma.user.findUnique({
                where:{
                    id: data.toID,
                }, select:{
                    receivedRequests: true
                }
            });

            io.to(data.toID).emit('updateDeclinedRequest',  {received:receivedReqs.receivedRequests, from: data.fromName});
            io.to(data.fromID).emit('updateDeclinedRequestSended', {sended:sendedReqs.sendedRequests, to: data.toName});

            
        }catch(error){
            console.error('Error declining friend request:', error);
        }
    });

    socket.on('acceptFriendRequest', async(data)=>{
        console.log("Friend Requests Accepted!!!")
        console.log(data);
        try{
            await prisma.friendRequest.deleteMany({
                where:{
                    OR:[
                        {
                            toID: data.toID,
                            fromID: data.fromID 
                        },
                        {
                            toID: data.fromID,
                            fromID:  data.toID
                        }
                    ]
                }
            });

            const sendedReqs = await prisma.user.findUnique({
                where:{
                    id: data.fromID,
                },
                select:{
                    sendedRequests: true
                }
            });

            const receivedReqs = await prisma.user.findUnique({
                where:{
                    id: data.toID,
                }, select:{
                    receivedRequests: true
                }
            });

            //CHAT LOGIC
            let Chat = null
            //Create chat if doesnt exist
            const oldChat = await prisma.chat.findFirst({
                where:{
                    AND: [
                        { participants: { some: { id: "participant1_id" } } },
                        { participants: { some: { id: "participant2_id" } } }
                    ]
                }
            })
            if (oldChat){
                console.log("oldChat exist!");
                console.log(oldChat);
                Chat = oldChat;
                //Logic to return oldChat after being friends again.
            }else{
                Chat = await prisma.chat.create({
                    data:{
                        participants:{
                            connect:[
                                {id: data.fromID},
                                {id: data.toID}
                            ]
                        }
                    }
                })
            }


            const senderFriends = await prisma.user.update({
                where:{
                    id: data.fromID,
                },data:{
                    friends:{
                        connect:{
                            id: data.toID
                        }
                    },chats:{
                        connect:{
                            id: Chat.id
                        }
                    }
                }, select:{
                    friends:true,
                    chats: {
                        include:{
                            participants: true,
                            messages: true
                          }
                    }
                }
            });

            const receiverFriends = await prisma.user.update({
                where:{
                    id: data.toID,
                },data:{
                    friends:{
                        connect:{
                            id: data.fromID
                        }
                    },chats:{
                        connect:{
                            id: Chat.id
                        }
                    }
                }, select:{
                    friends:true,
                    chats: {
                        include:{
                            participants: true,
                            messages: true
                          }
                    }
                }
            });
                 


            io.to(data.toID).emit('updateAcceptedRequest',  {received:receivedReqs.receivedRequests, from: data.fromName, friends:receiverFriends.friends, chats:receiverFriends.chats});
            io.to(data.fromID).emit('updateAcceptedRequestSended', {sended:sendedReqs.sendedRequests, to: data.toName, friends:senderFriends.friends, chats:senderFriends.chats});

            
        }catch(error){
            console.error('Error declining friend request:', error);
        }        
    });

    //Messages logic
    socket.on('sendMessage', async(data) => {
        console.log('A message was sended:', data);
        try{
            const newMessage = await prisma.message.create({
                data:{
                    chatID: data.chatID,
                    content: data.content,
                    authorID: data.authorID
                }
            });

            console.log("New message: ", newMessage);

            const chat = await prisma.chat.update({
                where:{
                    id: data.chatID
                },
                data:{
                    messages:{
                        connect:{
                            id: newMessage.id
                        }
                    }
                },
                include:{
                    participants: true,
                    messages: true
                }
            });

            console.log("Modified chat:", chat);

            io.to(data.authorID).emit('receivedMessage', chat);
            io.to(data.toID).emit('receivedMessage', chat);

        }catch(error){
            console.log("Error sending message", error)
        }
        
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.user.username}`);
    });
}