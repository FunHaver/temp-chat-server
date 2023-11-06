const express = require('express');
const router = express.Router();
const entityService = require('../entityService');

/**
 * @async
 * @param {string} username 
 * @returns {Object} user and chatroom objects
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

let joinRoom = async function(username, chatRoomId){
    let user = entityService.createUser(username);
    let chatRoom = await entityService.getEntity("ChatRoom", chatRoomId);
    await entityService.assignUserToRoom(user, chatRoom);
    return {
        user: user,
        chatRoom: chatRoom
    }
}

router.post(`/login`, (req, res) => {
    if(req.body.generateRoom){
        console.log("Generating room...")
        generateRoom(req.body.username).then( result => {
            res.send(result);
        })
   
    } else {
        try{
            joinRoom(req.body.username, req.body.chatRoomId).then(result => {
                res.send(result);
            })
        } catch (e){
            res.status(404).send("Chat room not found!")
        }
    }
})

module.exports = router;