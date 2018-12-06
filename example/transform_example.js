const ConfigPool = require('../lib/ConfigPool')
const fs = require('fs')
const path = require('path')

const filename = 'babel.config.js'
const context = path.join(__dirname, 'config_path')
const content = fs.readFileSync(path.join(context,filename),'utf-8')

//创建文件映射
let fileData = {}
fileData[filename] = content

// babel配置文件实例化
const babelConfig = new ConfigPool({
  js: ['babel.config.js'],
  json: ['.babelrc']
})

// 想要写入babel配置文件的信息
const updateBabelObj = {
  presets: ["latest-minimal"]
}

const res = babelConfig.transform(updateBabelObj,context,fileData)

console.log('filename:',res.filename)
console.log('\ncontent:')
console.log(res.content)
fs.writeF