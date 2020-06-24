var ip = window.localStorage.getItem('ip');
var DOMAIN  = (ip ? ip :  'http://192.168.206.128:8085') + '/foediapi';
var SESSION = JSON.parse(window.localStorage.getItem('session'));

document.addEventListener("deviceready", function() {
    api.init();

    $("#seleccionarTodos").click( function(){
        var self = this;
        $("#PermisosPendientes input[type='checkbox']").each(function(i, e){
            $(e).attr('checked', $(self).is(':checked'));
        });
    });
    
    $("#AprovarVarios").click(api.aprovar_varios);

}, false);

var api = {
    init: function(){
        $.ajaxSetup({
            dataType : 'json',
            crossDomain: true,
            error:function(response){
                $("#loading").fadeOut();

                var err = response.responseJSON;
                var message_error = err && err.hasOwnProperty('error_description') && typeof errores[err.error_description] != "undefined"? errores[err.error_description] : errores.descripcion_default;
                var titulo_error = err && err.hasOwnProperty('error') && typeof  errores[err.error]  != "undefined"? errores[err.error] : errores.titulo_default
                message_error = message_error ? message_error : "Error desconocido";
                titulo_error = titulo_error ? titulo_error : "Algo saluio mal";
                
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
                        clones[x].attr('id', 'Permiso' + x).attr("data-idPermiso" );
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
        $.ajax({
            url: DOMAIN + $(button).data('idPermiso'),
            method: "GET",    
            success: function(data){
                
            }
        })
    },
    aprovar: function(button){
        navigator.notification.confirm(
            'Aprobar', // message
             function(results){
                if(results == 2/*<-cancelar*/){
                    return;
                }
                
                $.ajax({
                    url: DOMAIN + $(button).attr('data-idPermiso') + '/autorizaciones',
                    method: "PUT",    
                    success: function(data){
                        $("#idPermiso"+$(button).attr('data-idPermiso')).fadeOut();

                    }
                })
             },
             $(button).parent().find('.tipoPermiso').html(),           // title
            ['Aprovar','Cancelar']     // buttonLabels
        );
        
    },
    aprovar_varios: function(button){
 
        navigator.notification.confirm(
            'Aprobar', // message
             function(results){
                if(results == 2/*<-cancelar*/){
                    return;
                }
                var ids = [];
                $("#PermisosPendientes input[type='checkbox']").each(function(i, e){
                    if($(e).is(':checked'));
                        ids.push($(e).attr('data-idpermiso'));
                });
                 $.ajax({
                    url: DOMAIN + 'autorizaciones/varios',
                    data:{ids: ids },
                    method: "PUT",    
                    success: function(data){
                        $("#PermisosPendientes input[type='checkbox']").each(function(i, e){
                            if($(e).is(':checked'));
                                $("#idPermiso"+$(e).attr('data-idpermiso')).fadeOut();
                        });
                    }
                })
             },
             $(button).parent().find('.tipoPermiso').html(),           // title
            ['Aprovar','Cancelar']     // buttonLabels
        );
        $("#loading").fadeOut();

    },
    rechazar_varios: function(button){
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
    
}
