const express = require('express');
const router = express.Router();
const entityService = require('../services/entityService');
const ChatRoom = require('../entities/ChatRoom');
const User = require('../entities/User');

/**
 * @async
 * @param {string} username 
 * @returns {{user: User, chatRoom: ChatRoom}} user and chatroom objects
 */
let generateRoom = async function(username){
    let user = await entityService.createUser(username);
    let chatRoom = await entityService.createChatRoom();
    await entityService.assignUserToRoom(user, chatRoom);
    return {
        user: user,
        chatRoom: chatRoom
    };
}
/**
 * 
 * @param {string} username 
 * @param {string} chatRoomId 
 * @returns {Object} chat room object
 */
let joinRoom = async function(username, chatRoomId){
    let user;
    let chatRoom;
    try {
        user = await entityService.createUser(username);
        chatRoom = await entityService.getEntity("ChatRoom", chatRoomId);
        await entityService.assignUserToRoom(user, chatRoom);
        return {
            user: user,
            chatRoom: chatRoom
        }
    } catch (e){
        throw e;
    }

}

router.post(`/login`, (req, res) => {
    if(req.body.generateRoom){
        console.log("Generating room...")
        generateRoom(req.body.username).then( result => {
            res.send(result);
        })
          
    } else {

        joinRoom(req.body.username, req.body.chatRoomId).then(result => {
            res.send(result);
        }).catch(e => {
            if("cause" in e && e.cause === "duplicateUser"){
                res.send({"error": `Username ${req.body.username} is already in use.`})
            } else if("cause" in e && e.cause === "roomNotFound") {
                res.status(404).send({"error": "Chat room not found!"});
            } else {
                res.status(500).send({"error": "Internal server error"});
            }
        })
    }
})

module.exports = router;