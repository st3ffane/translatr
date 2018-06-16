const reader = require('../src/readers/js.reader');
const fspath = require('path');
const fs = require('fs');


const stream = require("stream");

let echo = new stream.Writable({objectMode: true});

echo.write = function(chunck, encoding, done) {
    console.log(chunck)
}

//make reader
let path = fspath.join(__dirname, '../translatr/res/tracklog/fr'); 
reader(path)
.then( (streamjs)=>{
    return new Promise( (resolve, reject)=>{
        console.log('OK')
        streamjs
        .pipe(echo)
        .on('end',()=>{console.log('end');resolve()})
        .on('finish',()=>{console.log('finish');resolve()})
        .on('error',()=>{
            echo.end();
            {console.log('error');resolve()} 
        });
    })
    
}).then( ()=>{
    console.log('finisj');
});
