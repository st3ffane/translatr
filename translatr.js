#!/usr/bin/env node
'use strict';
const meow = require('meow');
const fspath = require('path');

const engines = require('./src/engines');
const readers = require('./src/readers');
const {loadFile, isDir} = require('./src/utils/file.loader');
const {merge} = require('./src/utils/merge');
const translate = require('./src/translate');

const DEFAULT_CONF = {
    engine: 'FREEGOOGLEAPI', // default translator engine
    separator: ';', // defult csv separator
    from: 'fr', // default lang
    to: 'en', // default translate to
    checkkey: true, // check dict key par default
    thread: 10,
    concurrent: 10,
    exportcsv: false // export csv file for kimo
};

/**
 * Initialise options object.
 * @param {*} params CLI params
 * @return default configuration options
 */
function initOptions(cli){
    const params = cli.flags;

    let loader = null;
    // has a config file ?
    if(params.config)  loader = loadFile(params.config);
    else loader = Promise.resolve({}); // empty by default

    // load default configuration
    return loader
    // load input file(s)
    .then ( (config)=>{
        
        let c = Object.assign(DEFAULT_CONF, config, params); // params win!
        if(c.input){
            // check file(s) type(s) and get specific readers
            config.verbose && console.log('Check input files reader');
            let pathes = c.input.split(',').map( (file)=>{
                // get absolute path
                let abs_path = fspath.join(__dirname, file);
                const ext = fspath.extname(file); // get something like '.json', '.js', ...
                const reader = readers(ext);
                if(!reader) return null;

                return {
                    path: abs_path,
                    ext: ext,
                    reader: reader,
                }
            });
            c._inputs = pathes;
            return c;
            
        }        
        return Promise.reject('No input file');
    })
    // check if output folder exists...
    .then( (config)=>{
        
        config.output = config.output ? config.output : './';
        return isDir(config.output)
        .then( ()=> config );
    })
    // load dictionnary file(s): possible js, json, csv file
    // load it in memory, possible problems if use very large dictionnary?
    .then ( (config)=>{ 
        if(!config.dict || config.dict.trim() == '') return config; 
        const full_path = fspath.join(__dirname, config.dict);
        return loadFile(full_path)
        .then( (dt)=>{
            // merge dt keys to speed up search
            return merge(dt);
        })
        .then( (dt)=>{
            config._dictionnary = dt;
            return config;
        })
    })
    // other params
    .then ( (config)=>{ 
        // who will do the work
        config._engine = engines(config.engine || 'FREE_GOOGLE_API');
        config.thread = config.thread > 1 || config.thread < 10 ?  config.thread : 10; 
        config.concurrent = config.concurrent > 1 || config.concurrent < 10 ? config.concurrent : 10;   
        // lang to translate to
        config.from = config.from ? config.from : 'fr'; // default to french
        config.to = config.to ? config.to.split(',') : ['en']; // default to english
        
        return config;
    });
}
/**
 * Check CLI arguments for translater
 */
const cli = meow(`
    Usage (don't forget the first empty --!)
      $ npm run translatr -- --parameter1=value1

    Options
      --help     \t\tDisplay usage and help
      --version, -v\tDisplay application version
      --engine   \t\twhich engine to use. Values are:
                 \t\tFREEGOOGLEAPI, GOOGLE, BING, YAHOO
                 \t\tdefault to FREEGOOGLEAPI
      --apikey   \t\tif engine need an api key
      --input, -i\t\tInput file(s) to translate, comma separated, can be js files,
                 \t\tjson or csv files
      --descriptor \tdescribe which property to translate in input files
                 \t\tsee readme for exemple
      --ouput, -o\t\toutput folder to place translated files
      --separator\t\tseparator for csv files (input and output) default ';'
      --from, -f \t\tlanguage of given files (only one permit)
                 \t\tdefault to 'fr'
      --to, -t   \t\tlangs (can have more than one, comma seraparated)
                 \t\tto translate to. Default to 'en'
      --dict, -d \t\tUse a dictionary as primary translations 
                 \t\tsource (js/json or csv file).
                 \t\tIf no 'perfect' translations are found, will look
                 \t\tto google translate. OR check keys?
      --checkkey \t\tcheck only translation in dictionnary by key (default: true)
      --thread   \t\tsize of pool 'thread' to use. Default 10
      --concurrent\tNumber of concurrent connections. Default to 10
      --config   \t\ta config file to pass all params at once
                 \t\tthose params will be overwritten by the options
      --exportcsv\t\tExport translation in KIMO Instrument csv format
      --verbose  \t\tyou talkin to me?
 
    Examples
    translate file.js in spanish, german and portugese. Save in ./folder
      $ npm run translatr -- -f=./file.js -o=./folder -t=es,de,po 
    `, {
    flags: {
        engine:{
            type: 'string',
        },
        apikey:{
            type: 'string',
        },
        input: {
            type: 'string',
            alias: 'i',
        },
        descriptor:{
            type: 'string',
        },
        output: {
            type: 'string',
            alias: 'o',
        },
        separator:{
            type: 'string',
        },
        from: {
            type: 'string',
            alias: 'f',
        },
        to: {
            type: 'string',
            alias: 't',
        },
        dict: {
            type: 'string',
            alias: 'd',
        },
        checkkey: {
            type: 'boolean',
        },
        thread: {
            type: 'string',
        },
        concurrent: {
            type: 'string',
        },
        config:{
            type: 'string',
        }
    },
});


// dev purpose ///////////////////
let start = 0;
const elapsed_time = function(note){
    var precision = 3; // 3 decimal places
    var elapsed = process.hrtime(start)[1] / 1000000; // divide by a million to get nano to milli
    console.log(process.hrtime(start)[0] + " s, " + elapsed.toFixed(precision) + " ms - " + note); // print message + time
    //start = process.hrtime(); // reset the timer
}
/////////////////////////////////


// check options
start = process.hrtime();
initOptions(cli)
// do the dance, DO.THE.DANCE!
.then ( (config)=>{
    config.verbose && elapsed_time("Option parsing");
    start = process.hrtime();
    return translate(config).then ( ()=> config);
})
.then( (config)=>{
    config.verbose && elapsed_time("Translation OK");
})
.catch( (err)=>{
    console.error('TranslatR: Aborting process...')
    console.error(err);
});


