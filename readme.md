# ConfigPool
读写配置文件的类
---
## 安装
```
npm i config-pool -S
```

## 使用
### 创建新的配置文件
```
const ConfigPool = require('config-pool')

// 创建eslint配置的配置文件池
const eslintConfig = new ConfigPool({
js: ['.eslintrc.js'],
json: ['.eslintrc', '.eslintrc.json'],
yaml: ['.eslintrc.yaml', '.eslintrc.yml']
})

// 需要写入的文件信息
  const eslintObj = {
    rules: {
      quotes: 2
    }
  }


// 输出.eslintrc.js文件名和内容
const {filename, content} = eslintConfig.transform(eslintObj)
```

即可得到一个配置文件名和内容
```
console.log(filename)
// 输出.eslintrc.js

console.log(content)
/**
*  module.export = {
*    rules:{
*      quotes: 2
*    }
*  }
**/
```

## 对已存在的配置文件进行改写：
假如目录已有配置文件 babel.config.js ，文件所在路径为config_path/下

配置文件内容为
```
module.exports = {
  presets: ['env']
}
```
现在新输入一个对象，想合并到babel.config.js上
```
const updateBabelObj = {
  presets: ["latest-minimal"]
}
```
可以通过以下操作实现
```
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
```

如果你想改写掉babel.config.js，只需要使用`fs.writeFile`覆盖原文件即可。