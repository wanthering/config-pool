/**
 *
 * @param filename 文件名
 * @param context 文件路径
 * @returns 配置文件解析后的对象
 */
module.exports = function(filename,context){
  let resolvedPath
  try{
    resolvedPath = require.resolve(filename,{
      paths: [context]
    })
  }catch (e) {}

  if(resolvedPath){
    return require(resolvedPath)
  }
}
