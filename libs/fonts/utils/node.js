/**
 * grunt-webfont: Node.js engine
 *
 * @requires ttfautohint 1.00+ (optional)
 * @author Artem Sapegin (http://sapegin.me)
 */

module.exports = function(o, allDone) {
    'use strict';

    console.log('node')

    var fs = require('fs');
    var path = require('path');
    var async = require('async');
    var temp = require('temp');
    var exec = require('exec');
    var _ = require('lodash');
    var StringDecoder = require('string_decoder').StringDecoder;
    var svgicons2svgfont = require('svgicons2svgfont');
    var svg2ttf = require('svg2ttf');
    var ttf2woff = require('ttf2woff');
    var ttf2eot = require('ttf2eot');
    var SVGO = require('svgo');
    var MemoryStream = require('memorystream');
    var logger = o.logger || require('winston');
    var wf = require('../utils/util');

    // @todo Ligatures

    var fonts = {};

    var generators = {
        svg: function(done) {
            var font = '';
            var decoder = new StringDecoder('utf8');
            svgFilesToStreams(o.files, function(streams) {
                var stream = svgicons2svgfont(streams, {
                    fontName: o.fontName || 'wiifont',
                    fontHeight: o.fontHeight,
                    descent: o.descent,
                    normalize: o.normalize,
                    round: o.round,
                    log: logger.verbose.bind(logger),
                    error: logger.error.bind(logger)
                });
                // console.log('stream', stream)
                stream.on('data', function(chunk) {
                    // 没有执行!
                    font += decoder.write(chunk);
                    console.log('stream data', font)
                });
                stream.on('end', function() {
                    fonts.svg = font;
                    console.log('stream end', font)
                    done(font);
                });
            });
        },

        ttf: function(done) {
            getFont('svg', function(svgFont) {
                var font = svg2ttf(svgFont, {});
                font = new Buffer(font.buffer);
                autohintTtfFont(font, function(hintedFont) {
                    // ttfautohint is optional
                    if (hintedFont) {
                        font = hintedFont;
                    }
                    fonts.ttf = font;
                    done(font);
                });
            });
        },

        woff: function(done) {
            getFont('ttf', function(ttfFont) {
                var font = ttf2woff(new Uint8Array(ttfFont), {});
                font = new Buffer(font.buffer);
                fonts.woff = font;
                done(font);
            });
        },

        woff2: function(done) {
            // Will be converted from TTF later
            done();
        },

        eot: function(done) {
            getFont('ttf', function(ttfFont) {
                var font = ttf2eot(new Uint8Array(ttfFont));
                font = new Buffer(font.buffer);
                fonts.eot = font;
                done(font);
            });
        }
    };

    var steps = [];

    // Font types
    var typesToGenerate = o.types.slice();
    if (o.types.indexOf('woff2') !== -1 && o.types.indexOf('ttf'  === -1)) typesToGenerate.push('ttf');
    typesToGenerate.forEach(function(type) {
        steps.push(createFontWriter(type));
    });

    steps.push(allDone);

    console.log('steps end')

    // Run!
    let result = async.waterfall(steps);

    function getFont(type, done) {
        if (fonts[type]) {
            done(fonts[type]);
        }
        else {
            generators[type](done);
        }
    }

    function createFontWriter(type) {
        console.log('createFontWriter', type)
        return function(done) {
            getFont(type, function(font) {
                fs.writeFileSync(wf.getFontPath(o, type), font);
                done();
            });
        };
    }

    function svgFilesToStreams(files, done) {
        console.log('svgFilesToStreams')
        async.map(files, function(file, fileDone) {
            console.log('fileDone', fileDone)
            var svg = fs.readFileSync(file, 'utf8');
            var svgo = new SVGO();
            try {
                svgo.optimize(svg, function(res) {
                    var idx = files.indexOf(file);
                    var name = o.glyphs[idx];
                    var stream = new MemoryStream(res.data, {
                        writable: false
                    });
                    console.log('svgFilesToStreams stream')
                    fileDone(null, {
                        codepoint: o.codepoints[name],
                        name: name,
                        stream: stream
                    });
                });
            }
            catch(err) {
                fileDone(err);
            }
        }, function(err, streams) {
            if (err) {
                logger.error('Can’t simplify SVG file with SVGO.\n\n' + err);
                allDone(false);
            }
            else {
                // console.log('done', done)
                // console.log(streams)
                done(streams);
            }
        });
    }

    function autohintTtfFont(font, done) {
        var tempDir = temp.mkdirSync();
        var originalFilepath = path.join(tempDir, 'font.ttf');
        var hintedFilepath = path.join(tempDir, 'hinted.ttf');

        if (!o.autoHint){
            done(false);
            return;
        }
        // Save original font to temporary directory
        fs.writeFileSync(originalFilepath, font);

        // Run ttfautohint
        var args = [
            'ttfautohint',
            '--symbol',
            '--fallback-script=latn',
            '--windows-compatibility',
            '--no-info',
            originalFilepath,
            hintedFilepath
        ];

        exec(args, function(err, out, code) {
            if (err) {
                if (err instanceof Error) {
                    if (err.code === 'ENOENT') {
                        logger.verbose('Hinting skipped, ttfautohint not found.');
                        done(false);
                        return;
                    }
                    err = err.message;
                }
                logger.error('Can’t run ttfautohint.\n\n' + err);
                done(false);
                return;
            }

            // Read hinted font back
            var hintedFont = fs.readFileSync(hintedFilepath);
            done(hintedFont);
        });
    }

};