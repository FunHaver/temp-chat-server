const Entity = require('../entities/Entity');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');
// const db = new sqlite3.Database('test.sqlite3');


//Initialize db schema
class Database {

    constructor(){
    }

    /**
     * Generates database tables.
     */
    initializeDatabase(){
        db.serialize(()=>{
            db.run(`CREATE TABLE user(unique_id VARYING CHARACTER(255) UNIQUE PRIMARY KEY NOT NULL, 
                    username VARYING CHARACTER(25) NOT NULL, 
                    chat_room_id VARYING CHARACTER(255), 
                    FOREIGN KEY(chat_room_id) REFERENCES chat_room(unique_id))`);
            db.run(`CREATE TABLE chat_room(unique_id VARYING CHARACTER(255) UNIQUE PRIMARY KEY NOT NULL,
                    name VARYING CHARACTER(255) NOT NULL)`);
            db.run(`CREATE TABLE message(unique_id VARYING CHARACTER(255) UNIQUE PRIMARY KEY NOT NULL,
                    content VARYING CHARACTER(255) NOT NULL,
                    user_id VARYING CHARACTER(255) NOT NULL,
                    chat_room_id VARYING CHARACTER(255) NOT NULL,
                    creation_time TEXT NOT NULL,
                    FOREIGN KEY(user_id) REFERENCES user(unique_id),
                    FOREIGN KEY(chat_room_id) REFERENCES chat_room(unique_id))`);
        })
    }

    /**
     * converts camelCase to snake_case
     * @param {string} name 
     * @returns {string}
     */
    camelToSnakeCase(name) {
        let newString = '';
        for(let i = 0; i < name.length; i++){
            let character = name[i];
            if(!/[A-Za-z]/.test(character)){
                throw new Error("ERROR: Class and Property names must only contain alphabetical characters.", `Violating name: ${name}`);
            } else if(i === 0){
                newString += character.toLowerCase();
            } else if(/[A-Z]/.test(character)) {
                const snaked = "_" + character.toLowerCase();
                newString += snaked;
            } else {
                newString += character;
            }
        }
        return newString;
    }

    /**
     * 
     * @param {string} name 
     * @returns camelCased version of snake case string
     */
    snakeToCamelCase(name){
        let newString = '';
        let nextIsUpper = false;
        for(let i = 0; i < name.length; i++){
            let character = name[i];
            if(character === "_"){
                nextIsUpper = true;
            } else if(nextIsUpper){
                newString += character.toUpperCase();
                nextIsUpper = false;
            } else {
                newString += character;
            }
        }
        return newString;
    }
    /**
     * Store property on entity row.
     * @async
     * @param {Entity} entity 
     * @param {string} propertyName
     */
    async updateProperty(entity, propertyName, propertyValue){
        let table = this.camelToSnakeCase(entity.className);
        let columnName = this.camelToSnakeCase(propertyName);
        let updatePromise = async function() 
        { 
            return new Promise((resolve, reject) => {
                db.run(`UPDATE ${table} set ${columnName} = $value where unique_id = $uniqueId`,{
                    $value: propertyValue,
                    $uniqueId: entity.getUniqueId()
                }, function(err) {
                    if(err){
                        console.error(err)
                        reject(`Error writing value ${propertyValue} to property ${propertyName} on ${entity.className} with uniqueId ${entity.getUniqueId()}`)
                    } else {
                        resolve()
                    } 
                })}
            )}
        return await updatePromise()
    }

    /**
     * @async
     * @param {Entity} entity 
     * @param {string} propertyName 
     * @returns {Object} results of the query
     */
    async readProperty(entity, propertyName){
        let table = this.camelToSnakeCase(entity.className);
        let columnName = this.camelToSnakeCase(propertyName);
        let readPromise = function(){
            return new Promise((resolve, reject) => {
                db.run(`SELECT ${columnName} from ${table} where unique_id = $uniqueId`, {
            $uniqueId: entity.getUniqueId
        }, function(result, error){
            if(error){
                reject(error);
            } else {
                resolve(result)
            }
        })})
        }
        return await readPromise();
    }

