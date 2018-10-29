let socket = io();

$(document).ready(function() {
    initSockets();
    initScrollToBottom();
    initAnimations();

    $('#generate-button').click(generate);
});

function initSockets() {
    socket.on('angular generate data', function(payload) {
        switch(payload.type) {
            case 'data':
                $('#output').append('<p>' + payload.data + '</p>');
                break;
            case 'error':
                $('#output').append('<p style="color: red">' + payload.data + '</p>');
                break;
            case 'done':
                let style = "";
                payload.code !== 0 ? style = "color: red" : style = "color: limegreen";
                $('#output').append('<p style="' + style + '">' + payload.data + '</p><p></p>');
                break;
            case 'zip_start':
                $('#output').append('<p>Generation completed, directory is being zipped.</p>');
                break;
            case 'zip_done':
                $('#output').append('<p>Done! Download the file below.</p>');
                $('#download').removeAttr('disabled');
                $('#download').click(function() { window.location = payload.link; });
                break;
        }
    });
}

function initScrollToBottom() {
    // Set up auto scroll for console output
    let consoleDiv = document.getElementById('output');
    let observer = new MutationObserver(function() { consoleDiv.scrollTop = consoleDiv.scrollHeight });
    observer.observe(consoleDiv, { childList: true });
}

let activeStep = "", prevStep = "";
function initAnimations() {
    // Animate scrolling
    function animateScroll(where) {
        prevStep = activeStep;
        activeStep = where;
        $(activeStep).show(0, function() {
            $("html, body").animate(
                { scrollTop: $(where).offset().top },
                1000,
                function() { $(prevStep).hide(); });
        });
    }
    // Hide all steps
    $('#step1').hide();
    $('#step2').hide();
    $('#step3').hide();
    // Button on clicks
    $('#button-begin').click(function() { animateScroll('#step1'); });
    $('#button-step1-next').click(function() { animateScroll('#step2'); });
    $('#button-step2-back').click(function() { animateScroll('#step1') });
    $('#button-step2-next').click(function() { animateScroll('#step3') });
    $('#button-step3-back').click(function() { animateScroll('#step2') });
    // Animate chevron
    let offset = 20, down = true;
    setInterval(frame, 20);
    function frame() {
        let arrow = document.getElementById('down-hint');
        if (offset > 70) {
            down = false;
            offset = 70;
        } else if (offset < 20) {
            down = true;
            offset = 20;
        } else {
            if (down) {
                arrow.style.top = offset+ 'px';
                offset++;
            }
            if (!down) {
                arrow.style.top = offset + 'px';
                offset--;
            }
        }
    }
}

function generate() {
    $('#output').empty();
    let name = $('#name').val();
    let framework = $('input:radio[name ="framework"]:checked').val();
    if (name && framework) socket.emit(framework + ' generate', { app_name: name });
}
