const util = require('util');

function fullLog(obj){
    return console.log(util.inspect(obj, false, null, true));
}

module.exports = { fullLog };