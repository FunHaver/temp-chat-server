const express = require('express');
const router = express.Router();
const entityService = require('../entityService');
const Message = require('../entities/Message');
const ChatRoom = require('../entities/ChatRoom');
const User = require('../entities/User');

/**
 * Validate an incoming message
 * @param {Object} requestBody 
 */
let validateMessage = async function(requestBody){
    
    let validationResults = {
        errors: [],
        user: null,
        chatRoom: null,
        content: null
    }
    if(requestBody.user){
        let dbUser = await entityService.getEntity("User", requestBody.user.uniqueId);
        if(dbUser === null){
            validationResults.errors.push("User does not exist!");
        } else {
            validationResults.user = dbUser;
        }
    } else {
        validationResults.errors.push("No user in message");
    }

    if(requestBody.chatRoom){
        let dbChatRoom = await entityService.getEntity("ChatRoom", requestBody.chatRoom.uniqueId);
        if(dbChatRoom === null){
            validationResults.errors.push("Invalid Chat Room");
        } else if(validationResults.user && dbChatRoom.uniqueId !== validationResults.user.chatRoomId){
            validationResults.errors.push("Invalid Chat Room");
        } else {
            validationResults.chatRoom = dbChatRoom;
        }
    } else {
        validationResults.errors.push("No chatroom in message");
    }

    if(requestBody.content){
        if(typeof requestBody.content === "string"){
            if(requestBody.content.length === 0){
                validationResults.errors.push("Invalid Message");
            } else {
                validationResults.content = requestBody.content;
            }
        } else {
            validationResults.errors.push("Invalid Message");
        }
    }
    
    return validationResults;
}

/**
 * @async
 * @param {User} user 
 * @param {ChatRoom} chatRoom
 * @param {string} content
 * @returns {Message} message that has been posted
 */
let createMessage = async function(messageRequest){
    let postedMessage = await entityService.createMessage(messageRequest.user, messageRequest.chatRoom, messageRequest.content);
    return postedMessage;
}

router.post('/new', (req, res) => {
    validateMessage(req.body).then( result => {
        if(result.errors.length > 0){
            res.status(500).send({
                "ERRORS": result.errors
            })
        } else {
            return createMessage(result)
        }
    }).then(result => {
        res.send(result);
    })
})

module.exports = router;