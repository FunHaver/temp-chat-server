const express = require('express');
const entityService = require('../entityService');
const router = express.Router();
const userService = require('../userService');
router.get('/room', (req, res) => {
        entityService.getEntity("ChatRoom", req.query.id)
        .then(result => {
            if(result == null){
                res.status(404).send(result);
            } else {
                return entityService.getChatRoomUsers(result);
            }
        }, reject => {
            console.log(reject)
            res.status(500).send(reject);
        }).then(result => {
            userService.updateAllUsersInRoom(result, result.users);
            console.log(userService.getAllUsers());
            res.send(result);
        }).catch(error => res.status(500).send(error));
})




module.exports = router;