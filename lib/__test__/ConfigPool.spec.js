const ConfigPool = require('../ConfigPool')
const fs = require('fs-extra')
const globby = require('globby')
const path = require('path')
const stringifyJS = require('javascript-stringify')

// 准备文件=========================
const context = path.join(__dirname, './test_config_pool')

// 准备js源文件文本
const babelContent = `module.exports = {
    presets: ['env']
}`

//准备json源文件文本
const eslintContent = `{
    "rules": {
        "semi": 2
    }
}`
//准备yml源文件文本
const postcssContent = `parser: sugarss
map: false
plugins:
  postcss-plugin: {}`

//准备行代码文本
const browserslistContent = `last 1 version
> 1%
maintained node versions
not dead`
// 在单元测试开始前生成文件
fs.ensureDirSync(context)
fs.writeFileSync(path.join(context, 'babel.config.js'), babelContent)
fs.writeFileSync(path.join(context, '.eslintrc'), eslintContent)
fs.writeFileSync(path.join(context, '.postcssrc.yml'), postcssContent)
fs.writeFileSync(path.join(context, '.browserslistrc'), browserslistContent)

// 生成fileData对象
const filenames = globby.sync('*', { cwd: context, dot: true });
let fileData = {}
for (let filename of filenames) {
  fileData[filename] = fs.readFileSync(path.join(context, filename), 'utf-8')
}

// 文件准备工作完成==============

afterAll(() => {
  fs.removeSync(context)
})

describe('ConfigPool类', () => {
  // 在单元测试结束后移除文件


  const babelConfig = new ConfigPool({
    js: ['babel.config.js'],
    json: ['.babelrc']
  })

  const eslintConfig = new ConfigPool({
    js: ['.eslintrc.js'],
    json: ['.eslintrc', '.eslintrc.json'],
    yaml: ['.eslintrc.yaml', '.eslintrc.yml']
  })

  const postcssConfig = new ConfigPool({
    js: ['.postcssrc.js'],
    json: ['.postcssrc.json', '.postcssrc'],
    yaml: ['.postcssrc.yaml', '.postcssrc.yml']
  })

  const browserslistConfig = new ConfigPool({
    lines: ['.browserslistrc']
  })


  it('寻找到省缺的配置文件名', () => {
    expect(babelConfig.getDefault()).toMatchObject({ filename: 'babel.config.js', type: "js" })
    expect(eslintConfig.getDefault()).toMatchObject({ filename: ".eslintrc.js", type: "js" })
    expect(postcssConfig.getDefault()).toMatchObject({ filename: ".postcssrc.js", type: "js" })
    expect(browserslistConfig.getDefault()).toMatchObject({ filename: ".browserslistrc", type: "lines" })
  })

  it('寻找到fileData上已存在的配置文件名', () => {
    expect(babelConfig.getExist(fileData)).toMatchObject({ filename: "babel.config.js", type: "js" })
    expect(eslintConfig.getExist(fileData)).toMatchObject({ filename: ".eslintrc", type: "json" })
    expect(postcssConfig.getExist(fileData)).toMatchObject({ filename: ".postcssrc.yml", type: "yaml" })
    expect(browserslistConfig.getExist(fileData)).toMatchObject({ filename: ".browserslistrc", type: "lines" })
  })

  const updateBabelObj = {
    presets: ["latest-minimal"]
  }

  const updateEslintObj = {
    rules: {
      quotes: 2
    }
  }

  const updatePostcssObj = {
    plugins: {
      autoprefixer: {
        grid: true
      }
    }
  }

  const updateBrowserlistObj = [
    "> 1%",
    "last 2 versions"
  ]


  describe('如果没有fileData传入，则创建默认文件并返回文件信息', () => {

    it('创建babel默认文件', () => {
      const res = babelConfig.transform(updateBabelObj, context)
      expect(res.filename).toEqual('babel.config.js')
      expect(res.content).toEqual(
        `module.exports = ${stringifyJS(updateBabelObj, null, 2)}`
      )
    })

    it('创建eslint默认文件', () => {
      const res = eslintConfig.transform(updateEslintObj, context)
      expect(res.filename).toEqual('.eslintrc.js')
      expect(res.content).toEqual(
        `module.exports = ${stringifyJS(updateEslintObj, null, 2)}`
      )
    })

    it('创建postcss默认文件', () => {
      const res = postcssConfig.transform(updatePostcssObj, context)
      expect(res.filename).toEqual('.postcssrc.js')
      expect(res.content).toEqual(
        `module.exports = ${stringifyJS(updatePostcssObj, null, 2)}`
      )
    })

    it('创建browserslist默认文件', () => {
      const res = browserslistConfig.transform(updateBrowserlistObj, context)
      expect(res.filename).toEqual('.browserslistrc')
      expect(res.content).toEqual(
        updateBrowserlistObj.join('\n')
      )
    })

  })

  describe('如果有fileData传入，则返回与更新配置合并后的文件信息', () => {

    it('更新babel配置文件，测试是否数组合并正常', () => {
      const res = babelConfig.transform(updateBabelObj, context, fileData)
      expect(res.filename).toEqual('babel.config.js')
      expect(res.content).toEqual(`module.exports = {
    presets: [
      'env',
      'latest-minimal'
    ]
}`
      )
    })

    it('更新eslint配置文件，测试对象合并是否正常', () => {
      const res = eslintConfig.transform(updateEslintObj, context, fileData)
      expect(res.filename).toEqual('.eslintrc')
      expect(res.content).toEqual(
        `{
  "rules": {
    "semi": 2,
    "quotes": 2
  }
}`
      )
    })

    it('更新yaml配置文件', () => {
      const res = postcssConfig.transform(updatePostcssObj, context, fileData)
      expect(res.filename).toEqual('.postcssrc.yml')
      expect(res.content).toEqual(
        `parser: sugarss
map: false
plugins:
  postcss-plugin: {}
  autoprefixer:
    grid: true
`
      )
    })


    it('更新lines配置文件', () => {
      const res = browserslistConfig.transform(updateBrowserlistObj, context, fileData)
      expect(res.filename).toEqual('.browserslistrc')
      expect(res.content).toEqual(
        `last 1 version
> 1%
maintained node versions
not dead
last 2 versions`
      )
    })
  })

})
