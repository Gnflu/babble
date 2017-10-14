
Babble = {
    babble : 0 ,
    refresh : 0 ,
    register : function(userInfo){
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST","http://localhost:9000/register/" + this.refresh);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send();
        var userObject = { 'currentMessage': " ", 'userInfo': userInfo};
        localStorage.setItem('babble', JSON.stringify(userObject));
        } 
    ,
    postMessage : function(message, callback){
        var form = document.querySelector('form');
        var xhttp = new XMLHttpRequest();
        xhttp.open(form.method,form.action);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.addEventListener('load', function (e) { 
         
    });
        xhttp.send(JSON.stringify(message));
        
         xhttp.onreadystatechange = function () { if(xhttp.readyState == 4 && xhttp.status == 200) {
            callback(JSON.parse(xhttp.responseText));}
        }
       
    },
    deleteMessage : function(id, callback){
         var xhttp = new XMLHttpRequest();
         xhttp.open("DELETE","http://localhost:9000/messages/" + id);
         xhttp.setRequestHeader("Content-type", "application/json");
         xhttp.send();
        
         
         xhttp.onreadystatechange = function () { 
             if(xhttp.readyState == 4 && xhttp.status == 200) {
             var str = "{" + xhttp.responseText + "}";
            callback(JSON.parse(xhttp.responseText));}
       }
    },
    getStats : function(callback){
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET","http://localhost:9000/stats");
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send();

        xhttp.onreadystatechange = function () { if(xhttp.readyState == 4 && xhttp.status == 200) {
            callback(JSON.parse(xhttp.responseText));
        }
        }
    },
    getMessages : function(counter, callback){
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET","http://localhost:9000/messages?counter=" + String(counter));
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send();
        xhttp.onreadystatechange = function () { if(xhttp.readyState == 4 && xhttp.status == 200) {
            callback(JSON.parse(xhttp.responseText));
            
            }
        }
    },
    getDeletedMessage : function(callback){
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET","http://localhost:9000/deletedMessage");
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send();
        xhttp.onreadystatechange = function () { if(xhttp.readyState == 4 && xhttp.status == 200) {
            callback(JSON.parse(xhttp.responseText));
            }
        }
    }


};
//////////////////////////////////////////////////////////////////////////////////////// on save buttun

document.querySelector('form').addEventListener('submit', function(e) {
    e.preventDefault();
    var msg = JSONmsg();
    Babble.postMessage(msg,afterPost);

    
});

function post(message){
    var name = message.name;
    var empty = '';
    var imgScr;
    if(name == empty){
        name = "Anonymous";
        imgScr = "images/anonymous.png";
    }
    else{
        imgScr = get_gravatar(message.email,50);
    }
    
    var time = unixToHHMMSS((message.timestamp));
    var li = document.createElement('li');
         
         li.onmouseover=function(){getIndex(this);};
         li.innerHTML = '<span class="img-msg">'+'<img alt="" class="img-circle" src='+ imgScr + '>' +
                     '<div class="msg" tabindex="0" >' +
                       '<p class="small">' +
                        '<cite class="names">' + name+'</cite> '+ '<span class="time">' + '<time>' + time + '</time>' + '</span>' + '<span class="delete-btn"><button class="link" onclick="deletemsg();" aria-label="delete message">&#10006;</button></span> <br>' +
                       message.message + 
                       '</p>' +
                     
                     '</div>' +
                     '</span>' +
                     '<p class="between"><br></p>';            
        document.getElementById("msgList").appendChild(li);
        var numOfmsg = document.getElementById("numOfMsg").innerText;
        numOfmsg = Number(numOfmsg)+1;
        document.getElementById("numOfMsg").innerText = numOfmsg;
        var element = document.getElementById("msgList");
        element.scrollTop = element.scrollHeight;

}

function unixToHHMMSS(s){
    // Create a new JavaScript Date object based on the timestamp
    // multiplied by 1000 so that the argument is in milliseconds, not seconds.
    var date = new Date(s*1000);
    // Hours part from the timestamp    
    var hours = date.getHours();
    // Minutes part from the timestamp
    var minutes = "0" + date.getMinutes();
    // Seconds part from the timestamp
    var seconds = "0" + date.getSeconds();

    // Will display time in 10:30:23 format
    var formattedTime = hours + ':' + minutes.substr(-2);
    return formattedTime;

}


