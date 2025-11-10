import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

interface UserInfo{
    socket:WebSocket;
    room:string;
}

let allSockets:UserInfo[]=[];
//event handler for connection
//scocket is the connection to the client where clinet can send and receive messages
wss.on('connection',(socket)=>{
    
    
    console.log('Client connected',allSockets.length);
    socket.send('Welcome to the server');

    socket.on('message',(message)=>{
        const data=JSON.parse(message.toString());
        console.log(data)
        // console.log(typeof data)
        if(data.type==='join'){  //evry user coming in the room will be added to the allSockets array
            allSockets.push(
                {
                    socket,
                    room:data.payload.roomId
                }
            )
        }
        console.log(allSockets)

        if(data.type==='chat'){  //evry user sending a message will be broadcast to the other users in the same room
            const currentUserRoom=allSockets.find(s=>s.socket===socket)?.room;
            allSockets.forEach(s=>{
                if(s.room===currentUserRoom){
                    s.socket.send(data.payload.message)
                }
            })
        }
       
     
    })

   
    socket.on('close',()=>{
        allSockets=allSockets.filter(s=>s.socket!==socket);
        console.log('Client disconnected',allSockets.length);
    })
    
});
