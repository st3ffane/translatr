'use strict';
const fs = require('fs');
/**
 * Exporte les ressources du sites (ie!
 * - public-kimo/i18n/fr.js: traductions de l'appli web,
 * - )
 */

const locale = require('./res/medifroid/report.fr'); // le fichier a traduire
const TO_FILE = './traductions/medifroid/csv/reportfr.csv';
const HEAD = '';
// merge objects keys
function merge(obj, buffer={}, head=''){
  Object.keys(obj).map( (el)=>{
    let tmp = obj[el];
    
    if(tmp instanceof Object) {
      merge(tmp, buffer, head+'.'+el);
    }
    else {
      buffer[head+'.'+el] = tmp;
    }
  });
  return buffer;
}
function parsejson(json){
  try{
    return JSON.parse(fs.readFileSync(json));
  } catch( err ){ return {}; }
}

function loadMailDatas(file){
  let tmp = parsejson(file);
  // probleme, des key ont des . a l'interieur... on verra au moment du unmerge...
  let res = {};
  tmp.map( (el, index)=>{
    res[index+"_"+el.key+"_html"] = el.html;
    res[index+"_"+el.key+"_text"] = el.text.replace(/\r\n/g,' __ ');
    res[index+"_"+el.key+"_subject"] = el.subject;
  });
  return res;
}
function loadNotification(file){

}

// const report = parsejson('./res/fr.json');
// mail and notification a part....
//const mail = loadMailDatas('./res/mailtemplates.json');
//const notif = parsejson('./res/notifications.json');



// to csv file format
function csvify(obj, separator="|") {
  let lines = Object.keys(obj).map((el)=>`${el}${separator}${obj[el]}`);
  // lines.unshift(`key${separator}value`); // no need for csv header!
  return lines.join('\n');
}

let buffer = {};
merge(locale,buffer,HEAD);
//merge(report,buffer,'report');
//merge(mail,buffer,'mail');

let csv = csvify( buffer);
fs.writeFile(TO_FILE, csv,'utf-8', (err)=>{
  if(err) console.error(err);
  else console.log("OK!");
});