//var DOMAIN = "http://192.168.206.128:8085" + '/foediapi/api/permisos/';
var DOMAIN = window.localStorage.getItem('ip') + '/foediapi/api/permisos/';
var SESSION = JSON.parse(window.localStorage.getItem('session'));

document.addEventListener("deviceready", function() {
    api.init();
    $("#seleccionarTodos").click( function(){
        var self = this;
        $("#PermisosPendientes input[type='checkbox']").each(function(i, e){
            $(e).attr('checked', $(self).is(':checked'));
        });
    });
}, false);
var api = {
    init: function(){
        $.ajaxSetup({
            dataType : 'json',
            crossDomain: true,
            error:function(err){
                response = err.responseJSON;                
                navigator.notification.alert(
                    response && response.hasOwnProperty('error_description') ? response.error_description : "Api no responde, compruebe su conexion",  
                    function(){if(err.error == 'invalid_token') {window.location = 'index.html';}; $("#loading").fadeOut();},       
                    response && response.hasOwnProperty('error') ? response.error : 'Error',          
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
                        clones[x].attr('id', 'Permiso' + _p.idPermiso).attr("data-idPermiso", _p.idPermiso);
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
                    $('.form-check-input').change(function(){
                        $("#AprobarVarios").attr('onclick', 'api.aprobar_varios(0)');
                        var c = 0;
                        $("#PermisosPendientes input[type='checkbox']").each(function(i, e){
                            
                            if ($(e).is(':checked')){
                                c++;
                                $("#AprobarVarios").attr('onclick', 'api.aprobar_varios('+c+')');
                            }
                        });
                    });
                }
                $("#loading").fadeOut();
            },
        }); 
    },
    ver: function(button){
        location.href = "detalle_permiso.html";  
    },
    aprobar: function(button){
        var idPermiso =  $(button).attr('data-idPermiso');
        navigator.notification.confirm(
            'Aprobar el permiso '+ $("#Permiso"+idPermiso).text().trim(), // message
             function(results){
                if(results == 2/*<-cancelar*/){
                    return;
                }
                $.ajax({
                    url: DOMAIN + idPermiso + '/autorizaciones',
                    method: "PUT",    
                    success: function(data){
                        navigator.notification.alert(
                            "El permiso fue autorizado con éxito.",  
                            function(){ $("#loading").fadeOut(); $("#Permiso"+idPermiso).fadeOut()}, 
                            "Autorizado",          
                            'Aceptar'                
                        );
                    }
                })
            },
            $("#Permiso"+idPermiso).find('.tipoPermiso').html(),      
            ['Si','No']
        );
        
    },
    aprobar_varios: function(is_correct){
        if(!is_correct){
            navigator.notification.alert("No hay permisos seleccionados.", null, "Error", "Aceptar");
            return;
        }
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
                            $("#Permiso"+ids[x]).fadeOut();
                        };
                
                    }
                })
            },
            'Aprobar masivo',          // title
            ['Si','No']     // buttonLabels
        );
        $("#loading").fadeOut();
    },
    rechazar_varios: function(button){
        navigator.notification.confirm(
            '¿Deseas rechazar varios permisos?', // message
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
                            $("#Permiso"+ids[x]).fadeOut();
                            console.log("#idPermiso"+ids[x]);
                            console.log("#idPermiso"+x);
                            console.log(ids[x]);
                        };
                
                    }
                })
            },
             $(button).parent().find('.tipoPermiso').html(),           // title
            ['Si','No']     // buttonLabels
        );
        $("#loading").fadeOut();
    },
    rechazar: function(button){
        navigator.notification.confirm(
            'Escribe un motivo de rechazo para varios permisos?', // message
             function(results){
                if(results == 2/*<-cancelar*/){
                    return;
                }
                
                $.ajax({
                    url: DOMAIN + $(button).attr('data-idPermiso') + '/rea',
                    method: "PUT",    
                    success: function(data){
                        $("#Permiso"+$(button).attr('data-idPermiso')).fadeOut();
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
    
}
