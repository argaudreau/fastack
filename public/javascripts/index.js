let socket = io();

$(document).ready(function() {
    initSockets();
    initScrollToBottom();

    $('#generate-button').click(generate);
    $('#delete-button').click(del);
});

function initSockets() {
    socket.on('angular generate data', function(data) {
        $('#output').append('<p>' + data + '</p>');
    });
}

function initScrollToBottom() {
    // Set up auto scroll for console output
    let consoleDiv = document.getElementById('output');
    let observer = new MutationObserver(function() { consoleDiv.scrollTop = consoleDiv.scrollHeight });
    observer.observe(consoleDiv, { childList: true });
}

function generate() {
    $('#output').empty();
    let name = $('#name').val();
    let framework = $('input:radio[name ="framework"]:checked').val();
    if (name && framework) socket.emit(framework + ' generate', { app_name: name });
}

function del() {
    let name = $('#name').val();
    if (name) socket.emit('files remove', { name: name });
}

