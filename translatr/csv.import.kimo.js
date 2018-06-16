'use strict';
/**
 * recrée les fichiers de ressources du sites (ie!
 * - public-kimo/i18n/fr.js: traductions de l'appli web,
 * - )
 */
const FROM_FILE = './traductions/medifroid/csv/reportfr.csv';
const TO_FILE = './traductions/medifroid/report/fr.json';
const CREATE_INNER_OBJECT = false;

const readline = require('readline');
const fs = require('fs');
const obj = {};

const rl = readline.createInterface({
      input: fs.createReadStream(FROM_FILE)
});

rl.on('line', function (line) {
      //split line by separator
      let infos = line.split('|');
      console.log(infos)
      // create object with path
      let path = infos[0].split('.');
      // don't care about path[0]
      
      path.shift();
      // del last path as real key
      let key = path.join('.'); 
      if(CREATE_INNER_OBJECT){
        key = path.pop();
      }
      
      let cible = obj;
      if(CREATE_INNER_OBJECT){
        for(let p of path){
          if (!cible[p]) cible[p]={};
          cible = cible[p];        
        }
      }
      cible[key] = infos[2]; // take translation
      console.log(key, infos[2])
});
rl.on('close', ()=>{
  // write to file
  fs.writeFileSync(TO_FILE, JSON.stringify(obj));
})