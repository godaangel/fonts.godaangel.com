const fs = require('fs');
const path = require('path');
const async = require('async');
const _ = require('lodash');
const svg2ttf = require('svg2ttf');
const ttf2woff = require('ttf2woff');
const ttf2eot = require('ttf2eot');
const ttf2woff2 = require('ttf2woff2');
const jsZip = require('jszip');
const UTIL = require('./utils');
const SVGO = require('svgo');
var log = require('../log').getLogger(__filename);
const MemoryStream = require('memorystream');
const webfontsGenerator = require('webfonts-generator');


const SVGIcons2SVGFontStream = require('svgicons2svgfont');
const UNICODE_PUA_START = 0xF101; //初始unicode源值

var fontStream, downloadDir, newDownloadDir;
var iconfontName = 'wiifont';

/**
 * 初始参数
 * @type {Object}
 */
let iconDefaultcfg = {
  fontfileName: iconfontName,
  charmap: []
};
/**
 * 遍历输入目录下的svg图片列表
 * @param {string} path 入口目录
 */
const ScanList = (list) => {
  list.map(item => {
    const length = iconDefaultcfg.charmap.length;
    const NUM = length < 10 ? `00${length}` : (length < 100 ? `0${length}` : length);
    iconDefaultcfg.charmap.push({
      file: item.file
    })
  });
};

/**
 * 压缩svg
 * @Author   Warrenyang
 * @DateTime 2018-10-19
 * @param    {Object}   iconDefaultcfg 默认配置
 * @return   {[type]}                  [description]
 */
const optimizeSvg = (iconDefaultcfg) => {
  iconDefaultcfg = iconDefaultcfg || {};
  var files = [];
  for (let i in iconDefaultcfg.charmap) {
    files.push('public' + iconDefaultcfg.charmap[i].file);
  }

  async.map(files, function(file, fileDone) {
    var svg = fs.readFileSync(file, 'utf8');
    var svgo = new SVGO({
      plugins: [{
        cleanupAttrs: true,
      }, {
        removeDoctype: true,
      }, {
        removeXMLProcInst: true,
      }, {
        removeComments: true,
      }, {
        removeMetadata: true,
      }, {
        removeTitle: true,
      }, {
        removeDesc: true,
      }, {
        removeUselessDefs: true,
      }, {
        removeEditorsNSData: true,
      }, {
        removeEmptyAttrs: true,
      }, {
        removeHiddenElems: true,
      }, {
        removeEmptyText: true,
      }, {
        removeEmptyContainers: true,
      }, {
        removeViewBox: false,
      }, {
        cleanupEnableBackground: true,
      }, {
        convertStyleToAttrs: true,
      }, {
        convertColors: true,
      }, {
        convertPathData: true,
      }, {
        convertTransform: true,
      }, {
        removeUnknownsAndDefaults: true,
      }, {
        removeNonInheritableGroupAttrs: true,
      }, {
        removeUselessStrokeAndFill: true,
      }, {
        removeUnusedNS: true,
      }, {
        cleanupIDs: true,
      }, {
        cleanupNumericValues: true,
      }, {
        moveElemsAttrsToGroup: true,
      }, {
        moveGroupAttrsToElems: true,
      }, {
        collapseGroups: true,
      }, {
        removeRasterImages: false,
      }, {
        mergePaths: true,
      }, {
        convertShapeToPath: true,
      }, {
        sortAttrs: true,
      }, {
        removeDimensions: true,
      }, {
        removeAttrs: {
          attrs: '(stroke|fill)'
        },
      }]
    });
    try {
      svgo.optimize(svg).then(function(res) {
        var stream = new MemoryStream(res.data, {
          writable: false
        });
        console.log(svg)
        console.log(stream.toString());

        fileDone(null, {
          stream: stream
        });
      });
    } catch (err) {
      console.log(err);
      fileDone(err);
    }
  }, function(err, streams) {
    if (err) {
      log.error('Can’t simplify SVG file with SVGO.\n\n' + err);
    } else {
      createSvg(streams, iconDefaultcfg);
    }
  });
}

