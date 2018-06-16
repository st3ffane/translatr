'use strict';
const fs = require('fs');
const stream = require("stream");
const {merge} = require('../utils/merge');
const {loadFile} = require('../utils/file.loader');
/**
 * Create a file reader for a JS Object
 */

/**
 * Object keys iterator
 */
function* readProperties(obj){
    const keys = Object.keys(obj);
    for (let key of keys){
        let tmp = {
            key: key,
            value: obj[key]
        };
        
        yield tmp;
    }
    return null;
}

 module.exports = (path)=>{
    
    // let's go: parse data
    // load js file
    return loadFile(path)
    .then( (dt)=>{
         // merge keys for fast lookup
        let merged = merge(dt);
        const iterator = readProperties(merged);

        let res_reader = new stream.Readable({objectMode:true}); // use object, not strings
        //reception de nouveau chunks de données
        //recupere la clé et la valeur a traduire
        res_reader._read = function(){
            
            let dt =  iterator.next();
            // console.log("reading key: ",dt)
            if(dt.done || !dt.value){
                //this.emit('end');
                this.push(null);
            } 
            //this.emit('data',dt.value);
            this.push(dt.value)
        }
        
        return res_reader;
    });
   
 }

