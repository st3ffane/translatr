Un simple outil pour me creer des fichiers csv de traductions
pour mes projets perso.

* fichiers csv contenant les labels a traduire:
key,"value"
ex: 
KEY_001,"Bonjour, merci d'avoir télécharger...."
KEY_002,"Cliquez ici!"

* lancer le script:
node translate.js -f ./meslabels.csv -c ./tranductions --origin fr --to en,es,po 
traduit les labels du fichier meslabels.csv du francais (fr) en anglais(en), espagnol(es) et portugais (po)
Sauvegarde les resultats dans le fichier /traductions/meslabels.csv