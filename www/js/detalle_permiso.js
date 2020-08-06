var DOMAIN = 'http://192.168.206.128:8085/foediapi/api/permisos/';
var SESSION = JSON.parse(window.localStorage.getItem('session'));
//var DOMAIN = 'https://chatty-insect-28.telebit.io/foediapi/api/permisos/';
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
                $("#loading").fadeOut();
                Swal.fire({
                    title: 'Error',
                    icon: 'error',
                    text: response && response.hasOwnProperty('error') ? response.message : "Api no responde, compruebe su conexion",
                    confirmButtonText: 'Aceptar',
                }).then((result) => {
                    location.href = "index.html";  
                })          
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
        $("#loading").fadeOut();
        Swal.fire({
            icon: 'question',
            title: 'Autorizar permiso',
            text: '¿Aprobar el permiso No.'+ idPermiso+'?',
            showConfirmButton: true,
            cancelButtonText: 'Cerrar',
            showCancelButton: true,

            confirmButtonColor: '#0C615C',
            confirmButtonText: '<i class="fad fa-check" aria-hidden="true"></i> Aprobar ',
            timer: 2500
        }).then((result) => {
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
        })   
        
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
                        Swal.fire({
                            title: 'Rechazado!',
                            text: 'Los permisos fueron rechazados.',
                            icon: 'success',
                            timer: 1500,
                            confirmButtonText: 'Aceptar',
                            timer: 2500
                        })  .then((result) => {
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
    },
}
