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
            const senderFriends = await prisma.user.update({
                where:{
                    id: data.fromID,
                },data:{
                    friends:{
                        connect:{
                            id: data.toID
                        }
                    }
                }, select:{
                    friends:true
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
                    }
                }, select:{
                    friends:true
                }
            });
                
            //return data
            io.to(data.toID).emit('updateAcceptedRequest',  {received:receivedReqs.receivedRequests, from: data.fromName, friends:receiverFriends.friends});
            io.to(data.fromID).emit('updateAcceptedRequestSended', {sended:sendedReqs.sendedRequests, to: data.toName, friends:senderFriends.friends});

            
        }catch(error){
            console.error('Error declining friend request:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.user.username}`);
    });
}