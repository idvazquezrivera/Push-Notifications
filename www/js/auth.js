//var DOMAIN = "http://192.168.206.128:8085" + '/foediapi';
var DOMAIN =  (window.localStorage.getItem('ip') ? window.localStorage.getItem('ip') : 'https://bbcfdb408a03.ngrok.io' ) + '/foediapi';

document.addEventListener("deviceready", function() {
    window.localStorage.removeItem('session');

    api.init();
    $("#ip").click(function(){
        navigator.notification.prompt(
            'Dominio del API (https://f8a0158d90e5.ngrok.io)',  // message
            function(results){
                if(results.buttonIndex == 1){
                    window.localStorage.setItem('ip', results.input1);
                    DOMAIN = results.input1 + '/foediapi';
                }
            },                
            'Personalizar',      
            ['Aceptar','Cancelar'],       
            'https://f8a0158d90e5.ngrok.io'           
        );
    })
}, false);


var api = {
    init: function(){
        var self = this;
        $('#FormLogin').submit(self.get_token);
        $("#loading").fadeOut();
    },
    get_token: function(event){
        event.preventDefault();
        var InputUsuario = $('#InputUsuario');
        var InputPassword = $('#InputPassword');
        if(!InputUsuario.val() || !InputPassword.val()){
            navigator.notification.alert("Complete todos los campos", function(){ InputPassword.val("");  InputUsuario.val("");}, 'Error', 'Aceptar');
    api.init();
    return;
        }
        $.ajax({
            url: DOMAIN + '/oauth/token',
            method: "POST",    
            dataType : 'json',
            crossDomain: true,
            data: {username: InputUsuario.val(), password: InputPassword.val(), grant_type:"password"},
            error:function(err){
                response = err.responseJSON;                
                navigator.notification.alert(
                    response && response.hasOwnProperty('error_description') ? response.error_description : "Api no responde, compruebe su conexion",  
                    function(){ InputPassword.val(""); InputUsuario.val(""); $("#loading").fadeOut(); },       
                    response && response.hasOwnProperty('error') ? response.error : 'Error',          
                    'Aceptar'                
                );    
            }, 
            success: function(data){
                if(data.access_token)
                {
                    window.localStorage.setItem('session', JSON.stringify(data));
                    location.href = "permisos_pendientes.html";

                }
                $("#loading").fadeOut();

            },
            beforeSend: function(xhr) { 
                xhr.setRequestHeader("Authorization", "Basic " + btoa("foediapp:F0ed1@pp!20"));
                xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
                $("#loading").fadeIn();

            },
        }); 
    }
}
