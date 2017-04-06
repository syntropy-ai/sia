const pngjs = require('pngjs')

const PNG = pngjs.PNG

module.exports.loadPNG = buffer => new Promise((resolve, reject) => {
  const png = new PNG()
  png.parse(buffer, (err, imgData) => err ? reject(err) : resolve(imgData))
})
