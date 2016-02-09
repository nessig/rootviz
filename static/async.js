$(document).ready(function() {
    //connect to the socket server.
    var socket = io.connect('http://' + document.domain + ':' + location.port + '/test');
    var numbers_received = [];

    socket.on('newnumber', function(msg) {
        $('#log').html("<p>" + msg.number.toString() + "</p>");
    });

    $('form#emit').submit(function(event) {
        event.preventDefault();
        // console.log( $( this ).serialize() );
        var ajax_data = {};
        $('.user_input').each(function() {
            ajax_data[$(this).attr('name')] = $(this).val();
        });
		ajax_data["N"] = 1200;
		ajax_data["M"] = 1200;
        socket.emit('roots', {data: ajax_data});
        return false;
    });
});
