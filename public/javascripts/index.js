let socket = io();

$(function() {
    $('#test-button').click(function () {
        socket.emit('angular generate', {app_name: 'wowza'});
    });

    socket.on('angular generate data', function (data) {
        $('#output').append('<p>' + data + '</p>');
    });
});
