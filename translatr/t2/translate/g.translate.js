/**
g.translate.js: lance des connections a google translate pour recupere les traductions
*/
const stream = require("stream");
const fs= require("fs");
var request = require("request");
var tk = require('../utils/taskqueue');

//const kvx = new RegExp(/(\w+);"([^"]+)"/);
/* var url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" 
            + sourceLang + "&tl=" + targetLang + "&dt=t&q=" + encodeURI(sourceText);
  
  var result = JSON.parse(UrlFetchApp.fetch(url).getContentText());
  
  translatedText = result[0][0][0];
 */

//Promessify la lib request, pour garder le style de codage
function request_promise(url){
    return new Promise( (resolve, reject)=>{
        request(url, (err, response, body)=>{
            if(err) reject(err);
            else resolve(body);
        });
    })
}


//csv reader: recupere un stream en input contenant les données au format csv
// key, "value"
//et lance les pools pour les traductions

let csv_reader = new stream.Transform({objectmode:true});
csv_reader._junk = null;
csv_reader._tasks = null;

csv_reader._google_translate = function(dt){
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
            let value = match[2]; */
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
}

//reception de nouveau chunks de données, convertie en string,
//recupere la clé et la valeur a traduire
csv_reader._transform = function(chunck, encoding, done){
    
    let dt = chunck.toString();//from buffer?
    
    if(this._junk) dt = this.junk + dt;//si en reste dans le buffer
    this._google_translate(dt);
    
    done();
    
}
//fin des données, envoie le restant
csv_reader._flush = function(done){
    //close writer, emit end envent
    this._google_translate(this._junk);
    
    done();//TODO
}



module.exports = function (config){

    return new Promise( (resolve, reject)=>{
        csv_reader.config = config;
        csv_reader._tasks = tk(config.connect);

        csv_reader._tasks.on('end',()=>{
            //ferme le stream
            console.log("end of tasks...")
            csv_reader.end();
        });
        let reader = fs.createReadStream(config.file,{encoding:'utf8'});        
        let writer = fs.createWriteStream(config.cible_file,{encoding:'utf8'});
        
        //e,d event not fired!!!
        reader.pipe(csv_reader,{end:false}).pipe(writer)
                    .on('end',()=>resolve())
                    .on('finish',()=>resolve())
                    .on('error',()=>{
                        writer.end();
                        resolve();  
                    });
    })
    

}
