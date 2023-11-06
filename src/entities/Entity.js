const crypto = require("crypto");

class Entity {
    uniqueId = '';
    className = 'entity';

    /**
     * 
     * @param {object | string} constructorArg name of the class that the instance belongs to
     */
    constructor(constructorArg){
        if(typeof constructorArg === "string"){
            this.className = constructorArg;
            this.uniqueId = this.generateUniqueId();
        } else if(typeof constructorArg === "object" && constructorArg["uniqueId"] !== undefined){
            for(const [key, value] of Object.entries(constructorArg)){
                    this[key] = value;
            }
        }

    }

    generateUniqueId(){
        return crypto.randomUUID({disableEntropyCache: true});
    }

    getUniqueId(){
        return this.uniqueId;
    }

    setUniqueId(uniqueId){
        this.uniqueId = uniqueId;
    }
}

module.exports = Entity;