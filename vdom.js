const NODE_TYPE = {
  HTML: 'HTML',
  TEXT: 'TEXT'
}

const CHILDREN_TYPE = {
  EMPTY: 'EMPTY',
  SINGLE: 'SINGLE',
  MULTIPLE: 'MULTIPLE'
}

function createElement (tag, data, children) {
  let [nodeType, childrenType] = [NODE_TYPE.TEXT, CHILDREN_TYPE.EMPTY]
  if (typeof tag === 'string') {
    nodeType = NODE_TYPE.HTML
  }
  if (Array.isArray(children)) {
    if (children.length === 1) {
      childrenType = CHILDREN_TYPE.SINGLE
    } else {
      childrenType = CHILDREN_TYPE.MULTIPLE
    }
  } else if (children === null) {
    childrenType = CHILDREN_TYPE.EMPTY
  } else {
    childrenType = CHILDREN_TYPE.SINGLE
    children = [createTextNode(children + '')]
  }
  return {
    tag,
    children,
    nodeType,
    data,
    childrenType,
    key: data && data.key,
    el: null
  }
}

function createTextNode (txt) {
  return {
    nodeType: NODE_TYPE.TEXT,
    tag: null,
    data: null,
    children: txt,
    childrenType: CHILDREN_TYPE.EMPTY
  }
}

function render(vnode, container) {
  const preNode = container.vnode
  if (preNode) {
    patch(preNode, vnode, container)
  } else {
    mount(vnode, container)
  }
  container.vnode = vnode
}

function mount(vnode, container) {
  let { nodeType } = vnode
  if (nodeType === NODE_TYPE.HTML) {
    renderHtmlNode(vnode, container)
  } else {
    renderTextNode(vnode.children, container)
  }
}

function renderTextNode(txt, container) {
  let textNode = document.createTextNode(txt)
  container.appendChild(textNode)
}

function renderHtmlNode (vnode, container) {
  let { tag, children } = vnode
  let node = document.createElement(tag)
  vnode.data && bindAttr(node, vnode.data)
  vnode.el = node
  if (vnode.childrenType !== CHILDREN_TYPE.EMPTY) {
    for (let i = 0;  i < children.length; i++) {
      let { nodeType } = children[i]
      if (nodeType === NODE_TYPE.TEXT) {
        renderTextNode(children[i].children, node)
      } else {
        renderHtmlNode(children[i], node)
      }
    }
  }
  container.appendChild(node)
}

function bindAttr (node, data) {
  Object.keys(data).forEach(item => {
    if (item === 'class') {
      node.className += data[item]
    } else if (item === 'style') {
      let keys =Object.keys(data[item])
      let str = ''
      for (let i = 0; i < keys.length; i++) {
        str += `${keys[i]}: ${data[item][keys[i]]}; `
      }
      node.style.cssText += str
    } else if (item.startsWith('@')) {
      node.addEventListener(item.slice(1), data[item])
    } else {
      node.setAttribute(item, data[item])
    }
  })
}

function patch (oldNode, newNode, container) {
  
}