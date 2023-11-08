const express = require('express');
const entityService = require('../entityService');
const router = express.Router();

router.get('/', (req, res) => {
        entityService.getEntity("ChatRoom", req.query.id)
        .then(result => {
            if(result == null){
                res.status(404).send(result);
            } else {
                res.send(result);
            }
        }, reject => {
            console.log(reject)
            res.status(500).send(reject);
        }).catch(error => res.status(500).send(error));
    


})

module.exports = router;