'use strict';

const fs = require('fs');
const fspath = require('path');
const {promisify} = require('util');



// helper: promisify fs methods for elegance!
const fsstats = promisify(fs.stat);
const fsreadfile = promisify(fs.readFile);



/**
 * Load file by extention if exists
 * @param {*} path 
 */
function loadFile(path){
    if(!path || path.trim()=='') return Promise.reject('No path given');
    
    let ext = fspath.extname(path);
    switch(ext){
        case '.csv': return _loadCSVFile(path);
        case '':
        case '.js': return _loadJSFile(path);
        // default, assume json file
        default: return _loadJSONFile(path);                
    }
        
    return Promise.reject('Not a file...');
    
}
/**
 * Load json datas from file
 * @param {string} path file to load
 * @return Promise parsed json datas
 */
function _loadJSONFile(path) {
    
    return fsreadfile(path) 
    .then( (json)=> JSON.parse(json));
}
/**
 * Load js object from file (no ES6 export, only module.exports!!!)
 * @param {string} path file to load
 * @return Promise parsed json datas
 */
function _loadJSFile(path){
    return new Promise( (resolve, reject)=>{
        resolve(require(path))
    });
}
/**
 * Load csv datas from file
 * @param {string} path file to load
 * @return Promise parsed json datas
 */
function _loadCSVFile(path){
    // todo...
    return Promise.reject('Not implemented Yet');
}

/**
 * Test if path is a valid dir
 * @param {*} path folder to test
 */
function isDir(path){
    return fsstats(path)
        .then( (stats)=>{
            if(!stats.isDirectory()) return Promise.reject('Output must be a valid directory!');
            return true;
        });
}

module.exports = {
    loadFile: loadFile,
    isDir: isDir,
}