const j = require('jscodeshift')
const stringify = require('javascript-stringify')
const assert = require('assert')

const alter = function (source, updateObj) {

  // 析: 解析需要修改的源码
  const root = j(source)

  // 提取需要删除的键，测试中会返回['output']
  function extractDeleteKeys(obj) {
    return Object.keys(obj).map(k => {
      if (!updateObj[k]) {
        return k
      }
    })
  }

  const deleteKeys = extractDeleteKeys(updateObj)

  // 析：解析输入的文件成源码
  const updateStr = `(${stringify(updateObj, null, 2)})`

  const update = j(updateStr)

  // 找： 找到符合 module.exports= {...} 格式的注入点的Collection对象
  const alterPoint = root.find(j.AssignmentExpression, node => {
    return node.left.type === "MemberExpression" &&
      node.left.object.name === "module" &&
      node.left.property.name === "exports"
  })

  assert(alterPoint.size() === 1, '错误！找到了多个module.exports引用点')

  // 找： 使用get()，得到第一个Path对象（因为每个文件中只有一个module.exports，所以无需遍历）
  const alterPointPath = alterPoint.get()

  // 找： alterPointPath.value即为需要进行修改的AST node对象
  const node = alterPointPath.value

  let sourceProps
  // 区别module.export直接引用配置对象和分离引用配置对象
  if (node.right.type === "ObjectExpression") {

    // 找： 找到源码的properties键值对数组
    sourceProps = node.right.properties
  } else if (node.right.type === "Identifier") {
    // 找： 找到链接到的名称，测试代码中的 config
    const exportsIdentifier = node.right.name

    // 找： 在全局找config = {...}形式
    const alterPoint2 = root.find(j.VariableDeclarator, node => {
      return node.id.name === exportsIdentifier &&
        node.init.type === 'ObjectExpression'
    })

    assert(alterPoint2.size() === 1, '错误，module.exports仅能对应一个配置对象！')

    const alterPointPath = alterPoint2.get()

    const alterPointNode = alterPointPath.value

    sourceProps = alterPointNode.init.properties
  } else {
    throw new Error('错误，module.exports的不是引用的配置对象！')
  }

  // 找:  同理，找到updateObj对应的properties
  const updateProps = update.find(j.ObjectExpression).get().value.properties

  /**
   做、升：
   遍历updateProps，如果其中的key在sourceProps上能找到，则更新到updateProps上去，如果
   **/
  propReplace(sourceProps, updateProps)

  function propReplace(sProps, nProps) {
    for (const prop of nProps) {
      const exist = sProps.findIndex(p => {
        return !p.computed && p.key.name === prop.key.name
      })

      if (exist > -1) {
        sProps[exist].value = prop.value
      } else {
        sProps.push(prop)
      }
    }

    // 删除的在deleteObjects中出现的Props
    delProp(sProps)

    function delProp(s){
      const del = s.findIndex(p=> deleteKeys.includes(p.key.name))
      if (del > -1){
        s.splice(del, 1)
        delProp(s)
      }
    }
  }

  return root.toSource()
}

module.exports = alter