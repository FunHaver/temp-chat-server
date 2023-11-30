const express = require('express');
const config = require('config');
const app = express();
const apiPort = config.get('networking.apiPort');
let cors = {}; 

const auth = require('./api/auth');
const chatRoom = require('./api/chatRoom');
const database = require('./database/database');
const ChatSocket = require("./ChatSocket");

let helpCLIMessage = function(){
    console.log("To run in production, do not add any arguments: node app.js");
    console.log("Available arguments:");
    console.log("--help to display help: node app.js --help");
    console.log("--dev to run in development modeL node app.js --dev");
}

if(process.argv.length > 3){
    console.log("ERROR: too many arguments!");
    helpCLIMessage();
    process.exit(1);
} else if (process.argv.length === 2){
    //noop
} else if (process.argv[2] === "--help"){
    helpCLIMessage();
} else if (process.argv[2] === "--dev") {
    cors = require("cors");
    app.use(cors({
        accessControlAllowOrigin: "http://localhost",
        optionsSuccessStatus: 200,
        allowedHeaders: '*',
        exposedHeaders: '*'
    }))
}

//Initialize database
database.initializeDatabase();

app.use(express.json());

app.use('/api/auth', auth);
app.use('/api/chatRoom', chatRoom);
app.listen(apiPort, "127.0.0.1", ()=> {
    console.log(`Temp chat listening on port: ${apiPort}`);
})
let chatSocket = new ChatSocket();
