const read = require('../readJSConfig')
const path = require('path')
const fs = require('fs-extra')

const filename = 'babel.config.js'
const context = path.join(__dirname,'/test_read_js_config')
const filePath = path.join(context,filename)
const wrongPath = path.join(context,'not_exist',filename)

const babelContent = `module.exports = {
    presets: 'env'
}`

fs.ensureDirSync(context)
fs.writeFileSync(filePath,babelContent)

afterAll(()=>{
    fs.removeSync(context)
})

test('读取正常写入文件',()=>{
  expect(read(filename,context)).toMatchObject({
    presets: 'env'
  })
})

test('读取错误文件不报错',()=>{
  expect(read(filename,wrongPath)).toBeUndefined()
})
