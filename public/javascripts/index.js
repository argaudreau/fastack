let socket = io();

$(document).ready(function() {
    initSockets();
    initScrollToBottom();
    initAnimations();

    $('#generate-button').click(generate);
});

function initSockets() {
    socket.on('generate data', function(payload) {
        switch(payload.type) {
            case 'data':
                $('#console-icon').addClass('fa-sync');
                $('#console-icon').removeClass('console-spinner');
                $('#console-icon').removeClass('fa-times');
                $('#output').append('<p>' + payload.data + '</p>');
                break;
            case 'error':
                $('#output').append('<p style="color: red">' + payload.data + '</p>');
                $('#status').html('Could not generate app, see below.');
                $('#console-icon').removeClass('fa-sync');
                $('#console-icon').removeClass('console-spinner');
                $('#console-icon').addClass('fa-times');
                break;
            case 'done':
                let style = "";
                payload.code !== 0 ? style = "color: red" : style = "color: limegreen";
                $('#output').append('<p style="' + style + '">' + payload.data + '</p><p></p>');
                break;
            case 'zip_start':
                $('#output').append('<p>Generation completed, directory is being zipped.</p>');
                $('#status').html('App was generated! Ziping directory...');
                break;
            case 'zip_done':
                $('#output').append('<p>Done! Download the file below.</p>');
                $('#download').removeAttr('disabled');
                $('#generate-button').attr('disabled', true);
                $('#download').click(function() { window.location = payload.link; });
                $('#status').html('All done! Download your app below.');
                $('#console-icon').removeClass('fa-sync');
                $('#console-icon').removeClass('console-spinner');
                $('#console-icon').addClass('fa-check');
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
    $('#button-step1-next').click(function() {
        let framework = $('input:radio[name ="framework"]:checked').val();
        showFeatures(framework);
        animateScroll('#step2');
    });
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

function showFeatures(framework) {
    $('#features').empty();
    switch (framework) {
        case 'angular':
            $('#features').append(
                '<form> \
                    <input id="no-tests" type="checkbox"> No testing frameworks <br>\
                    <input id="routing" type="checkbox"> Generate routing module <br>\
                    <input id="skip-spec" type="checkbox"> Skip creation of test (spec) files <br>\
                </form>');
            break;
        case 'node':
            $('#features').append(
                '<form> \
                    <b>hogan.js engine support</b> <br> \
                    <input type="radio" name="hogan" value="yes"> yes \
                    <input type="radio" name="hogan" value="no" checked> no <br>\
                    <b>View engine</b> <br>\
                    <input type="radio" name="view" value="none"> none \
                    <input type="radio" name="view" value="ejs"> ejs \
                    <input type="radio" name="view" value="hbs"> hbs \
                    <input type="radio" name="view" value="hjs"> hjs \
                    <input type="radio" name="view" value="jade" checked> jade \
                    <input type="radio" name="view" value="pug"> pug \
                    <input type="radio" name="view" value="twig"> twig \
                    <input type="radio" name="view" value="vash"> vash <br>\
                </form>');
            break;
        case 'react':
            $('#features').append('<p>react</p>');
            break;
        case 'vue':
            /*
             -i [insert json here]
             {
                  "useConfigFiles": true,
                  "router": true,
                  "vuex": true,
                  "cssPreprocessor": "sass",
                  "plugins": {
                    "@vue/cli-plugin-babel": {},
                    "@vue/cli-plugin-eslint": {
                      "config": "airbnb",
                      "lintOn": ["save", "commit"]
                    }
                  }
                }
            * */
            $('#features').append(
                '<form> \
                    <b>Configuration</b> <br>\
                    <input id="defaults" type="checkbox"> Use defaults <br> \
                    <input id="configFiles" type="checkbox"> Use configuration Files <br> \
                    <input id="routing-plugin" type="checkbox"> Add routing plugin <br> \
                    <input id="vuex-plugin" type="checkbox"> Add Vuex plugin <br> \
                </form>');
            break;
    }
}

function getFeatures(framework) {
    switch (framework) {
        case 'angular':
            return {
                no_test: $('#no-tests').prop('checked'),
                routing: $('#routing').prop('checked'),
                skip_spec: $('#skip-spec').prop('checked')
            };
        case 'node':
            return {
                hogan: $('input:radio[name="hogan"]:checked').val(),
                view: $('input:radio[name="view"]:checked').val()
            };
        case 'react':
            return {

            };
        case 'vue':
            if ($('#defaults').prop('checked')) {
                return {};
            } else {
                return {
                    preset: {
                        "useConfigFiles": $('#configFiles').prop('checked'),
                        "router": $('#routing-plugin').prop('checked'),
                        "vuex": $('#vuex-plugin').prop('checked'),
                    }
                };
            }
    }
}

function generate() {
    $('#output').empty();
    $('#status').html('Generating your application...');
    $('#console-icon').addClass('console-spinner');
    let name = $('#name').val();
    let framework = $('input:radio[name ="framework"]:checked').val();
    let features = getFeatures(framework);
    if (name && framework) socket.emit(framework + ' generate', { app_name: name, features: features });
}
