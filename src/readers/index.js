'use strict';


const jsreader = require('./js.reader');
/**
 * Return streamReader for this type of file
 * Accepted: json, js, csv
 * @param {*} ext extention of file to stream
 */
module.exports = (ext)=>{
    switch(ext) {
        case '.js':
        case '.json': {
            return jsreader;
        }
        default: break;
    }
    throw 'Unsupported file format';
}