/**
 * 创建svg文件
 * @Author   Warrenyang
 * @DateTime 2018-10-19
 * @param    {Array}    streams        文件流
 * @param    {Object}   iconDefaultcfg 默认配置
 */
const createSvg = (streams, iconDefaultcfg) => {
  iconDefaultcfg = iconDefaultcfg || {};

  let startUicode = UNICODE_PUA_START; //设置字体起始code

  for (let i in streams) {
    let charConfig = iconDefaultcfg.charmap[i];
    const glyph = streams[i].stream;

    // 通过svg2svgfont生成svg
    const basename = path.basename(charConfig.file);
    const matches = basename.match(/^(?:((?:u[0-9a-f]{4,6},?)+)-)?(.+)\.svg$/i);
    let unicode = String.fromCodePoint(startUicode);
    iconDefaultcfg.charmap[i] = {
      cssCode: `${UTIL.encodeUnicode(unicode)}`,
      name: matches[2].split('-')[0]
    }
    startUicode++;

    glyph.metadata = {
      unicode: [unicode],
      name: matches[2].split('-')[0]
    };
    fontStream.write(glyph);
    // console.log(glyph)
  }
  fontStream.end();
};

/**
 * 创建svg文件
 * @Author   Warrenyang
 * @DateTime 2018-10-16
 * @version  [version]
 * @param    {Object}   iconDefaultcfg 默认配置
 */
// const createSvg = (iconDefaultcfg) => {
//   iconDefaultcfg = iconDefaultcfg || {};

//   optimizeSvg(iconDefaultcfg)

//   let startUicode = UNICODE_PUA_START; //设置字体起始code

//   for (let i in iconDefaultcfg.charmap) {
//     let charConfig = iconDefaultcfg.charmap[i];
//     const glyph = fs.createReadStream('public' + charConfig.file);

//     const basename = path.basename(charConfig.file);
//     const matches = basename.match(/^(?:((?:u[0-9a-f]{4,6},?)+)-)?(.+)\.svg$/i);
//     let unicode = String.fromCodePoint(startUicode);
//     iconDefaultcfg.charmap[i] = {
//       cssCode: `${UTIL.encodeUnicode(unicode)}`,
//       name: matches[2].split('-')[0]
//     }
//     startUicode++;

//     glyph.metadata = {
//       unicode: [unicode],
//       name: matches[2].split('-')[0]
//     };
//     fontStream.write(glyph);
//   }
//   fontStream.end();
// };

/**
 * 生成TTF文件
 * @Author   Warrenyang
 * @DateTime 2018-10-16
 * @version  [version]
 * @param    {String}   svgFile   svg文件路径
 * @param    {String}   outputDir 输出路径
 * @param    {Function} done      完成函数
 */
const createTtf = (svgFile, outputDir, done) => {
  const svgMetadata = fs.readFileSync(svgFile, 'utf-8');
  const ttf = new Buffer(svg2ttf(svgMetadata).buffer);
  const ttfFile = path.resolve(outputDir + '/fonts/', `${iconDefaultcfg.fontfileName}.ttf`);
  fs.writeFile(ttfFile, ttf, function(err) {
    if (err) {
      return done(err);
    }
    createEot(svgMetadata, ttfFile, outputDir, done);
  });
};

/**
 * 生成EOT文件
 * @Author   Warrenyang
 * @DateTime 2018-10-16
 * @param    {String}   svgMetadata SVG数据
 * @param    {String}   ttfFile     ttf文件路径
 * @param    {String}   outputDir   输出路径
 * @param    {Function} done        完成函数
 */
const createEot = (svgMetadata, ttfFile, outputDir, done) => {
  const eot = new Buffer(ttf2eot(svg2ttf(svgMetadata).buffer).buffer);
  const eotFile = path.resolve(outputDir + '/fonts/', `${iconDefaultcfg.fontfileName}.eot`);
  fs.writeFile(eotFile, eot, function(err) {
    if (err) {
      return done(err);
    }
    createWoff(ttfFile, outputDir, done);
  });
}

