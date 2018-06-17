'use strict';

//do the dance, DO.THE.DANCE!


const stream = require("stream");
const fs= require("fs");
const fspath = require('path');
const {unmerge} = require('./utils/merge');
//const kvx = new RegExp(/(\w+);"([^"]+)"/);
/* var url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" 
            + sourceLang + "&tl=" + targetLang + "&dt=t&q=" + encodeURI(sourceText);
  
  var result = JSON.parse(UrlFetchApp.fetch(url).getContentText());
  
  translatedText = result[0][0][0];
 */



function createTranslaterStream(config){
    let res_reader = new stream.Transform({objectMode:true}); // use object, not strings
    //reception de nouveau chunks de données, convertie en string,
    //recupere la clé et la valeur a traduire
    res_reader._transform = function(chunck, encoding, done){
        // read datas
        
        let dt = chunck;//from buffer?
        let path = dt.key.split('.');
        path[0] = '';
        let key = path.join('.'); // clear first element (file name)

        let async_translate = null;

        // if config.dict, search for key
        if(config._dictionnary && config._dictionnary[key]) {
            async_translate = Promise.resolve(config._dictionnary[key]);
            //dt.value = config._dictionnary[key];            
        } else {
            // google translate
            let engine = config._engine;
            async_translate = engine(dt.value, config); // une seule langue pour l'instant....
            dt.value = dt.value.toUpperCase();
        }


        async_translate.then( (translated)=>{
            dt.value = translated; 
            this.push(dt)
            done();
        });
        
        
        
    }
    //fin des données
    res_reader._flush = function(done){
        done();//TODO
    }

    return res_reader;
}


function createUnmergerStream(config){
    let unmerge_writer = new stream.Transform({objectMode:true}); // pour recreer les inner objects
    unmerge_writer._result = {};
    unmerge_writer._transform = function(chunck, encoding, done){     
        this._result[chunck.key] = chunck.value;
        done();
    }
    unmerge_writer.end = function() {
        // unmerge all
        console.log('hello')
        let tmp = unmerge(this._result);
        this.push(JSON.stringify(tmp));

        //this.emit('end'); // end buffer
    };

    return unmerge_writer;
}

/**
 * Pour l'instant, test avec un seul fichier....
 * @param {*} config 
 */
module.exports = function (config){

   return new Promise( (resolve, reject)=>{
        // creation du reader
        //resource reader: recupere un stream en input contenant les données au format  key, "value"
        //et lance les pools pour les traductions

        // ouverture du fichier, utilise le readstream du format de fichier
        // only first one for now;....
        let reader = config._inputs[0].reader;       
        let res_reader = createTranslaterStream(config);
        let unmerge_writer = createUnmergerStream(config);
        let writer = fs.createWriteStream('./test.txt'); // TODO: pour l'instant, ecrit dans un seul fichier
        
        /*res_reader._junk = null;
        res_reader._tasks = null;


        // une methode pour appeler le traducteur
        res_reader._translate = function(dt){
            let config = this.config;
            let tk = this._tasks;

            //split by \n
            let lines = dt.split('\n');
            this._junk = lines.pop(); //derniere en junk
            //1000 promesses????
            

            lines.forEach ( (line)=>{

                
                //test only
                //recupere la clé et valeur
                //let match = kvx.exec(line);
                let match = line.split('|');

                
                if(match.length >= 2){// && match[0]!="KEY"){

                
                    let promises = [];

                    /* let key = match[1];
                    let value = match[2]; *
                    let value = match[1];//le label a traduire
                    
                    let self = this;
                    let task = function(){
                        config.to.forEach( (lg)=>{
                            
                                
                            let url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl="
                                + config.origin + "&tl=" + lg + "&dt=t&q=" + encodeURI(value);
                            //simple one, send to google translate
                            promises.push( request_promise(url)  );
                            
                            
                        });
                        return Promise.all(promises).then ( (trs)=>{
                            
                            let sent =  trs.map( (el)=>JSON.parse(el)[0][0][0] );
                            
                            //sent.unshift(value);
                            //self.push(key+',"'+value+'","'+sent.join('","')+'"\n');
                            //envois au fichier de données
                            console.log(sent)
                            self.push(line+"|"+sent.join('|')+'\n');
                        });
                    }
                    tk.push(task)
                    
                    
                } 

            });
            //lance les downloads au besoin
            tk.next()
        }*/

        //e,d event not fired!!!
        return reader(config._inputs[0].path)
        .then( (keyvaluereader)=>{
            return new Promise( (resolve, reject)=>{
                keyvaluereader
                .pipe(res_reader) //,{end:false})
                .pipe(unmerge_writer)
                .pipe(writer)
                .on('end',()=>{
                    console.log('end')
                    resolve();
                })
                .on('finish',()=>{
                    console.log('finish')
                    resolve();
                })
                .on('error',()=>{
                    //writer.end();
                    resolve();  
                });
            });
            
        })
        .then( ()=>{
            console.log('Finish')
            
        })
        
    });
    

}
