'use strict';


var request = require("request");
const http = require('http');
const agent = new http.Agent({maxSockets: 30}); // 5 concurrent connections per origin


//Promessify la lib request, pour garder le style de codage
function request_promise(url, options){
    return new Promise( (resolve, reject)=>{
        request(url, options, (err, response, body)=>{
            if(err) reject(err);
            else resolve(body);
        });
    })
}


/**
 * Free Google API implementation
 * Normaly for debugging purpose
 * @param {string} text text to translate
 * @param {string} apiKey user api key to use for translation (if needed)
 */
module.exports = (text,config)=>{
  
    
        let from = config.from || 'fr';
        let to = config.to[0] || 'en'; // only one for now....

                    
        let url = "http://translate.googleapis.com/translate_a/single?client=gtx&sl="
            + from + "&tl=" + to + "&dt=t&q=" + encodeURI(text);
            
        return request_promise(url,{agent: agent})
        .then ( (trs)=>{
            
            /* 
            [
                [
                    ["Internal","Interne",null,null,2]
                ],null,"fr"
            ]

            */
            let sent = JSON.parse(trs)[0][0][0];
            return sent;
        });
    
    
    
}