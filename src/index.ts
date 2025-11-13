import { WebSocketServer, WebSocket } from 'ws';
import { randomUUID } from 'crypto';
const wss = new WebSocketServer({ port: 8080 });

interface UserInfo{
    socket:WebSocket;
    room:string;
    username:string;
}

let allSockets:UserInfo[]=[];
//event handler for connection
//scocket is the connection to the client where clinet can send and receive messages
wss.on('connection',(socket)=>{
    
    
    console.log('Client connected',allSockets.length);
    

    socket.on('message',(message)=>{
        const data=JSON.parse(message.toString());
        console.log(data)
        // console.log(typeof data)

        //create a room
        if (data.type === 'create-room') {
            const newRoomId = randomUUID().slice(0, 6); // short random ID
            allSockets.push({ socket, room: newRoomId ,username:'Host'});
            socket.send(JSON.stringify({ type: 'room-created', payload: { roomId: newRoomId } })); //send the room id to the client
            console.log(`Room created: ${newRoomId}`);
        }

        //join a room exisiting one
        if(data.type==='join')
        {  //evry user coming in the room will be added to the allSockets array
            const { roomId } = data.payload;
            allSockets.push({ socket, room: roomId ,username:data.payload.username});
            socket.send(JSON.stringify({ type: 'joined', payload: { roomId } })); //send the room id to the client
            console.log(`User joined room: ${roomId}`);
        }
        console.log(allSockets)

        //send a message to the room
        if(data.type==='chat'){  //evry user sending a message will be broadcast to the other users in the same room
            const currentUser = allSockets.find((s) => s.socket === socket);
            const currentUserRoom = currentUser?.room;
            const currentUsername = currentUser?.username;
            const messageText = data.payload?.message;
            if (messageText && currentUserRoom) {
                allSockets.forEach(s=>{
                    if(s.room===currentUserRoom){
                        s.socket.send(JSON.stringify({ type: 'chat-message', payload: { message: messageText, username: currentUsername } }))
                    }
                })
            }
        }
       
     
    })

   
    socket.on('close', () => {
        const disconnectedUser = allSockets.find((s) => s.socket === socket);
        if (disconnectedUser) {
          const { room, username } = disconnectedUser;
    
          // Remove from list
          allSockets = allSockets.filter((s) => s.socket !== socket);
    
          // Notify others in same room
          allSockets.forEach((s) => {
            if (s.room === room) {
              s.socket.send(
                JSON.stringify({
                  type: 'user-left',
                  payload: { username },
                })
              );
            }
          });
    
          console.log(`User ${username} left room ${room}`);
        }
      }); 
    
});
