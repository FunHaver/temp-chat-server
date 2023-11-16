const express = require('express');
const entityService = require('../services/entityService');
const router = express.Router();
const userService = require('../services/userService');

router.get('/room', (req, res) => {
        entityService.getEntity("ChatRoom", req.query.id)
        .then(result => {
            if(result == null){
                throw new Error(404);
            } else {
                return entityService.getChatRoomUsers(result);
            }
        }, reject => {
            console.log(reject)
            res.status(500).send(reject);
        }).then(result => {
            res.send(result);
        }).catch(error => {
            if(error === 404){
                res.status(404).send(error);
            } else {
                res.status(500).send(error);
            }
        });
})

router.get("/messages", (req, res) => {
    entityService.getEntity("ChatRoom", req.query.id).then(result => {
        return entityService.getChatRoomMessages(result)
    }).then(result => {
        res.send(result);
    })
    .catch(error => {
        console.error(error);
        res.status(500).send("error getting messages")
    })
})

router.get("/users", (req, res) => {
    if(req.query.id){
        let roomUsers = userService.getRoomUsers(req.query.id);

        if(roomUsers){
            res.send(roomUsers);
        } else {
            res.status(500).send("Incorrect parameters")
        }
    } else {
        res.status(500).send("ID param required");
    }
})




module.exports = router;