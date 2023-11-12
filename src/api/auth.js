const express = require('express');
const router = express.Router();
const entityService = require('../entityService');
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
    let user = await entityService.createUser(username);
    let chatRoom = await entityService.getEntity("ChatRoom", chatRoomId);
    try {
        await entityService.assignUserToRoom(user, chatRoom);
        return {
            user: user,
            chatRoom: chatRoom
        }
    } catch (e){
        throw new Error(e);
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
            res.status(404).send("Chat room not found!")
        })
    }
})

module.exports = router;