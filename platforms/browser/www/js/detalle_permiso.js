//var DOMAIN = "http://192.168.206.128:8085" + '/foediapi/api/permisos/';
var DOMAIN = window.localStorage.getItem('ip') + '/foediapi/api/permisos/';
var SESSION = JSON.parse(window.localStorage.getItem('session'));
var DOMAIN =  (window.localStorage.getItem('ip') ? window.localStorage.getItem('ip') : 'https://spicy-termite-18.telebit.io' ) +  '/foediapi/api/permisos/';

document.addEventListener("deviceready", function(){
    api.init()
}, false);

var api = {
    init: function(){
        $.ajaxSetup({
            dataType : 'json',
            crossDomain: true,
            error:function(err){
                response = err.responseJSON;                
                M.toast({html:response && response.hasOwnProperty('error_description') ? response.error_description : "Api no responde, compruebe su conexion"});    
                $("#loading").fadeOut();
            }, 
            beforeSend: function(xhr) { 
                xhr.setRequestHeader("Authorization", "Bearer " + SESSION.access_token);
                xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
                $("#loading").fadeIn();
            },
            
        }); 
        this.get_permiso();
    },
    get_permiso: function(event){
        var self = this
        var idPermiso = window.localStorage.getItem('verPermiso')
        $.ajax({
            url: DOMAIN + idPermiso,
            method: "GET",    
            success: function(response){
                var permiso = response;
                if(permiso)
                {
                    for(x in permiso){
                        if(permiso[x]){
                            $("." + x).html(permiso[x]);
                            $('#item_' + x).removeClass('d-none')
                        }
                    }
                }
            },
        }); 
    },
    
}
