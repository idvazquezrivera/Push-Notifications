//var DOMAIN = "http://192.168.206.128:8085" + '/foediapi/api/permisos/';
var DOMAIN = window.localStorage.getItem('ip') + '/foediapi/api/permisos/';
var SESSION = JSON.parse(window.localStorage.getItem('session'));
var DOMAIN =  (window.localStorage.getItem('ip') ? window.localStorage.getItem('ip') : 'https://spicy-termite-18.telebit.io' ) +  '/foediapi/api/permisos/';

document.addEventListener("deviceready", function(){
    api.init()
}, false);
var URLID =  parseInt(window.location.hash.substring(1));
var api = {
    init: function(){
        $.ajaxSetup({
            dataType : 'json',
            crossDomain: true,
            error:function(err){
                response = err.responseJSON;                
                M.toast({html:response && response.hasOwnProperty('error') ? response.message : "Api no responde, compruebe su conexion"});    
                $("#loading").fadeOut();
            }, 
            beforeSend: function(xhr) { 
                xhr.setRequestHeader("Authorization", "Bearer " + SESSION.access_token);
                xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
                $("#loading").fadeIn();
            },
            
        }); 
        if(URLID > 0){
            var idPermiso = window.localStorage.setItem('verPermiso', URLID);
        }
        this.get_permiso();
    },
    get_permiso: function(event){
        var self = this
        var idPermiso = window.localStorage.getItem('verPermiso')
        $("#loading").fadeIn();

        $.ajax({
            url: DOMAIN + idPermiso,
            method: "GET",    
            success: function(response){
                var permiso = response;
                if(permiso)
                {
                    $("#PermisoTipo").html(permiso.tipoPermiso);
                    $("#Aprobar, #Rechazar").attr('data-idPermiso', idPermiso);
                    for(x in permiso){
                        if(permiso[x]){
                            $("." + x).html(permiso[x]);
                            $('#item_' + x).removeClass('d-none')
                        }
                    }
                    $("#loading").fadeOut();

                }
            },
        }); 
    },
    aprobar: function(button){
        var idPermiso =  $(button).attr('data-idPermiso');
        navigator.notification.confirm(
            '¿Aprobar el permiso No.'+ idPermiso+'?', 
             function(results){
                 if(results == 1){
                    $.ajax({
                        url: DOMAIN + idPermiso + '/autorizaciones',
                        method: "PUT",    
                        success: function(data){
                            M.toast({html: "El permiso fue aprobado con éxito.",  completeCallback:function(){location.href = "permisos_pendientes.html"}});
                        }
                    })
                }
            },
            $("#Permiso"+idPermiso).find('.tipoPermiso').html(),      
            ['Si','No']
        );
        
    },
    rechazar: function(button){
        var idPermiso =  $(button).attr('data-idPermiso');
        navigator.notification.prompt(
            'Escribe un motivo de rechazo el permiso  No.' +idPermiso  +' ?',
             function(results){
                 console.log(results)
                if(results.buttonIndex === 1){
                    $.ajax({
                        url: DOMAIN + idPermiso + '/negaciones',
                        method: "PUT",    
                        data: {motivo: results.input1},
                        success: function(data){
                            M.toast({html: "El permiso fue rechazado con éxito.",  completeCallback:function(){location.href = "permisos_pendientes.html"}});

                        }
                    }) 
                }
            },
            $(button).parent().find('.tipoPermiso').html(),           
            ['Aprovar','Cancelar']     
        );
    },
}
