var jsZip = require('jszip');
var fs = require('fs');

module.exports = function(req, res) {
    var zipName = req.body['zipName'];
    var nameArr = req.body['names'];
    var imgArr = req.body['imgs'];
    var zip = new jsZip();
    var svgFolder = zip.folder(zipName);
    if (typeof imgArr === 'string') {
        var file_content = fs.readFileSync(imgArr);
        svgFolder.file(nameArr, file_content);
    } else {
        for (var i in imgArr) {
            var file_content = fs.readFileSync(imgArr[i]);
            svgFolder.file(nameArr[i], file_content);
        }
    }
    zip.generateAsync({
        type: 'nodebuffer'
    }).then(function(content) {
        fs.writeFile('./static/wiifont/static/tmp/' + zipName + '.zip', content, function(err) {
            if (err) {
                res.json({
                    ret: 1,
                    msg: '压缩出错!'
                });
            } else {
                res.json({
                    ret: 0,
                    data: '/static/wiifont/static/tmp/' + zipName + '.zip'
                });
            }
        });
    });

};
