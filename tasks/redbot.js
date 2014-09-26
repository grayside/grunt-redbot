'use strict';

module.exports = function(grunt) {
    grunt.registerMultiTask('redbot', 'Test HTTP implementation using redbot validator.', function() {
        var options = this.options({
            assets: false,
            bin: 'redbot',
            format: 'txt',
            severity: 'noFail'
        });

        // Allow format and severity to be overridden per target.
        if (this.data.format != undefined ) {
            options.format = this.data.format;
        }
        if (this.data.severity != undefined) {
            options.severity = this.data.severity;
        }

        // Minimally validate all options.
        // Format will be handled by the Redbot utility itself.
        var severity = ['noFail', 'warning', 'bad'];
        if (options.severity == undefined || severity.indexOf(options.severity) < 0 ) {
            grunt.warning('Severity currently set to "' + options.severity + '" and must be set to a valid value: ' + severity.join(', '));
        }
        if (options.bin == undefined) {
            grunt.warning('You have overridden the path to redbot with an invalid substitute.');
        }
        if (this.data.uri == undefined) {
            grunt.warning('You must specify at least one URI for redbot to process.');
        }
        if (options.severity != 'noFail' && options.format != 'har') {
            grunt.verbose.writeln('Severity option is skipped unless format is set to "har".'.yellow);
        }

        // Post-process URIs
        if (!(this.data.uri instanceof Array)) {
            this.data.uri = [this.data.uri];
        }
        
        var uris = this.data.uri;
        var done = this.async();
        var exec = require('child_process').exec;

        uris.forEach(function(uri) {
            var args = [uri, '-o ' + options.format];
            if (options.assets) {
                args.push('-a');
            }
            var cmd = options.bin + ' ' + args.join(' ');
            grunt.verbose.writeln(('Exec: ' + cmd).cyan);
            var res = exec(cmd, null, function(error, result, code) {
                if (error) {
                    grunt.warn('exec error: ' + error)
                    return done(error);
                }
                if (options.format == 'har') {
                    result = JSON.parse(result);
                    var code = result.log.entries[0].response.status;
                    if (code >= 300) {
                        grunt.log.writeln(('Your redbot test received a response with the code HTTP ' + code).yellow);
                    }
                }
                grunt.log.subhead(('Redbot Response for "' + uri + '"').underline);
                grunt.log.writeln(result);
                // Setting the timeout seems to give the process sufficient time to print the buffer.
                // Not sure which step of the pipeline (request, processing, print) needs this time, so making it
                // a configurable in case it needs to vary by project.
                setTimeout(function() {
                    done();
                }, options.timeout || 50);
            });
        });
    });
}
