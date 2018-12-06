const merge = require('deepmerge')
const alterJSConfig = require('./alterJSConfig')
const stringifyJS = require('javascript-stringify')
const read = require('./readJSConfig')

const mergeArrayWithDedupe = (a, b) => Array.from(new Set([...a, ...b]))
const mergeOptions = {
  arrayMerge: mergeArrayWithDedupe
}

const isObject = val => val && typeof val === 'object'


const transformJS = {
  parse: ({ filename, context }) => {
    try {
      return read(filename,context)
    } catch (e) {
      return null
    }
  },
  toSource: ({ updateObj, existObj, source }) => {
    if (existObj) {
      // We merge only the modified keys
      const changedData = {}
      Object.keys(updateObj).forEach(key => {
        const originalValue = existObj[key]
        const newValue = updateObj[key]
        if (Array.isArray(originalValue) && Array.isArray(newValue)) {
          changedData[key] = mergeArrayWithDedupe(originalValue, newValue)
        } else if (isObject(originalValue) && isObject(newValue)) {
          changedData[key] = merge(originalValue, newValue, mergeOptions)
        } else {
          changedData[key] = newValue
        }
      })
      return alterJSConfig(source, changedData)
    } else {
      return `module.exports = ${stringifyJS(updateObj, null, 2)}`
    }
  }
}


const transformJSON = {
  parse: ({source}) => JSON.parse(source),
  toSource: ({updateObj,existObj}) => {
    return JSON.stringify(merge(existObj,updateObj,mergeOptions),null,2)
  }
}

const transformYAML = {
  parse: ({ source }) => require('js-yaml').safeLoad(source),
  toSource: ({ updateObj, existObj }) => {
    return require('js-yaml').safeDump(merge(existObj, updateObj, mergeOptions), {
      skipInvalid: true
    })
  }
}


const transformLines = {
  parse: ({ source }) => source.split('\n'),
  toSource: ({ updateObj, existObj }) => {
    if (existObj) {
      updateObj = existObj.concat(updateObj)
      // Dedupe
      updateObj = updateObj.filter((item, index) => updateObj.indexOf(item) === index)
    }
    return updateObj.join('\n')
  }
}



module.exports = {
  json: transformJSON,
  js: transformJS,
  yaml: transformYAML,
  lines: transformLines
}