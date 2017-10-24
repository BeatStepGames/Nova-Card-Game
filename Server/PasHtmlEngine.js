var fs = require("fs");

let PasHtmlEngine = function(filePath,options,callback){
    fs.readFile(filePath,function(err,data){
        data = data.toString();
        for(let key in options){
            let e = new RegExp("#{\\s*"+key+"\\s*}","g");
            try{
                data = data.replace(e,options[key]);
            }
            catch(err){

            }
        }
        return callback(null,data);
    });
}
module.exports = PasHtmlEngine;