/**
Juste un fichier pour me generer des fichier csv tout simple
*/
const fs = require("fs");
const sentencer = require("sentencer");
const stream = require("stream");



const COUNT_SENTENCE = 100;

let counter = 1;
let cc = 1;
const KEY = "UV_";//le debut de la clé???


//par defaut, genere 1000 entrée dans la liste
//puis ecrit dans un fichier csv
let generator_stream = new stream.Readable({objectmode:true});
generator_stream._read = function(){
    if(counter>=COUNT_SENTENCE) this.push(null);//end?
    else {
        this.push(sentencer.make("This sentence has {{ a_noun }} and {{ an_adjective }} {{ noun }} in it.")); 
        counter++;
    }
    
    
    
}

let csv_stream = new stream.Transform({objectmode:true});
csv_stream._transform = function(chunck, encoding,done){
    if(!chunck) done();
    let dt = chunck.toString();

    //genere une clé
    let key = KEY+(cc++);
    //renvoie le csv
    let csv = key+',"'+chunck+'"\n';
    this.push(csv);
    done();
    

}
csv_stream._flush = function(done){
    console.log("ending");
}
let wstream = fs.createWriteStream('./tools/text3.csv');

generator_stream.pipe(csv_stream)
                .pipe(wstream);
