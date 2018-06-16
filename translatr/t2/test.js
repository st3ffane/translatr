var request = require("request");
//const kvx = new RegExp(/(\w+),"([^"]+)"/);
function request_promise(url){
    return new Promise( (resolve, reject)=>{
        request(url, (err, response, body)=>{
            if(err) reject(err);
            else resolve(body);
        });
    })
}

var langs = ['en'];
var value = `Le député de la France insoumise (FI), Alexis Corbière, était invité samedi soir dans l’émission "On n’est pas couché" sur France 2.`;
console.log("Taille du buffer: ",value.length)
/*let line = 'akey,"welcome to the jungle, we got fun and games"';//test only
//recupere la clé et valeur
let match = kvx.exec(line);

if(match.length == 3){
    
    let key = match[1];
    let value = match[2];*/
    let promises = [];
    langs.forEach( (lg)=>{
        let url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl="
            + "fr" + "&tl=" + lg + "&dt=t&q=" + encodeURI(value);
        //simple one, send to google translate
        promises.push(request_promise(url));
    });
    
    //get answer, send to writer
    Promise.all(promises).then( (translations)=>{
        //push le resultat
        let t = translations.map( (trans)=>{
            
            return JSON.parse(trans)[0][0][0];//pfuu
        })
        console.log(t);
    });

//}
