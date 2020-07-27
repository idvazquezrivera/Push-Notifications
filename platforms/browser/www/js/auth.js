var DOMAIN =  (window.localStorage.getItem('ip') ? window.localStorage.getItem('ip') : 'https://spicy-termite-18.telebit.io' ) + '/foediapi';
DOMAIN = "https://chatty-insect-28.telebit.io" + '/foediapi';

document.addEventListener("deviceready", function() {
    window.localStorage.removeItem('session');

    api.init();

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
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: "Complete los campos",
                showConfirmButton: false,
                timer: 1500
            }); 
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
                $("#loading").fadeOut();               
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response && response.hasOwnProperty('error') ? response.error_description : "Api no responde, compruebe su conexion",
                    showConfirmButton: false,
                    timer: 2500
                }).then((result) => {
                    location.href = "index.html";  
                })                

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