/**
 * 生成Woff文件
 * @Author   Warrenyang
 * @DateTime 2018-10-16
 * @version  [version]
 * @param    {String}   ttfFile   ttf文件路径
 * @param    {String}   outputDir 输出路径
 * @param    {Function} done      完成函数
 */
const createWoff = (ttfFile, outputDir, done) => {
  const newttfFile = new Uint8Array(fs.readFileSync(ttfFile));
  const woffBuffer = new Buffer(ttf2woff(newttfFile).buffer);
  const woffFile = path.resolve(outputDir + '/fonts/', `${iconDefaultcfg.fontfileName}.woff`);
  fs.writeFile(woffFile, woffBuffer, function(err) {
    if (err) {
      return done(err);
    }
    createWoff2(ttfFile, outputDir, done);
  });
}

/**
 * 生成Woff2文件
 * @Author   Warrenyang
 * @DateTime 2018-10-16
 * @version  [version]
 * @param    {String}   ttfFile    ttf文件路径
 * @param    {String}   outputDir 输出路径
 * @param    {Function} done      完成函数
 */
const createWoff2 = (ttfFile, outputDir, done) => {
  const woff2 = ttf2woff2(fs.readFileSync(ttfFile));
  const woff2File = path.resolve(outputDir + '/fonts/', `${iconDefaultcfg.fontfileName}.woff2`);
  fs.writeFile(woff2File, woff2, function(err) {
    if (err) {
      return done(err);
    }
    createDemoCss(outputDir, done);
  });
}

/**
 * 生成CSS文件
 * @Author   Warrenyang
 * @DateTime 2018-10-16
 * @version  [version]
 * @param    {String}   outputDir 输出路径
 * @param    {Function} done      完成函数
 */
const createDemoCss = (outputDir, done) => {
  const CSS_TEMPLATE_FILE = './template/css.tpl';
  const cssConfig = {
    fontfileName: iconDefaultcfg.fontfileName,
    charmap: iconDefaultcfg.charmap,
  }
  fs.readFile(path.join(__dirname, CSS_TEMPLATE_FILE), 'utf-8', (err, template) => {
    if (err) {
      return done(err);
    }
    const cssTmp = _.template(template, cssConfig);
    const cssFile = path.resolve(outputDir, 'styles.css');
    fs.writeFile(cssFile, cssTmp, function(err) {
      if (err) {
        return done(err);
      }
      createDemoHtml(cssTmp, outputDir, done);
    });
  });
}

/**
 * 生成HTML文件
 * @Author   Warrenyang
 * @DateTime 2018-10-16
 * @version  [version]
 * @param    {String}   cssTmp    css样式内容
 * @param    {String}   outputDir 输出路径
 * @param    {Function} done      完成函数
 */
const createDemoHtml = (cssTmp, outputDir, done) => {
  const DEMO_TEMPLATE_FILE = './template/demo.tpl';
  const demoConfig = {
    fontfileName: iconDefaultcfg.fontfileName,
    cssStyle: cssTmp,
    charmap: iconDefaultcfg.charmap
  }
  const htmlFile = path.resolve(outputDir, 'demo.html');
  fs.readFile(path.join(__dirname, DEMO_TEMPLATE_FILE), 'utf-8', (err, template) => {
    if (err) {
      return done(err);
    }
    const tmp = _.template(template, demoConfig);
    fs.writeFile(htmlFile, tmp, function(err) {
      if (err) {
        return done(err);
      }
      createDemoZip(outputDir, done);
    });
  });
}

/**
 * 创建所有字体文件的压缩包
 * @Author   Warrenyang
 * @DateTime 2018-10-16
 * @param    {String}   outputDir 输出路径
 * @param    {Function} done      完成函数
 */
