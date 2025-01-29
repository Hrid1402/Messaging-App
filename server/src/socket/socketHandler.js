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
                    newRequests: true,
                    receivedRequests: {
                        connect:{
                            id: frReq.id
                        }
                    }
                }, select:{
                    receivedRequests: {
                        include:{
                            from: true
                        }
                    }
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
                        { participants: { some: { id: data.fromID } } },
                        { participants: { some: { id: data.toID } } }
                    ]
                }
            })
            if (oldChat){
                console.log("oldChat exist!");
                console.log(oldChat);
                Chat = await prisma.chat.update({
                    where:{
                        id: oldChat.id
                    }, data:{
                        updatedAt: new Date()
                    }
                })
                //Logic to return oldChat after being friends again.
            }else{
                Chat = await prisma.chat.create({
                    data:{
                        participants:{
                            connect:[
                                {id: data.fromID},
                                {id: data.toID}
                            ]
                        }, 
                        updatedAt: new Date()
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
                 


            io.to(data.toID).emit('updateAcceptedRequest',  {received:receivedReqs.receivedRequests, from: data.fromName, friends:receiverFriends.friends, chats:receiverFriends.chats});
            io.to(data.fromID).emit('updateAcceptedRequestSended', {sended:sendedReqs.sendedRequests, to: data.toName, friends:senderFriends.friends, chats:senderFriends.chats});

            
        }catch(error){
            console.error('Error accepting friend request:', error);
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
                    authorID: data.authorID,
                    image: data.isImage
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
                    },
                    updatedAt: new Date()
                },
                include:{
                    participants: true,
                    messages: {
                        orderBy:{
                          createdAt: "asc"
                        }
                      }
                }
            });

            const allChats1 = await prisma.user.findUnique({
                where:{
                    id: data.authorID
                },select:{
                    friends:true,
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
            })

            const modifiedChats = await prisma.user.findUnique({
                where: { id: data.toID },
                select: { modifiedChats: true }
            });
            console.log('CHATS MODIFIED', modifiedChats.modifiedChats);

            let allChats2 = null;
            if (!modifiedChats?.modifiedChats.includes(data.chatID)) {
                allChats2 = await prisma.user.update({
                    where:{
                        id: data.toID
                    },
                    data:{
                        modifiedChats:{
                            push: data.chatID
                        }
                    },select:{
                        modifiedChats: true,
                        friends:true,
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
                })
            }else{
                allChats2 = await prisma.user.findUnique({
                    where:{
                        id: data.toID
                    },select:{
                        friends:true,
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
                })
            }
            

            //addingToModifiedList

            io.to(data.authorID).emit('receivedMessage', {chat: chat, chats: allChats1.chats, authorID: data.authorID});
            io.to(data.toID).emit('messageNotification',{authorID:data.authorID, content: data.content, username:data.username, isImage: data.isImage, modifiedChats:allChats2.modifiedChats});
            io.to(data.toID).emit('receivedMessage',{chat: chat, chats: allChats2.chats});

        }catch(error){
            console.log("Error sending message", error)
        }
        
    });
    //delete message
    socket.on('deleteMessage', async(data) => {
        console.log('A message was deleted:', data);
        try{
            const deletedMessage = await prisma.message.update({
                where:{
                    id: data.id
                },
                data:{
                    deleted: true
                }
            });

            console.log("Deleted Message: ", deletedMessage);

            const chat = await prisma.chat.findUnique({
                where:{
                    id: data.chatID
                },
                include:{
                    participants: true,
                    messages: {
                        orderBy:{
                          createdAt: "asc"
                        }
                      }
                }
            });

            const allChats1 = await prisma.user.findUnique({
                where:{
                    id: data.authorID
                },select:{
                    friends:true,
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
            })
            const allChats2 = await prisma.user.findUnique({
                where:{
                    id: data.toID
                },select:{
                    friends:true,
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
            })

            io.to(data.authorID).emit('receivedMessage', {chat: chat, chats: allChats1.chats});
            io.to(data.toID).emit('receivedMessage', {chat: chat, chats: allChats2.chats});

        }catch(error){
            console.log("Error sending message", error)
        }
        
    });

    //edit message
    socket.on('editMessage', async(data) => {
        console.log('A message was edited:', data);
        try{
            const editedMessage = await prisma.message.update({
                where:{
                    id: data.id
                },
                data:{
                    content: data.content,
                    edited: true
                }
            });

            console.log("Edited Message: ", editedMessage);

            const chat = await prisma.chat.findUnique({
                where:{
                    id: data.chatID
                },
                include:{
                    participants: true,
                    messages: {
                        orderBy:{
                          createdAt: "asc"
                        }
                      }
                }
            });

            const allChats1 = await prisma.user.findUnique({
                where:{
                    id: data.authorID
                },select:{
                    friends:true,
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
            })
            const allChats2 = await prisma.user.findUnique({
                where:{
                    id: data.toID
                },select:{
                    friends:true,
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
            })

            io.to(data.authorID).emit('receivedMessage', {chat: chat, chats: allChats1.chats});
            io.to(data.toID).emit('receivedMessage', {chat: chat, chats: allChats2.chats});

        }catch(error){
            console.log("Error sending message", error)
        }
        
    });

    //deleting friend
    socket.on('removeFriend', async(data)=>{
        console.log("Removing friend")
        console.log(data);
        try{
            const senderFriends = await prisma.user.update({
                where:{
                    id: data.fromID,
                },data:{
                    friends:{
                        disconnect:{
                            id: data.toID
                        }
                    }
                }, select:{
                    friends:true,
                    chats: {
                        include:{
                            participants: true,
                            messages: {
                                orderBy:{
                                  createdAt: "asc"
                                }
                              }
                        }
                    }
                }
            });

            const receiverFriends = await prisma.user.update({
                where:{
                    id: data.toID,
                },data:{
                    friends:{
                        disconnect:{
                            id: data.fromID
                        }
                    }
                }, select:{
                    friends:true,
                    chats: {
                        include:{
                            participants: true,
                            messages: {
                                orderBy:{
                                  createdAt: "asc"
                                }
                              }
                          }
                    }
                }
            });
                 


            io.to(data.fromID).emit('friendDeleted',  {username: data.toName, friends:senderFriends.friends, chats:senderFriends.chats, byMe:true});
            io.to(data.toID).emit('friendDeleted', {username: data.fromName, friends:receiverFriends.friends, chats: receiverFriends.chats, byMe:false});

            
        }catch(error){
            console.error('Error deleting friend:', error);
        }        
    });
    socket.on('updateModifiedChats', async(data)=>{
        console.log('updating modified data');
        try {
            await prisma.user.update({
                where:{
                    id: data.userID
                },data:{
                    modifiedChats: data.modifiedChats
                }
            });
        } catch (error) {
            console.log("Error updating modified data.");
        }
    });

    socket.on('changeBackground', async(data)=>{
        console.log('Changing chat background', data);
        try {
            const chat = await prisma.chat.update({
                where:{
                    id: data.chatID
                }, data:{
                    background: data.background
                },include:{
                    participants: true,
                    messages: {
                        orderBy:{
                          createdAt: "asc"
                        }
                      }
                }
            })
            io.to(data.fromID).emit('changeBackground',  {chat: chat, fromName: data.fromName, fromID: data.fromID});
            io.to(data.toID).emit('changeBackground',  {chat: chat, fromName: data.fromName, fromID: data.fromID});
        } catch (error) {
            console.log("Error changing chat background", error);
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.user.username}`);
    });
}