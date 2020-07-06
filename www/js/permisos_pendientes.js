//var DOMAIN = "http://192.168.206.128:8085" + '/foediapi/api/permisos/';
//var DOMAIN = window.localStorage.getItem('ip') + '/foediapi/api/permisos/';
var DOMAIN =  (window.localStorage.getItem('ip') ? window.localStorage.getItem('ip') : 'https://f0ce183ab03c.ngrok.io' ) + '/foediapi/api/permisos/';
document.addEventListener("deviceready", function() {
    api.init();
    $("#checkedAll").change(function(){
        if(this.checked){
            $("#checkedAll").removeAttr('disabled')
            $("#checkedAll").removeAttr('readonly');

            $("#AprobarVarios").removeAttr('disabled');
            $("#AprobarVarios").removeAttr('readonly');
            $("#AprobarVarios").attr('onclick', 'api.aprobar_varios(1)')

            $("#RechazarVarios").removeAttr('disabled');
            $("#RechazarVarios").removeAttr('readonly');
            $("#RechazarVarios").attr('onclick', 'api.rechazar_varios(1)')

          $(".checkSingle").each(function(){
            this.checked=true;
          })              
        }else{

            $("#AprobarVarios").attr('disabled');
            $("#AprobarVarios").attr('readonly');
            $("#AprobarVarios").attr('onclick', 'api.aprobar_varios(0)')

            $("#RechazarVarios").attr('disabled');
            $("#RechazarVarios").attr('readonly');
            $("#RechazarVarios").attr('onclick', 'api.rechazar_varios(0)')
            $(".checkSingle").each(function(){
                this.checked=false;
            })              
        }
      });
      try {
        var notificationOpenedCallback = function(jsonData) {
            console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
        };
        window.plugins.OneSignal
            .startInit("9279844e-0f7c-4469-a616-79df5e864a5a")
            .handleNotificationOpened(notificationOpenedCallback)
            .endInit();
        var session=JSON.parse(localStorage.getItem('session'));
        window.plugins.OneSignal.sendTag("direccion", session.direccion);
        window.plugins.OneSignal.sendTag("area", session.area);
        window.plugins.OneSignal.sendTag("nombre", session.nombre);
        window.plugins.OneSignal.sendTag("puesto", session.puesto);
        
        window.plugins.OneSignal.sendTag("rol",app_settings.rol+localStorage.getItem('token'));
        window.plugins.OneSignal.sendTag("id", app_settings.user.id+localStorage.getItem('token'));
    } catch (e) {
        console.log(e);
    }
}, false);

var api = {
    init: function(){
        $.ajaxSetup({
            dataType : 'json',
            crossDomain: true,
            error:function(err){
                response = err.responseJSON;                
                M.toast({
                    classes: 'rounded', 
                    html:response && response.hasOwnProperty('error_description') ? response.error_description : "Api no responde, compruebe su conexion",  
                    completeCallback: function(){         }
                });    
            }, 
            beforeSend: function(xhr) { 
                SESSION = JSON.parse(window.localStorage.getItem('session'));
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
                permiso.css('display','none');   $("#loading").fadeOut();
                if(permisos.length)
                {
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
                        clones[x].find('.ver').attr('data-idPermiso',_p.idPermiso);
                        clones[x].find('.aprobar').attr('data-idPermiso',_p.idPermiso);
                        clones[x].find('.rechazar').attr('data-idPermiso',_p.idPermiso);
                        clones[x].find('.form-check-input').attr('data-idPermiso',_p.idPermiso);
                        clones[x].find('.loading').removeClass('loading');
                        $(".checkSingle").click(function () {
                            var AllChecked = 0;
                            var items = 0;
                            var items_checked = 0;
                            $(".checkSingle").each(function(){
                                if(this.checked){
                                    AllChecked = 1;
                                    items_checked++;
                                }      
                                items++;                      
                            })    
                            
                            if(items_checked != items)
                            {
                                $("#checkedAll").each(function(){
                                    this.checked=false;
                                })              
                            }
                            if(items_checked == items)
                            {
                                $("#checkedAll").each(function(){
                                    this.checked=true;
                                })              
                            }
                            console.log(AllChecked);
                            if(AllChecked >= 1){
                                $("#AprobarVarios").attr('onclick', 'api.aprobar_varios(1)');
                                $("#RechazarVarios").attr('onclick', 'api.rechazar_varios(1)');
                            }else{
                                $("#AprobarVarios").attr('onclick', 'api.aprobar_varios(0)');
                                $("#RechazarVarios").attr('onclick', 'api.rechazar_varios(0)');
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
            '¿Aprobar el permiso No.'+ idPermiso+'?', 
             function(results){
                 console.log(results)
                 if(results == 1){
                    $.ajax({
                        url: DOMAIN + idPermiso + '/autorizaciones',
                        method: "PUT",    
                        success: function(data){
                            M.toast({ classes: 'rounded', html: "El permiso fue aprobado con éxito.",  completeCallback:function(){location.href = "permisos_pendientes.html"}});
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
            return M.toast({ classes: 'rounded', html:"No hay permisos seleccionados."});
        }
        var ids = [];
        $("#PermisosPendientes input[type='checkbox']").each(function(i, e){
            if($(e).is(':checked') && $(e).attr('data-idPermiso')){
                ids.push($(e).attr('data-idPermiso'));
            }
        });
        navigator.notification.confirm(
            '¿Deseas aprobar los permisos No. ' + ids.join(' y ') +' ?', 
             function(results){
                if(results === 1){    
                    $.ajax({
                        url: DOMAIN + 'autorizaciones/varios',
                        data:{ids: ids.join() },
                        method: "PUT",    
                        success: function(data){
                            M.toast({ classes: 'rounded', html: "Los permisos fueron aprobados con éxito.",  completeCallback:function(){location.href = "permisos_pendientes.html"}});
                        }
                    })
                } 
            },
            'Aprobar masivo',          
            ['Si','No']     
        );
        $("#loading").fadeOut();
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
                            M.toast({ classes: 'rounded', html: "El permiso fue rechazado con éxito.",  completeCallback:function(){location.href = "permisos_pendientes.html"}});

                        }
                    }) 
                }
            },
            $(button).parent().find('.tipoPermiso').html(),           
            ['Aprovar','Cancelar']     
        );
    },
    rechazar_varios: function(is_correct){
        if(!is_correct){
            return M.toast({ classes: 'rounded', html:"No hay permisos seleccionados."});

        }
        var ids = [];
        $("#PermisosPendientes input[type='checkbox']").each(function(i, e){
            if($(e).is(':checked') && $(e).attr('data-idPermiso')){
                ids.push($(e).attr('data-idPermiso'));
            }
        });
        navigator.notification.prompt(
            '¿Deseas rechazar los permisos No. ' + ids.join(' y ') +' ?', 
                function(){
                if(results.buttonIndex === 1){                    
                    $.ajax({
                        url : DOMAIN + 'negaciones/varios',
                        data : {ids : ids.join(), motivo : results.input1},
                        method : "PUT",    
                        success : function(data){
                            M.toast({ classes: 'rounded', html: "Los permisos fueron rechazados con éxito.",  completeCallback:function(){location.href = "permisos_pendientes.html"}});
                        }
                    })
                }
            },
            'Rechazar Masivo',
            ['Si','No']
        );
        $("#loading").fadeOut();
    }
}
