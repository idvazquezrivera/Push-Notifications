var ip = window.localStorage.getItem('ip');
var DOMAIN  = (ip ? ip :  'http://192.168.206.128:8085') + '/foediapi/api/permisos/';
var SESSION = JSON.parse(window.localStorage.getItem('session'));
var errores = {
    "invalid_grant": "Concesión inválida",
    "Bad credentials": "Credenciales Invalidas",
    "Unauthorized": "No Autorizado",
    "mensaje_default": "Ocurrio un error de conexión",
    "titulo_default": "Algo salio mal"

};

document.addEventListener("deviceready", function() {
    api.init();

    $("#seleccionarTodos").click( function(){
        var self = this;
        $("#PermisosPendientes input[type='checkbox']").each(function(i, e){
            $(e).attr('checked', $(self).is(':checked'));
        });
    });
    console.log($("input[type='checkbox']").is(':checked'));

    $("#AprobarVarios").click(api.aprobar_varios);

}, false);

var api = {
    init: function(){
        $.ajaxSetup({
            dataType : 'json',
            crossDomain: true,
            error:function(response){
                $("#loading").fadeOut();

                var err = response.responseJSON;
                if(!err || typeof err === "undefined")
                {
                    navigator.notification.alert(
                        "Ocurrio un error de conexión",  
                        null,       
                        'Error en la conexión',          
                        'Aceptar'                
                    );
                }
                var message_error = err && err.hasOwnProperty('message') && typeof errores[err.message] != "undefined"? errores[err.message] : errores.descripcion_default;
                var titulo_error = err && err.hasOwnProperty('error') && typeof  errores[err.error]  != "undefined"? errores[err.error] : errores.titulo_default
                message_error = err.message ? err.message : "Ocurrio un error de conexión";
                titulo_error = error ? error : "Algo saluio mal";
                
                if( err.hasOwnProperty('error')  && err.error == 'invalid_token')
                    window.location = 'index.html';

                if(err.error && err.message)
                    navigator.notification.alert(
                        message_error,  
                        null,       
                        titulo_error,          
                        'Aceptar'                
                    );

            }, 
            beforeSend: function(xhr) { 
                xhr.setRequestHeader("Authorization", "Bearer " + SESSION.access_token);
                xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
                $("#loading").fadeIn();
            },
            
        }); 
        this.permisos_pendientes();
    },
    permisos_pendientes: function(event){
        var self = this
        

        $.ajax({
            url: DOMAIN + 'pendientes',
            method: "GET",    
            success: function(response){
                var permisos = response;
                if(permisos)
                {
                    var permiso = $("#Permiso");
                    var lista = $("#PermisosPendientes");
                    var clones = [];
                    
                    for(x in permisos){
                        _p = permisos[x];
                        clones[x] = permiso.clone(); 
                        lista.prepend(clones[x]);
                        clones[x].css('display', 'block')
                        clones[x].attr('id', 'Permiso' + x).attr("data-idPermiso", x );
                        clones[x].find('.idPermiso').html('No. '+_p.idPermiso)
                        clones[x].find('.solicitante').html(_p.solicitante)
                        clones[x].find('.tipoPermiso').html(_p.tipoPermiso)

                        fecha = _p.diasSolicitados == 1 ? _p.fechaInicio : (_p.fechaInicio + (_p.diasSolicitados == 2 ? ' y ': ' al ') + _p.fechaInicio) 
                        clones[x].find('.fecha').html(fecha);
                        clones[x].find('button').attr('data-idPermiso',_p.idPermiso);
                        clones[x].find('.form-check-input').attr('data-idPermiso',_p.idPermiso);
                        

                        clones[x].find('.loading').removeClass('loading');
                        permiso.css('display','none');
                          
                    }

                }
                $("#loading").fadeOut();

            },
        }); 
    },
    ver: function(button){
        return alert("En construcción");
        $.ajax({
            url: DOMAIN + $(button).data('idPermiso'),
            method: "GET",    
            success: function(data){
                
            }
        })
    },
    aprobar: function(button){
        navigator.notification.confirm(
            'Aprobar el permiso '+$("#idPermiso"+ids[x]).text(), // message
             function(results){
                if(results == 2/*<-cancelar*/){
                    return;
                }
                
                $.ajax({
                    url: DOMAIN + $(button).attr('data-idPermiso') + '/autorizaciones',
                    method: "PUT",    
                    success: function(data){
                        $("#idPermiso"+$(button).attr('data-idPermiso')).fadeOut();
                        navigator.notification.alert(
                            "El permiso fue autorizado con éxito.",  
                            null,       
                            "Autorizado",          
                            'Aceptar'                
                        );
                        $("#loading").fadeOut();
                    }
                })
             },
             $(button).parent().find('.tipoPermiso').html(),           // title
            ['Aprovar','Cancelar']     // buttonLabels
        );
        
    },
    aprobar_varios: function(button){
 
        navigator.notification.confirm(
            '¿Deseas aprobar varios permisos?', // message
             function(results){
                if(results == 2/*<-cancelar*/){
                    return;
                }
                var ids = [];
                $("#PermisosPendientes input[type='checkbox']").each(function(i, e){
                    if($(e).is(':checked')){
                        ids.push($(e).attr('data-idPermiso'));
                    }
                });
                 $.ajax({
                    url: DOMAIN + 'autorizaciones/varios',
                    data:{ids: ids },
                    method: "PUT",    
                    success: function(data){
                        for(x in ids){
                            $("#idPermiso"+ids[x]).fadeOut();
                            console.log("#idPermiso"+ids[x]);
                        };
                
                    }
                })
            },
             $(button).parent().find('.tipoPermiso').html(),           // title
            ['Si','No']     // buttonLabels
        );
        $("#loading").fadeOut();

    },
    rechazar_varios: function(button){
        return alert("rechazar_varios En construcción");

        navigator.notification.prompt(
            'Motivo ', // message
             function(results){
                 $.ajax({
                     url: DOMAIN + $(button).attr('data-idPermiso') + '/negaciones',
                     method: "PUT",    
                     success: function(data){
                         $("#idPermiso"+$(button).attr('data-idPermiso')).fadeOut();
                    }
                })
             },
             $(button).parent().find('.tipoPermiso').html(),           // title
            ['Rechazar','Cancelar'],    // buttonLabels
            'Motivo'
        );
    },
    rechazar: function(button){
        return alert("rechazar En construcción");
        $.ajax({
            url: DOMAIN + $(button).data('idPermiso'),
            method: "GET",    
            success: function(data){
                
            }
        })
    },
    
}
