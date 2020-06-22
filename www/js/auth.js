var ip = window.localStorage.getItem('ip');
var DOMAIN  = (typeof ip === 'undefined' && ip ? ip :  'http://192.168.206.128:8085' ) + '/foediapi';
var errores = {
    "invalid_grant": "Concesión inválida",
    "Bad credentials": "Credenciales Invalidas",
    "Unauthorized": "No Autorizado",
    "mensaje_default": "Error desconocido",
    "titulo_default": "Algo salio mal"

};

document.addEventListener("deviceready", function() {
    window.open = cordova.InAppBrowser.open;
    window.localStorage.removeItem('session');

    api.init(errores);

    $("#ip").click(function(){
        navigator.notification.prompt(
            'Ip y Puerto',  // message
            function(results){
                window.localStorage.setItem('ip', results[3]);

            },                  // callback to invoke
            'Personaliza',            // title
            ['Ok','Exit'],             // buttonLabels
           '127.0.0.0:5555'                 // defaultText
        );
    })
}, false);


var api = {
    init: function(errores){
        var self = this;
        $('#FormLogin').submit(self.get_token);
    },
    get_token: function(event){
        event.preventDefault();
        var InputUsuario = $('#InputUsuario');
        var InputPassword = $('#InputPassword');
        if(!InputUsuario.val() || !InputPassword.val()){
            navigator.notification.alert(
                "Complete todos los campos",  
                function(){
                    InputPassword.val("");
                    InputUsuario.val("");
                },       
                titulo_error,          
                'Aceptar'                
                );
        }
        $.ajax({
            url: DOMAIN + '/oauth/token',
            method: "POST",    
            dataType : 'json',
            crossDomain: true,
            data: {
                username: InputUsuario.val(),
                password: InputPassword.val(),
                grant_type:"password"
            },
            error:function(err){
                err = err.responseJSON;
                console.log(errores);
                console.log(err);
                var message_error = err.error_description && errores[err.error_description] ? errores[err.error_description] : errores.descripcion_default;
                var titulo_error = err.error && errores[err.error] ? errores[err.error] : errores.titulo_default

                navigator.notification.alert(
                    message_error,  
                    function(){
                        InputPassword.val("");
                        InputUsuario.val("");
                    },       
                    titulo_error,          
                    'Aceptar'                
                    );
            }, 
            success: function(data){
                if(data.access_token)
                {
                    window.localStorage.setItem('session', JSON.stringify(data));
                    location.href = "permisos_pendientes.html";

                }
            },
            beforeSend: function(xhr) { 
                xhr.setRequestHeader("Authorization", "Basic " + btoa("foediapp:F0ed1@pp!20"));
                xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
            },
            
        }); 
    }
}
