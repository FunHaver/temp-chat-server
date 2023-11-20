const { WebSocketServer } = require('ws');
const sockServer = new WebSocketServer({port: 3001});
const userService = require('./services/userService');
const messageService = require('./services/messageService');
const entityService = require('./services/entityService');

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

    /**
     * 
     * @param {Message} message 
     */
    relayMessage(message){
      try {
        let roomParticipants = userService.getRoomUsers(message.chatRoom.uniqueId);
        for(let i = 0; i < roomParticipants.length; i++){
          roomParticipants[i].ws.send(
            JSON.stringify({"CHAT": message})
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
                entityService.getEntity("chatRoom", messageObj["ANNOUNCE"].chatRoomId).then(result => {
                  if(result === null){
                    return "this room does not exist."
                  } else {
                    userService.addWebSocket(messageObj["ANNOUNCE"].uniqueId, messageObj["ANNOUNCE"].chatRoomId, ws);
                    this.annouceArrival(messageObj["ANNOUNCE"].chatRoomId);
                  }
                })
              } else if (Object.hasOwn(messageObj), "MESSAGE"){
                messageService.submitMessage(messageObj["MESSAGE"]).then(result => {
                  this.relayMessage(result);
                }).catch(error => {
                  throw new Error(error);
                })
              }
            })
        })
    }
}

module.exports = ChatSocket;
