'use strict';

const APIS = {
    'FREEGOOGLEAPI': require('./free.google'),
}
/**
 * Return translate engine to use in translatr
 * @param {*} name name of Api: FREE_GOOGLE_API, GOOGLE, BING, YAHOO
 * @return urlCreator for requesting api
 */
module.exports = (name)=> APIS[name] || APIS['FREEGOOGLEAPI'];
