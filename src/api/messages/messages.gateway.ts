import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { MessageDocument } from './message.schema';
import { corsConfig } from 'src/configs/cors.config';
  
@WebSocketGateway({ cors: corsConfig() }) 
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
  
    handleConnection(client: any) {
        console.log(`Клиент подключен: ${client.id}`);
    }
  
    handleDisconnect(client: any) {
        console.log(`Клиент отключен: ${client.id}`);
    }
  
    @SubscribeMessage('newMessage')
    handleNewMessage(@MessageBody() message: MessageDocument) {
        this.server.emit('message', message); 
    }
}