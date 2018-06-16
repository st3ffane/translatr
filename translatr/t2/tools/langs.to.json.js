/**
tools: ouvre le fichier langs.txt, parse le contenu et cree un fichier json
pour charger dans mon script principal
*/

const fs = require("fs");
const stream = require("stream");
const BLANK = /\s+/;


//la pipe de transformation des données
let toJsonStream = new stream.Transform ({ objectMode: true });
toJsonStream._transform = function(chunk, encoding, done){
    let data = chunk.toString();
    //should use buffering...


    if(this._lastLineData) data = this._lastLineData + data;
    else{
        //pour la syntaxe json, empaquete tout dans un object
        this.push('["_"');
    }
    let lines = data.split('\n');
    this._lastLineData = lines.splice(lines.length-1,1)[0];


    lines.forEach((line)=>{
        //here lives dragons!!!
        let dts = line.split(BLANK);
        //un numero au debut, on s'en fout
        //le nom -lisible en anglais, on s'en fout
        //le code
        if (dts.length == 2) this.push(',"'+dts[1]+'"');
        

    });

    done();
}

toJsonStream._flush = function (done){
    console.log("finally flush");
    if (this._lastLineData) this.push(this._lastLineData);
     this._lastLineData = null;

    //fin des données json, ferme le tableau
    this.push("]");
     done()
}

//recupere un stream de lecture vers le fichier
let rstream = fs.createReadStream('./tools/langs.txt');
//pipe sur un stream d'ecriture pour le json
let wstream = fs.createWriteStream('./tools/langs.json');
wstream.on('end',()=>{
    console.log("Fichier langs.json OK");
});
//c'est parti
rstream.pipe(toJsonStream).pipe(wstream);
