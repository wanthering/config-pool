const transforms = require('./transformsAPI')


class configPool {
  constructor(configMapping) {
    this.configMapping = configMapping
  }

  /**
   *
   * @param updateObj 用于更新配置文件的对象
   * @param context 配置文件存放的目录
   * @param fileData 文件对象,key为文件名，内容为文件读取到的内容。
   * 在context目录下设定一个config文件
   */
  transform(updateObj, context, fileData) {

    // 如果fileData存在，查找fileData中是否存在文件名，不存在则返回default文件名和类型
    let file
    if (fileData && fileData instanceof Object) {
      file = this.getExist(fileData)
    }
    if (!file) {
      file = this.getDefault()
    }
    const { type, filename } = file

    // 对应于type选择解析器
    const transform = transforms[type]
    let source
    let existObj

    // 如果fileData存在，则优先查找fileData中配置文件的源码
    if (fileData && fileData instanceof Object) {
      source = fileData[filename]

      if (source) {
        existObj = transform.parse({
          source,
          filename,
          context
        })
      }
    }

    // 获取修改后的源码
    const content = transform.toSource({
      source,
      updateObj,
      filename,
      context,
      existObj
    })

    return {filename,content}
  }

  /**
   * 函数功能： 获取省缺配置文件
   * 函数目的： 当fileData上没有配置文件时，可以用省缺文件补位
   * @returns
   *    - type 省缺文件类型
   *    - filename 省缺文件名
   */
  getDefault() {
    const [type] = Object.keys(this.configMapping)
    const [filename] = this.configMapping[type]
    return { type, filename }
  }

  /**
   * 函数功能： 获取fileData上存在的配置文件
   * 函数目的： 当fileData上存在配置文件时，返回它的文件名和类型
   * @param fileData
   * @returns
   *    - type 省缺文件类型
   *    - filename 省缺文件名
   */
  getExist(fileData) {
    for (const type of Object.keys(this.configMapping)) {
      const filenames = this.configMapping[type]
      for (const filename of filenames) {
        if (fileData[filename]) {
          return { type, filename }
        }
      }
    }
  }
}

module.exports = configPool