function poll(response){
    var i;
    var counter = Number((response).counter);
    var messages = (response).append;
    // show message on screen
    for(i=0; i < Number(messages.length) ; i++){
        post(messages[i]);
    }
    Babble.getMessages(counter, poll);
}

function poll1(response){
    updateStats((response));
    Babble.getStats(poll1);
}

function poll2(response){
    deleteFromScreen((response).id);
    Babble.getDeletedMessage(poll2);
}





function JSONmsg(){
     ApplyLineBreaks("msgTxtArea");
    var text = document.getElementById("msgTxtArea").value;
    text = text.replace(/\n\r?/g, '<br>\n'); ///<br\s*[\/]?>/gi
   
    document.getElementById("msgTxtArea").value = '';
    document.getElementById("msgTxtArea").style.height = 'auto';
    document.getElementById('msgTxtArea').addEventListener("input", OnInput, false);
    document.getElementById('msgTxtArea').onkeyup = function(e){
  e = e || event;
  if (e.keyCode === 13 && !e.ctrlKey) {
    var msg = JSONmsg();
    Babble.postMessage(msg,afterPost);
  }
  return true;
 }
    var current = 'currentMessage';
    var info = 'userInfo';
    // Retrieve the object from storage
    var userObject = localStorage.getItem('babble');
    var user = JSON.parse(userObject);
    user[current] = text;
    localStorage.setItem('babble', JSON.stringify(user));
    /////////////////////////////////////////////////////
   var timeStamp = new Date();
   var unix = Math.round(+new Date()/1000);
    ////////////////////////////////////////////////////
    
    timeStamp = timeStamp.getTime();
   var message = {
       name : user.userInfo.name,
       email : user.userInfo.email,
       message : text ,
       timestamp : unix
   }
   return message;
   
}

function getIndex(node) {
  var babbleIndex = 'babble';
  var index;
  var childs =  node.parentNode.childNodes;
  for (i = 0; i < childs.length; i++) {
    if (node == childs[i]) break;
  }
  Babble[babbleIndex] = i;
 
     
}




function deletemsg() {
    var babbleIndex = 'babble';
    var id = Babble[babbleIndex];
    var name = document.getElementsByClassName("names")[id-1].innerHTML;
    var userObject = localStorage.getItem('babble');
    var user = JSON.parse(userObject);
    if(name == user.userInfo.name){
        Babble.deleteMessage(String(id),afterDelete);
    }
};

function afterDelete(obj){
    return;
}

function deleteFromScreen(id){
    var list = document.getElementById("msgList");
    list.removeChild(list.childNodes[id]); //babble
    var numOfmsg = document.getElementById("numOfMsg").innerText;
    numOfmsg = Number(numOfmsg)-1;
    document.getElementById("numOfMsg").innerText = numOfmsg;
}

function updateStats(statObj){
   // document.getElementById("numOfMsg").innerText = statObj.messages;
    document.getElementById("numOfUsers").innerText = statObj.users;
};

window.addEventListener('unload', function(event) {
  var text = document.getElementById("msgTxtArea").value;
    text = text.replace(/\n\r?/g, '<br>\n'); ///<br\s*[\/]?>/gi
    // Retrieve the object from storage
    var userObject = localStorage.getItem('babble');
    //userObject.currentMessage = text;
    var user = JSON.parse(userObject);
    user.currentMessage = text;
    localStorage.setItem('babble', JSON.stringify(user));
    
}, false);




