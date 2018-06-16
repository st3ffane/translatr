'use strict';

/**
 * Merge all keys from a buffer
 * @param {*} obj object to merge
 * @param {*} buffer a buffer to save keys
 * @param {*} head first part of key (if needed)
 */
function merge(obj, buffer={}, head='', separator='.'){
    
    Object.keys(obj).map( (el)=>{
      let tmp = obj[el];
      
      if(tmp instanceof Object) {
        merge(tmp, buffer, head+'.'+el);
      }
      else {
        buffer[head+separator+el] = tmp;
      }
    });
    return buffer;
  }

function unmerge(obj, buffer={}, head='', separator='.'){
  
  Object.keys(obj).map( (el)=>{
    let tmp = obj[el];
    
    // create object with path
    let path = el.split(separator);
    // don't care about path[0]    
    path.shift();

    // del last path as real key
    let key = path.pop();
    
    let cible = buffer;    
    for(let p of path){
      if (!cible[p]) cible[p]={};
      cible = cible[p];        
    }
    
    cible[key] =tmp; // take translation
    
  });
  return buffer;
}

module.exports = {
    merge: merge,
    unmerge: unmerge
}