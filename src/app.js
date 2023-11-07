const express = require('express');
const app = express();
const port = 3000;
let cors = {}; 

const auth = require('./api/auth');
const message = require('./api/message');
const database = require('./database/database');

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
        optionsSuccessStatus: 200
    }))
}

//Initialize database
database.initializeDatabase();

app.use(express.json());

app.use('/api/auth', auth);
app.use('/api/message', message);

app.listen(port, ()=> {
    console.log(`Temp chat listening on port: ${port}`);
})