    /**
     * @async
     * @param {Entity} entity 
     * @param  {Object} properites.
     */
    async createEntity(entity, properites){
        
        let table = this.camelToSnakeCase(entity.className);
        let queryStringStart = `INSERT INTO ${table}(`;
        let queryStringValues = ") VALUES (";
        let queryStringEnd = ")";
        let valueObj = {};
        let count = 0;
        for(const [key, value] of Object.entries(properites)){
            let columnName = this.camelToSnakeCase(key);
            valueObj[`$${key}`] = value;
            if(count === 0){
                queryStringStart += `${columnName}`;
                queryStringValues += `$${key}`;
            } else {
                queryStringStart += `,${columnName}`;
                queryStringValues += `,$${key}`;
            }
            count++;
        }

        let createPromise = async function(){
                return new Promise((resolve, reject) => {
                    db.run(`${queryStringStart}${queryStringValues}${queryStringEnd}`, valueObj, function(error){
                if(error){
                    console.error(error)
                    reject(`Error persisting new entity ${entity.className}`);
                } else {
                    resolve("Created");
                }
            })})
        }

        return await createPromise();
    }

    /**
     * @async
     * @param {string} className camelCase class of obj you want
     * @param {string} uniqueId 
     * @returns {Object} object representing the data stored in the db
     */
    async readEntity(className, uniqueId){
        let table = this.camelToSnakeCase(className);
        let readPromise = async function(){
            return new Promise((resolve, reject) => {
                db.get(`SELECT * from ${table} where unique_id = $uniqueId`, 
                {
                    $uniqueId: uniqueId
                }, function(error, row){
                    if(error){
                        console.error(error)
                        reject(`Error retrieving ${className} with uniqueId ${uniqueId}`)
                    } else {
                        resolve(row);
                    }
                })})
        }

        let result = await readPromise();
        if(result == null){ //null or undefined
           return null;
        }

        let resultCamel = {
            className: className
        }
        for(const [key, value] of Object.entries(result)){
            let camelKey = this.snakeToCamelCase(key);
            resultCamel[camelKey] = value;
        }
        return resultCamel;

    }
    /**
     * @async
     * @param {Entity} entity 
     */
    async deleteEntity(className, uniqueId){
        let table = this.camelToSnakeCase(className);
        let deletePromise = async function(){
            return new Promise((resolve, reject) => {
                db.run(`DELETE from ${table} where unique_id = $uniqueId`, 
                {
                    $uniqueId: uniqueId
                }, function(error){
                    if(error){
                        console.error(error);
                        reject(`Cannot delete ${entity.className} with uniqueId ${uniqueId}`);
                    } else {
                        resolve();
                    }
                })
            })
        }
        return await deletePromise();
    }

    async deleteEntities(className, columnName, columnData){
        let table = this.camelToSnakeCase(className);
        let column = this.camelToSnakeCase(columnName);

        let deletePromise = async function(){
            return new Promise((resolve, reject) => {
                db.run(`DELETE from ${table} where ${column} = $columnValue`,
                {
                    $columnValue: columnData
                }, function(error){
                    if(error){
                        console.error(error);
                        reject(`Cannot delete ${className}s with ${column} value ${columnData}`);
                    } else {
                        resolve();
                    }
                })
            })
        }

        return await deletePromise();
    }

    async queryEntityForProperty(className, property, propertyValue){
        let table = this.camelToSnakeCase(className);
        let column = this.camelToSnakeCase(property);
        let readPromise = async function(){
            return new Promise((resolve, reject) => {
                db.all(`SELECT * from ${table} where ${column} = $propertyValue`,{
                    $propertyValue: propertyValue
                }, function(error, rows){
                    if(error){
                        console.error(error);
                        reject(`Cannot query ${property} on table ${table}`);
                    } else {
                        resolve(rows);
                    }
                })
            })
        }

        let result = await readPromise();
        if(result == null){ //null or undefined
           return null;
        }

        let resultCamel = []
        for(let i = 0; i < result.length; i++){
            resultCamel.push({
                "className": className
            })
            for(const [key, value] of Object.entries(result[i])){
                let camelKey = this.snakeToCamelCase(key);
                resultCamel[i][camelKey] = value;
            }
        }
        return resultCamel;
    }
}


module.exports = new Database();