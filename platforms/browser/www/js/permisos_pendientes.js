//var DOMAIN = "http://192.168.206.128:8085" + '/foediapi/api/permisos/';
var DOMAIN = window.localStorage.getItem('ip') + '/foediapi/api/permisos/';
var SESSION = JSON.parse(window.localStorage.getItem('session'));

document.addEventListener("deviceready", function() {
    api.init();
    $("#checkedAll").change(function(){
        if(this.checked){
          $(".checkSingle").each(function(){
            this.checked=true;
          })              
        }else{
          $(".checkSingle").each(function(){
            this.checked=false;
          })              
        }
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
                var permiso = $("#Permiso");
                var lista = $("#PermisosPendientes");
                permiso.css('display','none');   

                if(permisos.length)
                {
                    var clones = [];
                    $("#checkedAll").removeAttr('disabled')
                    $("#checkedAll").removeAttr('readonly');

                    $("#AprobarVarios").removeAttr('disabled');
                    $("#AprobarVarios").removeAttr('readonly');
                    $("#AprobarVarios").attr('onclick', 'api.aprobar_varios(1)')


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
                        clones[x].find('.ver').attr('data-idPermiso',_p.idPermiso);
                        clones[x].find('.aprobar').attr('data-idPermiso',_p.idPermiso);
                        clones[x].find('.rechazar').attr('data-idPermiso',_p.idPermiso);
                        clones[x].find('.form-check-input').attr('data-idPermiso',_p.idPermiso);
                        clones[x].find('.loading').removeClass('loading');
                        $(".checkSingle").click(function () {
                            if ($(this).is(":checked")){
                              var isAllChecked = 0;
                              $(".checkSingle").each(function(){
                                if(!this.checked){
                                    isAllChecked = 1;
                                    $("#AprobarVarios").attr('onclick', 'api.aprobar_varios(1)')

                                }
                              })              
                              if(isAllChecked == 0){ $("#checkedAll").prop("checked", true); }     
                            }else {
                                $("#checkedAll").removeAttr("checked");
                            }
                        });
                       
                    }
                }else{
                    lista.append('<div class="ml-4"><i class="fas fa-ban text-danger ml-3"></i> No hay permisos pendientes</div>');
                }
                $("#loading").fadeOut();
            },
        }); 
    },
    ver: function(button){
        window.localStorage.setItem('verPermiso',  $(button).attr('data-idPermiso'));
        location.href = "detalle_permiso.html";  
    },
    aprobar: function(button){
        var idPermiso =  $(button).attr('data-idPermiso');
        navigator.notification.confirm(
            '¿Aprobar el permiso No.'+ idPermiso+'?', // message
             function(results){
                 console.log(results)
                 if(results == 1){
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
                }

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
                if(results === 1){
                    var ids = [];
                    $("#PermisosPendientes input[type='checkbox']").each(function(i, e){
                        if($(e).is(':checked')){
                            ids.push($(e).attr('data-idPermiso'));
                        }
                    });
                    $.ajax({
                        url: DOMAIN + 'autorizaciones/varios',
                        data:{ids: ids.join() },
                        method: "PUT",    
                        success: function(data){
                            for(x in ids){
                                $("#Permiso"+ids[x]).fadeOut();
                            };
                    
                        }
                    })
                }
                
            },
            'Aprobar masivo',          // title
            ['Si','No']     // buttonLabels
        );
        $("#loading").fadeOut();
    },
    rechazar: function(button){
        var idPermiso =  $(button).attr('data-idPermiso');
        navigator.notification.prompt(
            'Escribe un motivo de rechazo el permiso  No.' +idPermiso , // message
             function(results){
                 console.log(results)
                if(results.buttonIndex === 1){
                    $.ajax({
                        url: DOMAIN + idPermiso + '/negaciones',
                        method: "PUT",    
                        data: {motivo: results.input1},
                        success: function(data){
                            navigator.notification.alert(
                                "El permiso fue rechazado con éxito.",  
                                function(){                         location.href = "permisos_pendientes.html";},        
                                "Rechazado",          
                                'Aceptar'                
                            );

                        }
                    }) 
                }

        
             },
             $(button).parent().find('.tipoPermiso').html(),           // title
            ['Aprovar','Cancelar']     // buttonLabels
        );
    },
    rechazar_varios: function(button){
    navigator.notification.prompt(
        '¿Deseas rechazar varios permisos?', // message
            function(){
            if(results.buttonIndex === 1){
                var ids = [];
                $("#PermisosPendientes input[type='checkbox']").each(function(i, e){
                    if($(e).is(':checked')){
                        ids.push($(e).attr('data-idPermiso'));
                    }
                });
                $.ajax({
                    url: DOMAIN + 'negaciones/varios',
                    data:{ids: ids.join(),motivo: results.input1 },
                    method: "PUT",    
                    success: function(data){
                        for(x in ids){
                            $("#Permiso"+ids[x]).fadeOut();
                        };
                
                    }
                })
            }
        },
            $(button).parent().find('.tipoPermiso').html(),           // title
        ['Si','No']     // buttonLabels
    );
    $("#loading").fadeOut();
},
}
