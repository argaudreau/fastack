let express = require('express');
let router = express.Router();
let spawn = require('child_process').spawn;

/* API health check */
router.get('/', function(req, res, next) {
    res.send("API is working!");
});

/* Generate an angular application */
router.post('/angular/generate', function(req, res, next) {
    // Check to see if we have the app name
    if (!req.body.app_name) {
        res.send("ERROR: No app name specified. Nothing was generated.");
        return;
    }
    // Generate the directory
    let process = spawn('ng', ['new', req.body.app_name], {cwd: './temp'});
    process.stdout.on('data', (data) => {
        console.log(data.toString());
    });
    process.stderr.on('data', (data) => {
        console.error(data.toString());
    });
    process.on('exit', (code) => {
        console.log('Process exited with code', code);
        res.send('Done!');
    });
});

module.exports = router;
