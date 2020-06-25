var ip = window.localStorage.getItem('ip');
var DOMAIN  = (ip ? ip :  'http://192.168.206.128:8085') + '/foediapi';
var errores = {
    "invalid_grant": "Concesión inválida",
    "Bad credentials": "Credenciales Invalidas",
    "Unauthorized": "No Autorizado",
    "mensaje_default": "Error desconocido",
    "titulo_default": "Algo salio mal"

};

document.addEventListener("deviceready", function() {
    window.localStorage.removeItem('session');

    api.init(errores);
    $("#ip").click(function(){
        navigator.notification.prompt(
            'Dominio del API',  // message
            function(results){
                if(results.buttonIndex == 1)
                 window.localStorage.setItem('ip', results.input1);

                ip = window.localStorage.getItem('ip');
                DOMAIN  = (ip ? ip :  'http://192.168.206.128:8085') + '/foediapi';
            },                  // callback to invoke
            'Personaliza',            // title
            ['Ok','Exit'],             // buttonLabels
           'http://127.0.0.0:5555'                 // defaultText
        );
    })
}, false);


var api = {
    init: function(errores){
        var self = this;
        $('#FormLogin').submit(self.get_token);
        $("#loading").fadeOut();

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
                'Llene sus datos',          
                'Aceptar'                
                );
                return;
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
                $("#loading").fadeOut();

                var message_error = err && err.hasOwnProperty('error_description') && typeof errores[err.error_description] != "undefined"? errores[err.error_description] : errores.descripcion_default;
                var titulo_error = err && err.hasOwnProperty('error') && typeof  errores[err.error]  != "undefined"? errores[err.error] : errores.titulo_default

                message_error = message_error ? message_error : "Error desconocido";
                titulo_error = titulo_error ? titulo_error : "Algo saluio mal";
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
