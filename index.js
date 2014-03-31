/*
 * gulp-spellcheck
 *
 * Copyright(c) 2014 André König <andre.koenig@posteo.de>
 * MIT Licensed
 *
 */

/**
 * @author André König <andre.koenig@posteo.de>
 *
 */

'use strict';

var util        = require('util');
var through     = require('through2');
var aspell      = require('aspell');
var gutil       = require('gulp-util');
var PLUGIN_NAME = 'gulp-spellcheck';

module.exports = function (options) {

    options = options || {};
    options.replacement = '%s (suggestions: %s)';

    options.language = (options.language)? util.format('--lang=%s', options.language) : '';

    function check (file, enc, callback) {
        /*jshint validthis:true */
        var self = this;
        var contents = file.toString('utf-8');


        aspell.args.push(options.language);

        aspell(contents)
            .on('error', function onError (err) {
                err = err.toString('utf-8');
                return self.emit('error', new gutil.PluginError(PLUGIN_NAME, err));
            })
            .on('result', function onResult (result) {
                if ('misspelling' === result.type) {
                    contents = contents.replace(result.word, util.format(options.replacement, result.word, result.alternatives.join(', ')));
                }
            })
            .on('end', function () {
                self.push(contents);

                return callback();
            });
    }

    function finalize (callback) {
        return callback();
    }

    return through.obj(check, finalize);
};