function checkRefresh()
{
	if( event.currentTarget.performance.navigation.type == 0 )
	{
		
        var sideBar = localStorage.getItem('babble');
        var userInfo = { 'name': '' , 'email': '' };
        var userObject = { 'currentMessage': " ", 'userInfo': userInfo};
        localStorage.setItem('babble', JSON.stringify(userObject));
		document.getElementById("close").onclick = function () {
        document.getElementById('modal').style.display = "none";
        document.getElementById('modalOverLay').style.display = "none";
        var userInfo1 = { 'name': '' , 'email': '' };
        Babble.refresh = 0;
        Babble.register(userInfo1);
        Babble.getStats(poll1);
        Babble.getMessages(0, poll);
        Babble.getDeletedMessage(poll2);
    };
    document.getElementById("save").onclick = function () {
        var name = document.getElementById("name").value;
        var email = document.getElementById("email").value;   

        var userInfo1 = { 'name': name , 'email': email };
        Babble.refresh = 0;
        Babble.register(userInfo1);
        document.getElementById('modal').style.display = "none";
        document.getElementById('modalOverLay').style.display = "none";
         
        Babble.getStats(poll1);
        
        Babble.getMessages(0, poll);
        Babble.getDeletedMessage(poll2);
    };
  
	}
	else
	{
		 document.getElementById('modal').style.display = "none";
         document.getElementById('modalOverLay').style.display = "none";
         var retrievedObject = localStorage.getItem('babble');
         if (localStorage.getItem('babble') === null) {
             var userInfo = { 'name': '' , 'email': '' };
             var userObject = { 'currentMessage': " ", 'userInfo': userInfo};
             localStorage.setItem('babble', JSON.stringify(userObject));
         }
         var userInfo2 = JSON.parse(localStorage.getItem('babble')).userInfo;
         document.getElementById("msgTxtArea").value = JSON.parse(localStorage.getItem('babble')).currentMessage;
         Babble.refresh = 1;
         Babble.register(userInfo2);
         Babble.getStats(poll1);
         Babble.getMessages(0, poll);
         Babble.getDeletedMessage(poll2);
         
	}
} 


window.onload = function () {
    checkRefresh();    
};

function Textarea(textarea){
    textarea.value.replace(/\r/g,'').split('\n');
}

function limitTextarea(textarea,maxLines){
    var lines=textarea.value.replace(/\r/g,'').split('\n'),
    lines_removed,
    i;
    if(maxLines&&lines.length>maxLines){
        lines=lines.slice(0,maxLines);
        lines_removed=1
}

if(lines_removed)textarea.value=lines.join('\n')
}

function watchTextarea(){
document.getElementById('resticted').onkeyup()
}

function ApplyLineBreaks(strTextAreaId) {
    var oTextarea = document.getElementById(strTextAreaId);
    if (oTextarea.wrap) {
        oTextarea.setAttribute("wrap", "off");
    }
    else {
        oTextarea.setAttribute("wrap", "off");
        var newArea = oTextarea.cloneNode(true);
        newArea.value = oTextarea.value;
        oTextarea.parentNode.replaceChild(newArea, oTextarea);
        oTextarea = newArea;
    }

    var strRawValue = oTextarea.value;
    oTextarea.value = "";
    var nEmptyWidth = oTextarea.scrollWidth;

    function testBreak(strTest) {
        oTextarea.value = strTest;
        return oTextarea.scrollWidth > nEmptyWidth;
    }

    function findNextBreakLength(strSource, nLeft, nRight) {
        var nCurrent;
        if(typeof(nLeft) == 'undefined') {
            nLeft = 0;
            nRight = -1;
            nCurrent = 64;
        }
        else {
            if (nRight == -1)
                nCurrent = nLeft * 2;
            else if (nRight - nLeft <= 1)
                return Math.max(2, nRight);
            else
                nCurrent = nLeft + (nRight - nLeft) / 2;
        }
        var strTest = strSource.substr(0, nCurrent);
        var bLonger = testBreak(strTest);
        if(bLonger)
            nRight = nCurrent;
        else
        {
            if(nCurrent >= strSource.length)
                return null;
            nLeft = nCurrent;
        }
        return findNextBreakLength(strSource, nLeft, nRight);
    }

    var i = 0, j;
    var strNewValue = "";
    while (i < strRawValue.length) {
        var breakOffset = findNextBreakLength(strRawValue.substr(i));
        if (breakOffset === null) {
            strNewValue += strRawValue.substr(i);
            break;
        }
        var nLineLength = breakOffset - 1;
        for (j = nLineLength - 1; j >= 0; j--) {
            var curChar = strRawValue.charAt(i + j);
            if (curChar == ' ' || curChar == '-' || curChar == '+') {
                nLineLength = j + 1;
                break;
            }
        }
        strNewValue += strRawValue.substr(i, nLineLength) + "\n";
        i += nLineLength;
    }
    oTextarea.value = strNewValue;
    oTextarea.setAttribute("wrap", "");
};



function scrolldown(){
    var element = document.getElementById("msgTxtArea");
    element.scrollTop = element.scrollHeight;
}

