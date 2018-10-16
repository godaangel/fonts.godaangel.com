var icon = require('../../../model/icon.js');
var util = require('../../../lib/util.js');
var fs = require('fs');
var path = require('path');

function fileUpload(pId, fileName, filePath, req, res, callback) {
    req['body']['pId'] = pId;
    req['body']['name'] = fileName;
    req['body']['path'] = filePath;
    req['body']['status'] = 1;
    icon.add(req, res, function(insertId) {
        callback.call(this, {
            id: insertId,
            name: fileName,
            path: filePath
        });
    });
}

module.exports = function(req, res) {
    var form = new yog.multiparty.Form({ 
        uploadDir: './static/wiifont/static/tmp',
        encoding:"utf-8"
    });
    console.log('nimei')
    form.parse(req, function(err, fields, files) {
        var pId = fields.pId;
        var svgFiles = files.file;
        var len = svgFiles.length - 1;
        var rows = [];
        for (var i = 0; i < svgFiles.length; i++) {
            var svg = svgFiles[i];
            var filePath = svg.path;
            var fileName = svg.originalFilename;
            var dirname = path.dirname(filePath);
<<<<<<< HEAD
            fs.rename(svg.path,dirname+'/'fileName);
            console.log('aaa:'+svg.path+','+dirname+'/'+fileName)
=======
            fs.rename(svg.path,dirname+'/'+fileName);
>>>>>>> f68f89c1f5c3637051295b2e205994d28ed24a72
            fileUpload(pId, fileName, filePath, req, res, function(data) {
                rows.push(data);
                if (rows.length == svgFiles.length) {
                    res.json({
                        ret: 0,
                        errNo: 0,
                        data: {
                            rows: rows
                        },
                        msg: '上传成功！'
                    });
                }
            });
        }
    });
};
