'use strict';

module.exports = function(grunt) {

    grunt.registerMultiTask('redbot', 'Test HTTP implementation using redbot validator.', function() {
        var options = this.options({
            assets: false,
            bin: 'redbot',
            format: 'txt',
            severity: 'noFail'
        });
        var config = targetConfigOverride(options, this.data);
        validateConfig(config);

        if (this.data.uri == undefined) {
            grunt.warning('You must specify at least one URI for redbot to process.');
        }
        // Post-process URIs
        if (!(this.data.uri instanceof Array)) {
            this.data.uri = [this.data.uri];
        }
        var uris = this.data.uri;
        var done = this.async();

        uris.forEach(function(uri) {
            var args = [uri, '-o ' + config.format];
            if (config.assets) {
                args.push('-a');
            }
            var cmd = config.bin + ' ' + args.join(' ');
            redbot(cmd, uri, config, done);
        });
    });

    /**
     * Runs the redbot commandline with the provided arguments.
     */
    var redbot = function(cmd, uri, config, done) {
        var exec = require('child_process').exec;
        grunt.verbose.writeln(('Exec: ' + cmd).cyan);
        var res = exec(cmd, null, function(error, result, code) {
            if (error) {
                grunt.warn('exec error: ' + error)
                return done(error);
            }
            if (config.format == 'har') {
                result = JSON.parse(result);
                validateHttpResponse(result.log.entries[0].response);
            }
            grunt.log.subhead(('Redbot Response for "' + uri + '"').underline);
            grunt.log.writeln(result);
            // Setting the timeout seems to give the process sufficient time to
            // print the buffer. Not sure which step of the pipeline (request,
            // processing, print) needs this time, so making it a configurable
            // in case it needs to vary by project.
            setTimeout(function() {
                done();
            }, config.timeout || 50);
        });
    }

    /**
     * Validates the HTTP response contained in the Redbot HAR file.
     */
    var validateHttpResponse = function(response) {
        var code = response.status;
        if (code >= 300) {
            // Only a printed warning, as a 'bad' response may be the purpose
            // of a specific URL test. However, if you expect it to be a good
            // response, some indicator of broken test validity seems critical
            // to avoid pending insanity.
            grunt.log.writeln(('Your redbot test received a response with the code HTTP ' + code).yellow);
        }

        return code;
    }

    /**
     * Override task "global" options with target-specific configuration.
     */
    var targetConfigOverride = function(options, targetConfig) {
        var config = [];
        Object.keys(options).forEach(function(attr) {
            config[attr] = targetConfig[attr] ? targetConfig[attr] : options[attr];
        });

        return config;
    }

    /**
     * Validates configuration options.
     *
     * Format will be handled by the Redbot utility itself.
     */
    var validateConfig = function(config) {
        var severity = ['noFail', 'warning', 'bad'];
        if (config.severity == undefined || severity.indexOf(config.severity) < 0 ) {
            grunt.warning('Severity currently set to "' + config.severity + '" and must be set to a valid value: ' + severity.join(', '));
        }
        if (config.bin == undefined) {
            grunt.warning('You have overridden the path to redbot with an invalid substitute.');
        }
        if (config.severity != 'noFail' && config.format != 'har') {
            grunt.verbose.writeln('Severity option is skipped unless format is set to "har".'.yellow);
        }

        return true;
    }
}
