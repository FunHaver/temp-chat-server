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
    announceArrival(chatRoomId){

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

    heartbeat(ws){
      ws.isAlive = true;
    }

    heartbeatAudit(){
      let users = userService.getAllUsers();
      for (const [key, value] of Object.entries(users)){
        if(value.length === 0){
          console.log(`Chat room ${key} reaped.`);
          userService.removeChatRoom(key);
          entityService.deleteChatRoom(key);
        } else {
          for(let i = 0; i < value.length; i++){
            let user = value[i];
          
            if(user.ws.isAlive === false){
              console.log(`${user.username} (${user.uniqueId}) has left room ${key}`);
              userService.removeUser(key, i);

              //announce departure. Copied and pasted because of scoping issues
              try{
                let roomParticipants = userService.getRoomUsers(key);
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
            if(user.ws.isAlive === false && user.ws.readyState !== 3){
              user.ws.terminate();
            }

            

            user.ws.isAlive = false;
            user.ws.ping();
          }
        }
      }
    }

     init(){
        sockServer.on('connection', ws => {
            ws.on('pong', () => this.heartbeat(ws))

            ws.on('message', data => {
              let messageObj = JSON.parse(data.toString('utf-8'));
              if(Object.hasOwn(messageObj, "ANNOUNCE")){
                entityService.getEntity("ChatRoom", messageObj["ANNOUNCE"].chatRoomId).then(result => {
                  if(result === null){
                    console.log("this room does not exist.");
                    return "this room does not exist."
                  } else {
                    ws.isAlive = true;
                    userService.addWebSocket(messageObj["ANNOUNCE"].uniqueId, messageObj["ANNOUNCE"].chatRoomId, ws);
                    this.announceArrival(messageObj["ANNOUNCE"].chatRoomId);
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

        const heartBeatInterval = setInterval(this.heartbeatAudit, 5000);

        sockServer.on('close', () => {
          clearInterval(heartBeatInterval);
        })
    }
}

module.exports = ChatSocket;
