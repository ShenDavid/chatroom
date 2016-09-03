/**
 * Created by sxh on 16/9/2.
 */


jQuery(function ($) {
    var socket = io.connect();
    //var $hismsg = $('#hismsg');
    var $msgin = $('#msgin');
    var $namein = $("#namein");
    var $inbtn =  $('#inbtn');
    var $sendbtn = $('#sendbtn');

    //listen if client click button to submit nickname
    $inbtn.click(function(){
        console.log('jinlaile');
        var name = $namein.val();
        if(name.toString().trim().length == 0){
            $namein.focus();
        }
        else{
            socket.emit('judgelogin', name);

        }


    });

    //listen if client click send button
    $sendbtn.click(function(){
        var message = $msgin.val();
        $("#msgin").val(' ');
        $msgin.focus();

        var timestamp = getTime();
        if(message.toString().trim().length != 0){
            socket.emit('dbmsg', message, timestamp);
            showmsg('me', message, 'pink', timestamp);
            return;
        };
    });


    //if the name client inputs exists in online clients
    socket.on('nameexist', function () {
        $("#hint").html("The name you input is the same with one of our online clients");
        $("#namein").val(' ');
    });

    //client successfully logins
    socket.on('loginok', function () {
        $("#loginwrapper").hide();
        $msgin.focus();
    });

    //show to all clients in or out of this client
    socket.on('sysmsg', function (name, type) {
        var verb;
        if(type == 'out')
            verb = 'left';
        else
            verb = 'enters';
        var message = name + ' ' + verb +' ' + 'this room';

        showmsg('system', message, 'green', getTime());

    });

    //show history messages
    socket.on('showhistory', function (res) {
        if(res.length){
            for(var i=0; i<res.length; i++){
                showmsg(res[i].alias, res[i].msg, 'red', res[i].timestamp);
            }
            console.log("get to show history");
        }
    });



    socket.on('brmsg', function (client, message, timestamp) {
        showmsg(client, message, 'purple', timestamp);
    });


    //show message function
    function showmsg(client, message, color, timestamp) {
        var prev =  document.getElementById('hismsginput').innerHTML;
        var row = document.createElement('b');
        row.innerHTML = prev + client + ': ' + message + timestamp+ '<br />';
        row.style.color = color || '#000';
        document.getElementById('hismsg').appendChild(row);
        row.scrollTop = row.scrollHeight;
    };

    //add timestamp function
    function getTime(){
        var date = new Date();
        var month = date.getMonth();
        var day = date.getDate();
        var year = date.getFullYear();
        var hour = date.getHours();
        var minute = date.getMinutes();
        var second = date.getSeconds();
        var timeStamp = '('+month+'.'+day+'.'+year+' '+ hour+':'+minute+':'+ second+')';
        return timeStamp;
    }
});