const createDemoZip = (outputDir, done) => {
  const zipDir = `${iconfontName}_${UTIL.UUID()}`;
  const dayFlag = UTIL.format(new Date(), 'yyyyMMdd');
  const zipFullDir = `${downloadDir}/${dayFlag}/${zipDir}`;
  fs.mkdirSync(zipFullDir);
  const zipFile = `${zipFullDir}/${iconfontName}.zip`;
  const list = [{
    name: `${zipDir}/demo.html`,
    path: `${outputDir}/demo.html`
  }, {
    name: `${zipDir}/styles.css`,
    path: `${outputDir}/styles.css`
  }, {
    name: `${zipDir}/fonts/${iconfontName}.svg`,
    path: `${outputDir}/fonts/${iconfontName}.svg`
  }, {
    name: `${zipDir}/fonts/${iconfontName}.ttf`,
    path: `${outputDir}/fonts/${iconfontName}.ttf`
  }, {
    name: `${zipDir}/fonts/${iconfontName}.eot`,
    path: `${outputDir}/fonts/${iconfontName}.eot`
  }, {
    name: `${zipDir}/fonts/${iconfontName}.woff`,
    path: `${outputDir}/fonts/${iconfontName}.woff`
  }, {
    name: `${zipDir}/fonts/${iconfontName}.woff2`,
    path: `${outputDir}/fonts/${iconfontName}.woff2`
  }];

  let zip = new jsZip();
  for (let i in list) {
    try {
      let content = fs.readFileSync(list[i].path);
      zip.file(list[i].name, content);
    } catch (err) {
      return done(err);
    }
  }

  zip.generateAsync({
    type: 'nodebuffer'
  }).then(function(content) {
    fs.writeFile(zipFile, content, function(err) {
      if (err) {
        return done(err);
      }
      UTIL.deleteFolder(outputDir);
      return done(null, `/fonts/${dayFlag}/${zipDir}/${iconfontName}.zip`);
    });
  });
}

/**
 * 生成字体的main函数
 * @Author   Warrenyang
 * @DateTime 2018-10-16
 * @param    {Array}    options      配置项 包含文件列表，字体名称，导出路径等
 * @param    {Function} done         完成函数
 */
const generateFont = (options, done) => {

  let {
    files,
    fontName = 'wiifont',
    outPath
  } = options;

  // 判断上传文件临时存放文件夹是否存在，不存在则创建此文件夹
  downloadDir = outPath || path.join(__dirname, `../../public/download`);
  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir);
  }

  iconfontName = fontName;
  iconDefaultcfg.fontfileName = fontName;

  newDownloadDir = `${iconfontName}_${UTIL.UUID()}`;
  const dayFlag = UTIL.format(new Date(), 'yyyyMMdd');
  const dayDownLoadDir = `${downloadDir}/${dayFlag}`;
  if (!fs.existsSync(dayDownLoadDir)) {
    UTIL.deleteFolder(downloadDir);
    fs.mkdirSync(downloadDir);
    fs.mkdirSync(dayDownLoadDir);
  }
  const outputDir = `${dayDownLoadDir}/${newDownloadDir}`;

  fs.mkdirSync(outputDir);

  if (!fs.existsSync(outputDir + '/fonts/')) {
    fs.mkdirSync(outputDir + '/fonts/');
  }

  const list = files;
  iconDefaultcfg.charmap = [];
  ScanList(list);

  const file = path.resolve(outputDir + '/fonts/', `${iconDefaultcfg.fontfileName}.svg`);
  fontStream = new SVGIcons2SVGFontStream({
    fontName: iconDefaultcfg.fontfileName,
    normalize: true
  })

  /*
  监听写入svg
   */
  fontStream.pipe(fs.createWriteStream(file))
    .on('finish', function() { // 写入成功
      console.log('Font successfully created!', path.resolve(outputDir, `${iconDefaultcfg.fontfileName}.svg`));
      // console.log(fs.readFileSync(file, 'utf8'))
      createTtf(file, outputDir, done);
    })
    .on('error', function(err) { // 写入失败
      console.log('fontStream err', err);
    });

  // createSvg(iconDefaultcfg);

  // 开始压缩svg
  optimizeSvg(iconDefaultcfg);
};

exports.generateFont = generateFont;