var SESSION = JSON.parse(window.localStorage.getItem('session'));
var DOMAIN = 'http://192.168.206.128:8085/foediapi/api/permisos/';
document.addEventListener("deviceready", function() {
    api.init();
    window.plugins.OneSignal
    .startInit("e24e573b-7717-403c-ba09-e002ebff945f")
    .handleNotificationOpened(function(jsonData) {
        console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));                   
        
    })
    .endInit();
    
    window.plugins.OneSignal.sendTag("puesto", SESSION.puesto);
    window.plugins.OneSignal.sendTag("area",   SESSION.area);
    window.plugins.OneSignal.sendTag("nombre", SESSION.nombre);
    window.plugins.OneSignal.sendTag("id",     SESSION.id);
    window.plugins.OneSignal.setExternalUserId(SESSION.id);

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
     
     
}, false);

var api = {
    init: function(){
        $.ajaxSetup({
            dataType : 'json',
            crossDomain: true,
            error:function(err){
                response = err.responseJSON; 
                $("#loading").fadeOut();               
                Swal.fire({
                    icon: 'error',
                    title: response && response.hasOwnProperty('error') ? response.message : "Api no responde, compruebe su conexion",
                    confirmButtonText: 'Aceptar',

                }).then((result) => {
                    location.href = "index.html";  
                })                          
            }, 
            beforeSend: function(xhr) { 
                xhr.setRequestHeader("Authorization", "Bearer " + SESSION.access_token);
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
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

        Swal.fire({
            title: 'Aprobar permiso',
            text: '¿Aprobar el permiso No.'+ idPermiso+'?', 
            inputAttributes: {
              autocapitalize: 'off'
            },
            showCancelButton: true,
            cancelButtonText: 'Cerrar',
            confirmButtonColor: '#0C615C',
            confirmButtonText: '<i class="fad fa-check" aria-hidden="true"></i> Aprobar ',
            showLoaderOnConfirm: true
          }).then((result) => {
            if (result.value) {
                $.ajax({
                    url: DOMAIN + idPermiso + '/autorizaciones',
                    method: "PUT",    
                    success: function(data){
                     $("#loading").fadeOut();               

                        Swal.fire({
                            title: 'Aprobado!',
                            text: "El permiso fue aprobado con éxito.",
                            icon: 'success',
                            confirmButtonText: 'Aceptar',

                        }).then((result) => {
                            location.href = "permisos_pendientes.html";  
                        })                         
                    
                }
             })
            }
         
        })
    },
    aprobar_varios: function(is_correct){
        if(!is_correct){
            return Swal.fire('Error',"No hay permisos seleccionados.", 'error');
        }
        var ids = [];
        $("#PermisosPendientes input[type='checkbox']").each(function(i, e){
            if($(e).is(':checked') && $(e).attr('data-idPermiso')){
                ids.push($(e).attr('data-idPermiso'));
            }
        });
        Swal.fire({
            title: 'Aprobar permiso',
            text:'¿Deseas aprobar los permisos No. ' + ids.join(' y ') +' ?',
            inputAttributes: {
              autocapitalize: 'off'
            },
            showCancelButton: true,
            cancelButtonText: 'Cerrar',
            confirmButtonColor: '#0C615C',
            confirmButtonText: '<i class="fad fa-check" aria-hidden="true"></i> Aprobar ',
            showLoaderOnConfirm: true
          }).then((result) => {
            if (result.value) {
                $.ajax({
                    url: DOMAIN + 'autorizaciones/varios',
                    data:{ids: ids.join() },
                    method: "PUT",    
                    success: function(data){
                $("#loading").fadeOut();               

                        Swal.fire({
                            title: 'Aprobado!',
                            text: 'Los permisos fueron aprobados.',
                            icon: 'success',
                            confirmButtonText: 'Aceptar',

                        }).then((result) => {
                            location.href = "permisos_pendientes.html";  
                        })

                    }
                })
            }
        })
 
        $("#loading").fadeOut();
    },
    rechazar: function(button){
        var idPermiso =  $(button).attr('data-idPermiso');
        
        Swal.fire({
            title: 'Rechazar permiso',
            input: 'text',
            icon: 'question',
            text: 'Captura el motivo de rechazo',
            inputAttributes: {
              autocapitalize: 'off'
            },
            confirmButtonColor: '#5F46A7',

            showCancelButton: true,
            cancelButtonText: 'Cerrar',

            confirmButtonText: '<i class="fad fa-exchange" aria-hidden="true"></i> Rechazar',
            showLoaderOnConfirm: true
          }).then((result) => {
            if (result.value) {
                $.ajax({
                    url: DOMAIN + idPermiso + '/negaciones',
                    method: "PUT",    
                    data: {motivo: result.value},
                    success: function(data){
                $("#loading").fadeOut();               

                        Swal.fire({
                            title: 'Rechazado!',
                            text: 'El permiso fue rechazado.',
                            icon: 'success',
                            confirmButtonText: 'Aceptar',

                        }).then((result) => {
                            location.href = "permisos_pendientes.html";  
                        }) 
                    }
                }) 
                }
            })
    },
    rechazar_varios: function(is_correct){
        if(!is_correct){
            return Swal.fire('Error',"No hay permisos seleccionados.", 'error' );

        }
        var ids = [];
        $("#PermisosPendientes input[type='checkbox']").each(function(i, e){
            if($(e).is(':checked') && $(e).attr('data-idPermiso')){
                ids.push($(e).attr('data-idPermiso'));
            }
        });

        Swal.fire({
            text: 'Rechazar permisos No. ' + ids.join(' y '),
            input: 'text',
            icon: 'question',
            title: 'Captura el motivo de rechazo',
            inputAttributes: {
              autocapitalize: 'off'
            },
            confirmButtonColor: '#5F46A7',

            showCancelButton: true,
            cancelButtonText: 'Cerrar',

            confirmButtonText: '<i class="fad fa-exchange" aria-hidden="true"></i> Rechazar',
          }).then((result) => {
            if (result.value) {
                $.ajax({
                    url : DOMAIN + 'negaciones/varios',
                    data : {ids : ids.join(), motivo : result.value},
                    method : "PUT",    
                    success : function(data){
                $("#loading").fadeOut();               

                        Swal.fire({
                            title: 'Rechazado!',
                            text: 'Los permisos fueron rechazados.',
                            icon: 'success',
                            confirmButtonText: 'Aceptar',

                        }).then((result) => {
                            location.href = "permisos_pendientes.html";  
                        })

                    }
                })
                        
                    
            }
              else{
                Swal.fire({
                    title: 'Error',
                    icon: 'error',
                    text: "Debe especificar un motivo de rechazo",
                    confirmButtonText: 'Aceptar',
                })
            }
        })
    }
}
