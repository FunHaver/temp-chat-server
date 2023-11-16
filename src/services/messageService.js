const express = require('express');
const entityService = require('./entityService');
const Message = require('../entities/Message');

/**
 * Validate an incoming message
 * @param {Object} requestBody 
 */
class MessageService {


    validateMessage = async function(requestBody){
        let validationResults = {
            errors: [],
            user: null,
            chatRoom: null,
            content: null
        }
        if(requestBody.userId){
            let dbUser = await entityService.getEntity("User", requestBody.userId);
            if(dbUser === null){
                validationResults.errors.push("User does not exist!");
            } else {
                validationResults.user = dbUser;
            }
        } else {
            validationResults.errors.push("No user in message");
        }

        if(requestBody.chatRoomId){
            let dbChatRoom = await entityService.getEntity("ChatRoom", requestBody.chatRoomId);
            if(dbChatRoom === null){
                validationResults.errors.push("Invalid Chat Room");
            } else if(validationResults.user && dbChatRoom.uniqueId !== validationResults.user.chatRoomId){
                validationResults.errors.push("Invalid Chat Room");
            } else {
                validationResults.chatRoom = dbChatRoom;
                delete validationResults.chatRoom.users;
                delete validationResults.chatRoom.messages;
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

    submitMessage = async function(message) {
       return this.validateMessage(message).then( result => {
            if(result.errors.length > 0){
                res.status(500).send({
                    "ERRORS": result.errors
                })
            } else {
                return entityService.createMessage(result.user, result.chatRoom, result.content);
            }
        }).then(result => {
            //update all clients with new message
            return result
        }).catch(e => {
            throw new Error(e);
        })
    }
}
module.exports = new MessageService();