const { WebSocketServer } = require('ws');
const sockServer = new WebSocketServer({port: 3001});
const userService = require('./userService');

class ChatSocket {

    constructor(){
      this.init();
    }

    /**
     * 
     * @param {string} chatRoomId 
     */
    annouceArrival(chatRoomId){
      try{
        let roomParticipants = userService.getRoomUsers(chatRoomId);
        let participantsNoWS = [];

        for(let i = 0; i < roomParticipants.length; i++){
          participantsNoWS.push({
            "uniqueId": roomParticipants[i]["uniqueId"],
            "className": roomParticipants[i]["className"],
            "username": roomParticipants[i]["username"],
            "chatRoomId": roomParticipants[i]["chatRoomId"]
          })
        }

        for(let i = 0; i < roomParticipants.length; i++){
            roomParticipants[i].ws.send(
              JSON.stringify({"USERLIST": participantsNoWS})
              )
        }
      } catch(e){
        console.error(e);
      }

    }

    init(){
        sockServer.on('connection', ws => {
            ws.on('close', () => console.log('Client has disconnected!'))
            ws.on('message', data => {
              let messageObj = JSON.parse(data.toString('utf-8'));
              if(Object.hasOwn(messageObj, "ANNOUNCE")){
                userService.addWebSocket(messageObj["ANNOUNCE"].uniqueId, messageObj["ANNOUNCE"].chatRoomId, ws);
                this.annouceArrival(messageObj["ANNOUNCE"].chatRoomId);
              }
            })
        })
    }
}

module.exports = ChatSocket;
