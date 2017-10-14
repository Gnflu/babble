var http = require('http');
var urlUtil = require('url');
var queryUtil = require('querystring');
var stats = {'users': "0" , 'messages' : "0"};

var clients = [];
var clients1 = [];
var clients2 = [];
var deletedID = -1;
var newUser = 0;
var messages = require('./messages-util');
var server = http.createServer(function(request, response) {

    response.setHeader('Access-Control-Allow-Origin', '*');
    ///////////////////////////////////////////////////////////////
    if (request.method === 'OPTIONS') {
      var headers = {};
      // IE8 does not allow domains to be specified, just the *
      // headers["Access-Control-Allow-Origin"] = req.headers.origin;
      headers["Access-Control-Allow-Origin"] = "*";
      headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
      headers["Access-Control-Allow-Credentials"] = false;
      headers["Access-Control-Max-Age"] = '86400'; // 24 hours
      headers["Access-Control-Allow-Headers"] = "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept";
      response.writeHead(204, headers);
      response.end();
    }
    /////////////////////////////////////////////////////////////////
    
   
    else if (request.method === 'GET') {
        var url = urlUtil.parse(request.url);
        var data = queryUtil.parse(url.query);
      
        if(url.path == '/stats'){
           
            if(newUser == 1) {
                newUser = 0;
              response.end(JSON.stringify(stats));
            
            } else {
             clients1.push(response);
            }
        }
        else if((url.path).substr(0, 10) == '/messages?'){
            var sentData = (url.path).split("?");
            var sentParam = sentData[1].split("=");
            if(sentParam[0] == sentData[1]){
                response.writeHead(405);
                response.end();
            }
            else if(sentParam[0] != "counter" || Number(sentParam[1]) == NaN){
                response.writeHead(400);
                response.end();
            }
            var count = url.path.replace(/[^0-9]*/, '');
            var msgArr = [];
            var i;
            if(messages.getLength() > count) {
         
               response.end(JSON.stringify( {
               counter: messages.getLength(),
               append: messages.getMessages(count)
            }));
            
            } else {
             clients.push(response);
            }
        }
        else if(url.path == '/deletedMessage'){
          
            clients2.push(response);

        }
     else{
        
            response.writeHead(404);
            response.end();
        }
    } else if (request.method === 'POST') {
        var url = urlUtil.parse(request.url);
        var data = queryUtil.parse(url.query);
        if(url.path == '/messages'){
             var store = '';
             var msg;
             request.on('data', function(data) 
              {
                  store += data;
              });
             request.on('end', function() 
             {
                 var msgArr = [];
                  msg = JSON.parse(store);
                  
                  var idm = messages.addMessage(msg);
                  
                   msgArr.push(msg);
            
             while(clients.length > 0) {
                 var client = clients.pop();
                 client.end(JSON.stringify( {
                 counter: messages.getLength(),
                 append: msgArr
                 }));
             }
             var numOfMsg = Number(stats.messages);
             numOfMsg += 1;
             stats.messages = String(numOfMsg);
             response.end(JSON.stringify( { id: idm}));
             });
            
        }
        else if((url.path).substr(0, 10) ==  '/register/'){
            var myParam = url.path.replace(/[^0-9]*/, '');
            if(isNaN(myParam)){
                response.writeHead(400);
                response.end();
            }
            var refresh = Number(myParam);
            newUser = 1;
            if(refresh == 0){
             var numOfOsers = Number(stats.users);
            numOfOsers += 1;
            stats.users = String(numOfOsers);
        }
            while(clients1.length > 0) {
                 var client = clients1.pop();
                 client.end(JSON.stringify(stats));
             }
             response.end();

        }
        else{
            response.writeHead(404);
            response.end();
        }
       
    }else if (request.method === 'DELETE'){
        var url = urlUtil.parse(request.url);
        if((url.path).substr(0, 10) == '/messages/'){
            var myParam = url.path.replace(/[^0-9]*/, '');
            if(isNaN(myParam)){
                response.writeHead(400);
                response.end();
            }
            
            var id = Number(myParam);
            deletedID = id;
            messages.deleteMessage(id);
            while(clients2.length > 0) {
                 var client = clients2.pop();
                 client.end(JSON.stringify( {
                 id: deletedID
                 }));
             }
            var numOfMsg = Number(stats.messages);
             numOfMsg -= 1;
             stats.messages = String(numOfMsg);
             response.end(JSON.stringify(true));
        }
        else{
            response.writeHead(404);
            response.end();
        }
        
    
    } else {
        response.writeHead(405);
        response.end();
    }
});

server.listen(9000);
console.log('listening...');