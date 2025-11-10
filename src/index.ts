import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

let users:number=0;

let allSockets:WebSocket[]=[];
//event handler for connection
//scocket is the connection to the client where clinet can send and receive messages
wss.on('connection',(socket)=>{
    users+=1
    allSockets.push(socket);
    console.log('Client connected',users);
    socket.send('Welcome to the server');

    socket.on('message',(e)=>{
       console.log(e.toString());
       allSockets.forEach(s=>s.send(e.toString()));
     
    })

    
});
