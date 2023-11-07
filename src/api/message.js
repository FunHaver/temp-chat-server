const express = require('express');
const router = express.Router();
const entityService = require('../entityService');
const Message = require('../entities/Message');
const ChatRoom = require('../entities/ChatRoom');

/**
 * @async
 * @param {User} user 
 * @param {ChatRoom} chatRoom
 * @param {string} content
 * @returns {Message} message that has been posted
 */
let createMessage = async function(user, chatRoom, content){
    let postedMessage = await entityService.createMessage(user, chatRoom, content);
    return postedMessage;
}

router.post('/new', (req, res) => {
    createMessage(req.body.message).then(result => {
        res.send(result);
    })
})

module.exports = router;