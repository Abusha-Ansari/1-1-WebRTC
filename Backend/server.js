import { WebSocketServer } from 'ws'

const wss = new WebSocketServer({port:6969})

let senderSocket = null;
let recieverSocket = null;

wss.on('connection', function connection(ws){
    ws.on('error', console.error);

    ws.on('message', function message(data){
        // console.log(data)
        const message = JSON.parse(data)
        // console.log(message)
        if(message.type === 'sender'){

            senderSocket = ws;
            console.log('sender found')
        
        } 
        else if(message.type ==='receiver'){

            recieverSocket = ws;
            console.log('receiver found')
        
        } 
        else if (message.type === 'createOffer'){

            recieverSocket.send(JSON.stringify({type:"createOffer" , sdp: message.sdp}));
            console.log('offer created');
        
        } 
        else if (message.type === 'createAnswer'){

            senderSocket.send(JSON.stringify({type:"createAnswer" , sdp: message.sdp}));
            console.log('answer created')
        
        }
        else if (message.type === 'iceCandidate'){

            if (ws === senderSocket)
                {
                recieverSocket.send(JSON.stringify({type:"iceCandidate" , candidate: message.candidate}));
            }
            else if (ws === recieverSocket)
                {
                senderSocket.send(JSON.stringify({type:"iceCandidate" , candidate: message.candidate}));
            }
        }
    });
    ws.send('connected');
});