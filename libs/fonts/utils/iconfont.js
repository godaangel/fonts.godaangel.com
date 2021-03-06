/**
 * SVG to webfont converter for Grunt
 *
 */


'use strict';

var fs = require('fs');
var path = require('path');
var exec = require('exec');
var async = require('async');
var glob = require('glob');
var chalk = require('chalk');
var mkdirp = require('mkdirp');
var crypto = require('crypto');
var _ = require('lodash');
var _s = require('underscore.string');
var wf = require('../utils/util');



module.exports.generateFonts = function(options){
    // console.log(options)
    var allDone = function(){
        console.log("all done");
    }
    var getFile = options.getFile;
    var generateZip = options.generateZip;
    //默认抹平icon的高度差异
    if(!options.hasOwnProperty('normalize')){
        options['normalize'] = true;
    }
    if(!options.hasOwnProperty('autoHint')){
        options['autoHint'] = false;
    }

    var md5 = crypto.createHash('md5');

    /**
     * Winston to Grunt logger adapter.
     */
    var logger = {
        warn: function() {
            console.log(arguments);
        },
        error: function() {
            console.log(arguments);
        },
        log: function() {
            console.log(arguments);
        },
        verbose: function() {
            console.log(arguments);
        }
    };


    // Source files
    var files = _.filter(fs.readdirSync(options.src), isSvgFile).map(function(file){
        return path.join(options.src,file);
    });

    var order = options['order'] || "name";
    files.sort(function(a,b){
        //按名称排列
        if(order=="name"){
            return a - b;
        }else{
            //按修改时间顺序排列
            return  fs.statSync(a).mtime.getTime() - fs.statSync(b).mtime.getTime();
        }
    })
    if (!files.length) {
        logger.warn('Specified empty list of source SVG files.');
        completeTask();
        return;
    }
    // Options
    var o = {
        baseClass: 'icon',
        classPrefix: 'icon_',
        logger: logger,
        fontBaseName: options.fontname || 'iconfont',
        destCss: options.destCss || options.dest,
        dest: options.dest,
        relativeFontPath: options.relativeFontPath,
        addHashes: options.hashes !== false,
        addLigatures: options.ligatures === true,
        template: options.template,
        syntax: options.syntax || '_icons',
        templateOptions: options.templateOptions || {},
        stylesheet: options.stylesheet || (options.template ? path.extname(options.template).replace(/^\./, '') : false) || 'css',
        htmlDemo: options.htmlDemo !== false,
        htmlDemoTemplate: options.htmlDemoTemplate,
        styles: optionToArray(options.styles, 'font,icon'),
        types: optionToArray(options.types, 'svg,eot,woff,ttf,woff2'),
        order: optionToArray(options.order, wf.fontFormats),
        embed: options.embed === true ? ['woff'] : optionToArray(options.embed, false),
        rename: options.rename || path.basename,
        engine: 'node',
        autoHint: options.autoHint !== false,
        codepoints: options.codepoints,
        startCodepoint: options.startCodepoint || wf.UNICODE_PUA_START,
        ie7: options.ie7 === true,
        normalize: options.normalize === true,
        round: options.round !== undefined ? options.round : 10e12,
        fontHeight: options.fontHeight !== undefined ? options.fontHeight : 512,
        descent: options.descent !== undefined ? options.descent : 64,
        cache: options.cache || path.join(__dirname, '..', '.cache'),
        callback: options.callback
    };

    o = _.extend(o, {
        fontName: o.fontBaseName,
        destHtml: options.destHtml || o.destCss,
        fontfaceStyles: has(o.styles, 'font'),
        baseStyles: has(o.styles, 'icon'),
        extraStyles: has(o.styles, 'extra'),
        files: files,
        glyphs: []
    });

    // “Rename” files
    o.glyphs = o.files.map(function(file) {
        // console.log(file)
        // console.log('test:'+file.filename())
        var fileName = o.rename(file).replace(path.extname(file), '');
        return fileName;
    });


    // Check or generate codepoints
    // @todo Codepoint can be a Unicode code or character.
    var currentCodepoint = o.startCodepoint;
    if (!o.codepoints) o.codepoints = {};
    o.glyphs.forEach(function(name) {
        if (!o.codepoints[name]) {
            o.codepoints[name] = getNextCodepoint();
        }
    });

    // Check if we need to generate font
    /*o.hash = getHash();
    var previousHash = readHash(this.name, this.target);
    logger.verbose('New hash:', o.hash, '- previous hash:', previousHash);
    if (o.hash === previousHash) {
        logger.verbose('Config and source files weren’t changed since last run, checking resulting files...');
        var regenerationNeeded = false;

        var generatedFiles = wf.generatedFontFiles(o);
        if (!generatedFiles.length){
            regenerationNeeded = true;
        }
        else {
            generatedFiles.push(getDemoFilePath());
            generatedFiles.push(getCssFilePath());

            regenerationNeeded = _.some(generatedFiles, function(filename) {
                if (!filename) return false;
                if (!fs.existsSync(filename)) {
                    logger.verbose('File', filename, ' is missed.');
                    return true;
                }
                return false;
            });
        }
        if (!regenerationNeeded) {
            logger.log('Font ' + chalk.cyan(o.fontName) + ' wasn’t changed since last run.');
            completeTask();
            return;
        }
    }*/

    // Save new hash and run
    //saveHash(this.name, this.target, o.hash);
    async.waterfall([
        createOutputDirs,
        cleanOutputDir,
        generateFont,
        generateWoff2Font,
        generateStylesheet,
        generateDemoHtml,
        printDone,
        getFontFiles,
        geneZip
    ], completeTask);

    function toUnicode(theString) {
        var unicodeString = '';
        for (var i = 0; i < theString.length; i++) {
            var theUnicode = theString.charCodeAt(i).toString(16).toUpperCase();
            while (theUnicode.length < 4) {
                theUnicode = '0' + theUnicode;
            }
            theUnicode = '\\u' + theUnicode;
            unicodeString += theUnicode;
        }
        return unicodeString;
    }


    /**
     * Call callback function if it was specified in the options.
     */
    function completeTask() {
        if (o && _.isFunction(o.callback)) {
            o.callback(o.fontName, o.types, o.glyphs);
        }
    }
    /**
    *get the font files
    */
    function getFontFiles(done){
        getFile(options.destHtml);
        done();
    }


    /**
    *get the font files
    */
    function geneZip(done){
        generateZip();
    }
    /**
     * Calculate hash to flush browser cache.
     * Hash is based on source SVG files contents, task options and grunt-webfont version.
     *
     * @return {String}
     */
    function getHash() {
        // Source SVG files contents
        o.files.forEach(function(file) {
            md5.update(fs.readFileSync(file, 'utf8'));
        });

        // Options
        md5.update(JSON.stringify(o));

        // grunt-webfont version
        var packageJson = require('../package.json');
        md5.update(packageJson.version);

        return md5.digest('hex');
    }

    /**
     * Create output directory
     *
     * @param {Function} done
     */
    function createOutputDirs(done) {
        mkdirp.sync(o.destCss);
        mkdirp.sync(o.dest);
        done();
    }

    /**
     * Clean output directory
     *
     * @param {Function} done
     */
    function cleanOutputDir(done) {
        var htmlDemoFileMask = path.join(o.destCss, o.fontBaseName + '*.{' + o.stylesheet + ',html}');
        var files = glob.sync(htmlDemoFileMask).concat(wf.generatedFontFiles(o));
        async.forEach(files, function(file, next) {
            fs.unlink(file, next);
        }, done);
    }

    /**
     * Generate font using selected engine
     *
     * @param {Function} done
     */
    function generateFont(done) {
        // var engine = require('./engines/' + o.engine);
        var engine = require('../utils/'+o.engine);
        console.log(engine)
        engine(o, function(result) {
            console.log('result')
            if (result === false) {
                // Font was not created, exit
                completeTask();
            }
            if (result) {
                o = _.extend(o, result);
            }

            done();
        });
    }

    /**
     * Converts TTF font to WOFF2.
     *
     * @param {Function} done
     */
    function generateWoff2Font(done) {
        if (!has(o.types, 'woff2')) {
            done();
            return;
        }
        // Run woff2_compress
        var ttfFont = wf.getFontPath(o, 'ttf');
        var args = [
            'woff2_compress',
            ttfFont
        ];
        exec(args, function(err, out, code) {
            if (err) {
                if (err instanceof Error) {
                    if (err.code === 'ENOENT') {
                        logger.error('woff2_compress not found. It is required for creating WOFF2 fonts.');
                        done();
                        return;
                    }
                    err = err.message;
                }
                logger.error('Can’t run woff2_compress.\n\n' + err);
                done();
                return;
            }

            // Remove TTF font if not needed
            if (!has(o.types, 'ttf')) {
                fs.unlinkSync(ttfFont);
            }

            done();
        });
    }

    /**
     * Generate CSS
     *
     * @param {Function} done
     */
    function generateStylesheet(done) {
        console.log('generateStylesheet')
        // Relative fonts path
        if (!o.relativeFontPath) {
            o.relativeFontPath = path.relative(o.destCss, o.dest);
        }
        o.relativeFontPath = normalizePath(o.relativeFontPath);

        // Generate font URLs to use in @font-face
        var fontSrcs = [[], []];
        o.order.forEach(function(type) {
            if (!has(o.types, type)) return;
            wf.fontsSrcsMap[type].forEach(function(font, idx) {
                if (font) {
                    fontSrcs[idx].push(generateFontSrc(type, font));
                }
            });
        });

        // Convert them to strings that could be used in CSS
        var fontSrcSeparator = option(wf.fontSrcSeparators, o.stylesheet);
        fontSrcs.forEach(function(font, idx) {
            // o.fontSrc1, o.fontSrc2
            o['fontSrc'+(idx+1)] = font.join(fontSrcSeparator);
        });
        o.fontRawSrcs = fontSrcs;
        // Convert codepoints to array of strings
        var codepoints = [];
        _.each(o.glyphs, function(name) {
            codepoints.push(o.codepoints[name].toString(16));
        });
        o.codepoints = codepoints;

        // Prepage glyph names to use as CSS classes
        o.glyphs = _.map(o.glyphs, classnameize);

        // Read JSON file corresponding to CSS template
        var templateJson = readTemplate(o.template, o.syntax, '.json', true);
        if (templateJson) o = _.extend(o, JSON.parse(templateJson.template));

        // Now override values with templateOptions
        if (o.templateOptions) o = _.extend(o, o.templateOptions);

        // Generate CSS
        var ext = path.extname(o.template) || '.css';  // Use extension of o.template file if given, or default to .css
        o.cssTemplate = readTemplate(o.template, o.syntax, ext);

        var cssContext = _.extend(o, {
            iconsStyles: true
        });

        var css = renderTemplate(o.cssTemplate, cssContext);

        // Fix CSS preprocessors comments: single line comments will be removed after compilation
        if (has(['sass', 'scss', 'less', 'styl'], o.stylesheet)) {
            css = css.replace(/\/\* *(.*?) *\*\//g, '// $1');
        }

        // Save file
        fs.writeFileSync(getCssFilePath(), css);

        done();
    }

    /**
     * Generate HTML demo page
     *
     * @param {Function} done
     */
    function generateDemoHtml(done) {
        if (!o.htmlDemo) return done();

        // HTML should not contain relative paths
        // If some styles was not included in CSS we should include them in HTML to properly render icons
        var relativeRe = new RegExp(_s.escapeRegExp(o.relativeFontPath), 'g');
        var htmlRelativeFontPath = normalizePath(path.relative(o.destHtml, o.dest));
        var context = _.extend(o, {
            fontSrc1: o.fontSrc1.replace(relativeRe, htmlRelativeFontPath),
            fontSrc2: o.fontSrc2.replace(relativeRe, htmlRelativeFontPath),
            fontfaceStyles: true,
            baseStyles: true,
            extraStyles: false,
            iconsStyles: true,
            stylesheet: 'css'
        });
        var htmlStyles = renderTemplate(o.cssTemplate, context);
        var htmlContext = _.extend(context, {
            styles: htmlStyles
        });

        // Generate HTML
        var demoTemplate = readTemplate(o.htmlDemoTemplate, 'template', '.html');
        var demo = renderTemplate(demoTemplate, htmlContext);
        // Save file
        fs.writeFileSync(getDemoFilePath(), demo);

        done();
    }

    /**
     * Print log
     *
     * @param {Function} done
     */
    function printDone(done) {
        logger.log('Font ' + chalk.cyan(o.fontName) + ' with ' + o.glyphs.length + ' glyphs created.');
        done();
    }


    /**
     * Helpers
     */

    /**
     * Convert a string of comma seperated words into an array
     *
     * @param {String} val Input string
     * @param {String} defVal Default value
     * @return {Array}
     */
    function optionToArray(val, defVal) {
        if (val === undefined) val = defVal;
        if (!val) return [];
        if (typeof val !== 'string') return val;
        if (val.indexOf(',') !== -1) {
            return val.split(',');
        }
        else {
            return [val];
        }
    }

    /**
     * Check if a value exists in an array
     *
     * @param {Array} haystack Array to find the needle in
     * @param {Mixed} needle Value to find
     * @return {Boolean} Needle was found
     */
    function has(haystack, needle) {
        return haystack.indexOf(needle) !== -1;
    }

    /**
     * Return a specified option if it exists in an object or `_default` otherwise
     *
     * @param {Object} map Options object
     * @param {String} key Option to find in the object
     * @return {Mixed}
     */
    function option(map, key) {
        if (key in map) {
            return map[key];
        }
        else {
            return map._default;
        }
    }

    /**
     * Find next unused codepoint.
     *
     * @return {Integer}
     */
    function getNextCodepoint() {
        while (_.contains(o.codepoints, currentCodepoint)) {
            currentCodepoint++;
        }
        return currentCodepoint;
    }

    /**
     * Check whether file is SVG or not
     *
     * @param {String} filepath File path
     * @return {Boolean}
     */
    function isSvgFile(filepath) {
        return path.extname(filepath).toLowerCase() === '.svg';
    }

    /**
     * Convert font file to data:uri and remove source file
     *
     * @param {String} fontFile Font file path
     * @return {String} Base64 encoded string
     */
    function embedFont(fontFile) {
        // Convert to data:uri
        var dataUri = fs.readFileSync(fontFile, 'base64');
        var type = path.extname(fontFile).substring(1);
        var fontUrl = 'data:application/x-font-' + type + ';charset=utf-8;base64,' + dataUri;

        // Remove font file
        fs.unlinkSync(fontFile);

        return fontUrl;
    }

    /**
     * Append a slash to end of a filepath if it not exists and make all slashes forward
     *
     * @param {String} filepath File path
     * @return {String}
     */
    function normalizePath(filepath) {
        if (!filepath.length) return filepath;

        // Make all slashes forward
        filepath = filepath.replace(/\\/g, '/');

        // Make sure path ends with a slash
        if (!_s.endsWith(filepath, '/')) {
            filepath += '/';
        }

        return filepath;
    }

    /**
     * Generate URL for @font-face
     *
     * @param {String} type Type of font
     * @param {Object} font URL or Base64 string
     * @return {String}
     */
    function generateFontSrc(type, font) {
        var filename = template(o.fontName + font.ext, o);

        var url;
        if (font.embeddable && has(o.embed, type)) {
            url = embedFont(path.join(o.dest, filename));
        }
        else {
            url = o.relativeFontPath + filename;
            if (o.addHashes) {
                if (url.indexOf('#iefix') === -1) {  // Do not add hashes for OldIE
                    url = url.replace(/(\.\w+)/, '$1?' + o.hash);
                }
            }
        }

        var src = 'url("' + url + '")';
        if (font.format) src += ' format("' + font.format + '")';

        return src;
    }

    /**
     * Reat the template file
     *
     * @param {String} template Template file path
     * @param {String} syntax Syntax (_icons, bootstrap, etc.)
     * @param {String} ext Extention of the template
     * @return {Object} {filename: 'Template filename', template: 'Template code'}
     */
    function readTemplate(template, syntax, ext, optional) {
        var filename = template
            ? path.resolve(template.replace(path.extname(template), ext))
            : path.join(__dirname, '/templates/' + syntax + ext)
        ;
        console.log(filename)
        if (fs.existsSync(filename)) {
            return {
                filename: filename,
                template: fs.readFileSync(filename, 'utf8')
            };
        }
        else if (!optional) {
            return console.error('Cannot find template at path: ' + filename);
        }
    }

    /**
     * Render template with error reporting
     *
     * @param {Object} template {filename: 'Template filename', template: 'Template code'}
     * @param {Object} context Template context
     * @return {String}
     */
    function renderTemplate(template, context) {
        try {
            return _.template(template.template, context);
        }
        catch (e) {
            console.error('Error while rendering template ' + template.filename + ': ' + e.message);
        }
    }

    /**
     * Basic template function: replaces {variables}
     *
     * @param {Template} tmpl Template code
     * @param {Object} context Values object
     * @return {String}
     */
    function template(tmpl, context) {
        return tmpl.replace(/\{([^\}]+)\}/g, function(m, key) {
            return context[key];
        });
    }

    /**
     * Prepare string to use as CSS class name
     *
     * @param {String} str
     * @return {String}
     */
    function classnameize(str) {
        return _s.trim(str).replace(/\s+/g, '-');
    }

    /**
     * Return path of CSS file.
     *
     * @return {String}
     */
    function getCssFilePath() {
        var cssFilePrefix = option(wf.cssFilePrefixes, o.stylesheet);
        return path.join(o.destCss, cssFilePrefix + o.fontBaseName + '.' + o.stylesheet);
    }

    /**
     * Return path of HTML demo file or `null` if its generation was disabled.
     *
     * @return {String}
     */
    function getDemoFilePath() {
        if (!o.htmlDemo) return null;
        return path.join(o.destHtml, o.fontBaseName + '.html');
    }

    /**
     * Save hash to cache file.
     *
     * @param {String} name Task name (webfont).
     * @param {String} target Task target name.
     * @param {String} hash Hash.
     */
    function saveHash(name, target, hash) {
        var filepath = getHashPath(name, target);
        mkdirp.sync(path.dirname(filepath));
        fs.writeFileSync(filepath, hash);
    }

    /**
     * Read hash from cache file or `null` if file don’t exist.
     *
     * @param {String} name Task name (webfont).
     * @param {String} target Task target name.
     * @return {String}
     */
    function readHash(name, target) {
        var filepath = getHashPath(name, target);
        if (fs.existsSync(filepath)) {
            return fs.readFileSync(filepath, 'utf8');
        }
        return null;
    }

    /**
     * Return path to cache file.
     *
     * @param {String} name Task name (webfont).
     * @param {String} target Task target name.
     * @return {String}
     */
    function getHashPath(name, target) {
        return path.join(o.cache, name, target, 'hash');
    }

}