////////////////////////////////////////////////////////////////
function get_gravatar(email, size) {

    var MD5=function(s){function L(k,d){return(k<<d)|(k>>>(32-d))}function K(G,k){var I,d,F,H,x;F=(G&2147483648);H=(k&2147483648);I=(G&1073741824);d=(k&1073741824);x=(G&1073741823)+(k&1073741823);if(I&d){return(x^2147483648^F^H)}if(I|d){if(x&1073741824){return(x^3221225472^F^H)}else{return(x^1073741824^F^H)}}else{return(x^F^H)}}function r(d,F,k){return(d&F)|((~d)&k)}function q(d,F,k){return(d&k)|(F&(~k))}function p(d,F,k){return(d^F^k)}function n(d,F,k){return(F^(d|(~k)))}function u(G,F,aa,Z,k,H,I){G=K(G,K(K(r(F,aa,Z),k),I));return K(L(G,H),F)}function f(G,F,aa,Z,k,H,I){G=K(G,K(K(q(F,aa,Z),k),I));return K(L(G,H),F)}function D(G,F,aa,Z,k,H,I){G=K(G,K(K(p(F,aa,Z),k),I));return K(L(G,H),F)}function t(G,F,aa,Z,k,H,I){G=K(G,K(K(n(F,aa,Z),k),I));return K(L(G,H),F)}function e(G){var Z;var F=G.length;var x=F+8;var k=(x-(x%64))/64;var I=(k+1)*16;var aa=Array(I-1);var d=0;var H=0;while(H<F){Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=(aa[Z]|(G.charCodeAt(H)<<d));H++}Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=aa[Z]|(128<<d);aa[I-2]=F<<3;aa[I-1]=F>>>29;return aa}function B(x){var k="",F="",G,d;for(d=0;d<=3;d++){G=(x>>>(d*8))&255;F="0"+G.toString(16);k=k+F.substr(F.length-2,2)}return k}function J(k){k=k.replace(/rn/g,"n");var d="";for(var F=0;F<k.length;F++){var x=k.charCodeAt(F);if(x<128){d+=String.fromCharCode(x)}else{if((x>127)&&(x<2048)){d+=String.fromCharCode((x>>6)|192);d+=String.fromCharCode((x&63)|128)}else{d+=String.fromCharCode((x>>12)|224);d+=String.fromCharCode(((x>>6)&63)|128);d+=String.fromCharCode((x&63)|128)}}}return d}var C=Array();var P,h,E,v,g,Y,X,W,V;var S=7,Q=12,N=17,M=22;var A=5,z=9,y=14,w=20;var o=4,m=11,l=16,j=23;var U=6,T=10,R=15,O=21;s=J(s);C=e(s);Y=1732584193;X=4023233417;W=2562383102;V=271733878;for(P=0;P<C.length;P+=16){h=Y;E=X;v=W;g=V;Y=u(Y,X,W,V,C[P+0],S,3614090360);V=u(V,Y,X,W,C[P+1],Q,3905402710);W=u(W,V,Y,X,C[P+2],N,606105819);X=u(X,W,V,Y,C[P+3],M,3250441966);Y=u(Y,X,W,V,C[P+4],S,4118548399);V=u(V,Y,X,W,C[P+5],Q,1200080426);W=u(W,V,Y,X,C[P+6],N,2821735955);X=u(X,W,V,Y,C[P+7],M,4249261313);Y=u(Y,X,W,V,C[P+8],S,1770035416);V=u(V,Y,X,W,C[P+9],Q,2336552879);W=u(W,V,Y,X,C[P+10],N,4294925233);X=u(X,W,V,Y,C[P+11],M,2304563134);Y=u(Y,X,W,V,C[P+12],S,1804603682);V=u(V,Y,X,W,C[P+13],Q,4254626195);W=u(W,V,Y,X,C[P+14],N,2792965006);X=u(X,W,V,Y,C[P+15],M,1236535329);Y=f(Y,X,W,V,C[P+1],A,4129170786);V=f(V,Y,X,W,C[P+6],z,3225465664);W=f(W,V,Y,X,C[P+11],y,643717713);X=f(X,W,V,Y,C[P+0],w,3921069994);Y=f(Y,X,W,V,C[P+5],A,3593408605);V=f(V,Y,X,W,C[P+10],z,38016083);W=f(W,V,Y,X,C[P+15],y,3634488961);X=f(X,W,V,Y,C[P+4],w,3889429448);Y=f(Y,X,W,V,C[P+9],A,568446438);V=f(V,Y,X,W,C[P+14],z,3275163606);W=f(W,V,Y,X,C[P+3],y,4107603335);X=f(X,W,V,Y,C[P+8],w,1163531501);Y=f(Y,X,W,V,C[P+13],A,2850285829);V=f(V,Y,X,W,C[P+2],z,4243563512);W=f(W,V,Y,X,C[P+7],y,1735328473);X=f(X,W,V,Y,C[P+12],w,2368359562);Y=D(Y,X,W,V,C[P+5],o,4294588738);V=D(V,Y,X,W,C[P+8],m,2272392833);W=D(W,V,Y,X,C[P+11],l,1839030562);X=D(X,W,V,Y,C[P+14],j,4259657740);Y=D(Y,X,W,V,C[P+1],o,2763975236);V=D(V,Y,X,W,C[P+4],m,1272893353);W=D(W,V,Y,X,C[P+7],l,4139469664);X=D(X,W,V,Y,C[P+10],j,3200236656);Y=D(Y,X,W,V,C[P+13],o,681279174);V=D(V,Y,X,W,C[P+0],m,3936430074);W=D(W,V,Y,X,C[P+3],l,3572445317);X=D(X,W,V,Y,C[P+6],j,76029189);Y=D(Y,X,W,V,C[P+9],o,3654602809);V=D(V,Y,X,W,C[P+12],m,3873151461);W=D(W,V,Y,X,C[P+15],l,530742520);X=D(X,W,V,Y,C[P+2],j,3299628645);Y=t(Y,X,W,V,C[P+0],U,4096336452);V=t(V,Y,X,W,C[P+7],T,1126891415);W=t(W,V,Y,X,C[P+14],R,2878612391);X=t(X,W,V,Y,C[P+5],O,4237533241);Y=t(Y,X,W,V,C[P+12],U,1700485571);V=t(V,Y,X,W,C[P+3],T,2399980690);W=t(W,V,Y,X,C[P+10],R,4293915773);X=t(X,W,V,Y,C[P+1],O,2240044497);Y=t(Y,X,W,V,C[P+8],U,1873313359);V=t(V,Y,X,W,C[P+15],T,4264355552);W=t(W,V,Y,X,C[P+6],R,2734768916);X=t(X,W,V,Y,C[P+13],O,1309151649);Y=t(Y,X,W,V,C[P+4],U,4149444226);V=t(V,Y,X,W,C[P+11],T,3174756917);W=t(W,V,Y,X,C[P+2],R,718787259);X=t(X,W,V,Y,C[P+9],O,3951481745);Y=K(Y,h);X=K(X,E);W=K(W,v);V=K(V,g)}var i=B(Y)+B(X)+B(W)+B(V);return i.toLowerCase()};

    var size = size || 80;
    return 'http://www.gravatar.com/avatar/' + MD5(email) + '?s=' + size + '&d=identicon';
}


document.getElementById('msgTxtArea').setAttribute('style', 'overflow-y:hidden;'); //'height:' + (0) + 'px;
document.getElementById('msgTxtArea').addEventListener("input", OnInput, false);
function OnInput() {
  this.style.height = 'auto';
  if(this.scrollHeight >= 300){
    
     document.getElementById('msgTxtArea').setAttribute('style', 'overflow-y:visible;');
       this.style.height = 300 + 'px';
  }
  else{
  document.getElementById('msgTxtArea').setAttribute('style', 'overflow-y:hidden;');
  this.style.height = (this.scrollHeight) + 'px';
  }
  
};



document.getElementById('msgTxtArea').onkeyup = function(e){
  e = e || event;
  if (e.keyCode === 13 && !e.ctrlKey) {
    var msg = JSONmsg();
    Babble.postMessage(msg,afterPost);
  }
  return true;
 }

 function afterPost(obj){
     return;
 }

 function submitEnter(e){
       e = e || event;
  if (e.keyCode === 13 && !e.ctrlKey) {
    var msg = JSONmsg();
    Babble.postMessage(msg,afterPost);
  }
  return true;
 }