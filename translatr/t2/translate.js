/**
    translate.js: recupere a partir d'un fichier csv de key,value
les traductions de value via google translate

ex:
    node translate.js -f /user/my/file.csv -s /user/my/final.csv --origin fr-fr --to en,es,po,ge --process 5 --connect 10

lance le script en utilisant le fichier /user/my/file.csv et sauvegarde les resultats dans un fichier 'file.csv',
la langue d'orifine est le francais
les traductions seront en anglais, espagnol, portugais et allemand
on lance 5 process a la fois, chacun utilisant un pool de 10 connections (soit 50 connections simultanées)

command line arguments:
    --help: affiche la liste des commandes et leurs descriptions, 
            appellé si aucun argument passé au script
    -f --file: path vers le fichiers source contennant les key => values REQUIRED
    -c --cible: path vers le dossier ou mettre le resultat REQUIRED
    --origin: langue utilisée dans le fichier source pour les values, defaut: fr-fr
    --to: liste des codes de langues dans lesquelles traduire les values defaut: en-us
    --process: le nombre de processus a lancer pour realiser la tache, defaut: 1
    --connect: le nombre de connections simultanées que chaque process peut lancer defaut: 5
    
*/

const config = require("./utils/command.line.config")();
const gtranslate = require("./translate/g.translate");


console.log("Translate Kimo csv files...");
console.log(config);
var start = process.hrtime();

var elapsed_time = function(note){
    var precision = 3; // 3 decimal places
    var elapsed = process.hrtime(start)[1] / 1000000; // divide by a million to get nano to milli
    console.log(process.hrtime(start)[0] + " s, " + elapsed.toFixed(precision) + " ms - " + note); // print message + time
    //start = process.hrtime(); // reset the timer
}
//translate en cours, pour l'instant, pas de process...
gtranslate(config).then( ()=>{
    elapsed_time("End translating");
}).catch(err=>{
	console.error(err);
});
