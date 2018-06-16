const os = require('os');
const fs = require('fs');
const path = require("path");

const LANGS = require("./langs");
const MAX_CONCURRENT_CONNECTIONS = 20;

const help = `
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
    --to: liste des codes de langues dans lesquelles traduire les values defaut: 'en'
    
    
    

    

`;

/**
Parse le contenu de la ligne de commande et renvoie un objet de configuration
pour le soft*/
module.exports = function(){
    /* Parse les arguments en ligne de commande */
    let args = require("minimist")(process.argv.slice(2));

    if (!args || Object.keys(args).length == 1 || args.help){
        console.log(help);
        process.exit(0);
    }

    const OPTIONS = {
        file: args.f || args.file,
        cible: args.c || args.cible || "./traductions",
        cible_file:"",
        origin: args.origin || "fr",
        to: args.to? args.to.split(',') : ["en"],
        process: +args.process || 1,
        connect: +args.connect || 5
    };
    
    //verifie la validité avant de lancer le tout...
    //le fichier doit exister
    if (!OPTIONS.file || !fs.existsSync(OPTIONS.file)) {
        console.error("\nError:\n\tLe fichier: ",OPTIONS.file,"n'existe pas, merci de verifier le path!\n");
        process.exit(0);
    }

    //on doit pouvoir ecrire dans le fichier cible
    //1: dossier existe
    
    var onlyFile = path.basename(OPTIONS.file);
    if (!fs.lstatSync(OPTIONS.cible).isDirectory()) {
        console.error("\nError:\n\tLe dossier: ",onlyPath,"n'existe pas, merci de verifier le path!\n");
        process.exit(0);
    }
    OPTIONS.cible_file = path.join(OPTIONS.cible,onlyFile);
    
    //origin DOIT etre un code connu
    if(LANGS.indexOf(OPTIONS.origin) == -1) OPTIONS.origin = "fr";//gracefully fallback
    //to: doit etre un tableau de code connu
    OPTIONS.to = OPTIONS.to.filter( (lg)=>{
        return LANGS.indexOf(lg)!=-1;
    });
    

    //process: compris entre 1 et nbr de processeurs
    let c_p  = os.cpus().length;
    if(OPTIONS.process < 1 || OPTIONS.process > c_p) OPTIONS.process = 1;//ou c_p?
    //connect comprise entre 1 et 20 (limitation a voir)
    if (OPTIONS.connect <1 || OPTIONS.connect >MAX_CONCURRENT_CONNECTIONS) OPTIONS.connect = MAX_CONCURRENT_CONNECTIONS;//le max par defaut

    return OPTIONS;
}
