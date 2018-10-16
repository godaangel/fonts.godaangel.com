var fs = require('fs');

class File {
  static saveFile(filePath, fileData) { 
    return new Promise((resolve, reject) => {
      const wstream = fs.createWriteStream(filePath);  
      console.log(filePath) 
      wstream.on('open', () => {   
        const blockSize = 128;   
        const nbBlocks = Math.ceil(fileData.length / (blockSize));   
        for (let i = 0; i < nbBlocks; i += 1) {    
          const currentBlock = fileData.slice(     blockSize * i,      Math.min(blockSize * (i + 1), fileData.length),     );    
          wstream.write(currentBlock);   
        }    
        wstream.end();  
      });  
      wstream.on('error', (err) => {
        reject(err);
      });  
      wstream.on('finish', () => {
        resolve(true);
      }); 
    });
  }
}

module.exports = File;