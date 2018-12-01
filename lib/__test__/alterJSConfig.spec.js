const alter = require('../alterJSConfig')

describe('直接引用：module.exports直接定义为配置对象', () => {

  const source =
    `const path = require('path');

module.exports = {
  entry: 'entry/file.js',
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'output.bundle.js'
  }
};`

  it('增加一项配置', () => {
    const updateObj = {
      mode: 'production'
    }

    expect(alter(source, updateObj)).toEqual(
      `const path = require('path');

module.exports = {
  entry: 'entry/file.js',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'output.bundle.js'
  },

  mode: 'production'
};`
    )
  })


  it('更改一项配置', () => {
    const updateObj = {
      output: {
        filename: 'webpack.bundle.js'
      }
    }
    expect(alter(source, updateObj)).toEqual(
      `const path = require('path');

module.exports = {
  entry: 'entry/file.js',
  
  output: {
    filename: 'webpack.bundle.js'
  }
};`
    )
  })


  it('删除一项配置', () => {
    const updateObj = {
      output: null
    }
    expect(alter(source, updateObj)).toEqual(
      `const path = require('path');

module.exports = {
  entry: 'entry/file.js'
};`
    )
  })

})


describe('分离引用：module.exports引用定义好的配置对象', () => {
  it('以修改配置作为示范', () => {

    const source =
      `const path = require('path');

const config = {
  entry: 'entry/file.js',
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'output.bundle.js'
  }
};

module.exports = config;`

    const updateObj = {
      output: {
        filename: 'webpack.bundle.js'
      }
    }

    expect(alter(source, updateObj)).toEqual(
      `const path = require('path');

const config = {
  entry: 'entry/file.js',
  
  output: {
    filename: 'webpack.bundle.js'
  }
};

module.exports = config;`
    )
  })

})