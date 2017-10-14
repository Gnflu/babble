
var message = [];


module.exports.getLength = function(){
        return message.length;
    };
module.exports.addMessage = function(msg){
        message.push(msg);
        return message.length - 1;
    };
module.exports.getMessages = function(counter){
        return message.slice(counter);
    };

module.exports.deleteMessage = function(id){
        
        message.splice(id-1, 1);
        
    };


















