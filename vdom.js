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
    children: [txt],
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

function mount(vnode, container, node) {
  let { nodeType } = vnode
  if (nodeType === NODE_TYPE.HTML) {
    renderHtmlNode(vnode, container, node)
  } else {
    renderTextNode(vnode.children[0], container, node)
  }
}

function renderTextNode(txt, container) {
  //let textNode = document.createTextNode(txt)
  //container.appendChild(textNode)
  container.innerText = txt
}

function renderHtmlNode (vnode, container, refNode) {
  let { tag, children } = vnode
  let node = document.createElement(tag)
  if (vnode.data) {
    Object.keys(vnode.data).forEach(item => {
      updateAttr(vnode.data[item], null, item, node)
    })
  }
  vnode.el = node
  if (vnode.childrenType !== CHILDREN_TYPE.EMPTY) {
    for (let i = 0;  i < children.length; i++) {
      let { nodeType } = children[i]
      if (nodeType === NODE_TYPE.TEXT) {
        renderTextNode(children[i].children[0], node)
      } else {
        renderHtmlNode(children[i], node)
      }
    }
  }
  refNode ? container.insertBefore(node, refNode) : container.appendChild(node)
}

function patch (oldNode, newNode, container) {
  if (oldNode == newNode) {
    return
  }
  if (newNode.nodeType !== oldNode.nodeType) {
    replaceNode(newNode, oldNode, container)
  }else if (newNode.nodeType === NODE_TYPE.TEXT) {
    patchText(newNode, oldNode, container)
  } else {
    patchElement(newNode, oldNode, container)
  }
}

function replaceNode(newNode, oldNode, el) {
  el.removeChild(oldNode.el)
  mount(newNode, el)
}

function patchText(newNode, oldNode, el) {
  if (newNode.children[0] !== oldNode.children[0]) {
    renderTextNode(newNode.children[0], el)
  }
}

function patchElement(newNode, oldNode, el) {
  if (newNode.tag !== oldNode.tag) {
    replaceNode(newNode, oldNode, el)
    return
  }
  patchData(newNode.data, oldNode.data, el)
  patchChildren(newNode.children, oldNode.children, oldNode.el)
}

function patchData(newData, oldData, container) {
  newData && Object.keys(newData).forEach(item => {
    let [newAttr, oldAttr] = [newData[item], oldData ? oldData[item] : null]
    if (newAttr !== oldAttr) {
      updateAttr(newAttr, oldAttr, item, container)
    }
  })
  oldData && Object.keys(oldData).forEach(item => {
    if (oldData[item] && !newData[item]) {
      updateAttr(null, oldData[item], item, container)
    }
  })
}

function updateAttr(newAttr, oldAttr, key, container) {
  if (key === 'class') {
    container.className = newAttr || ''
  } else if (key === 'style') {
    if (newAttr) {
      Object.keys(newAttr).forEach(item => {
        if (!oldAttr || newAttr[item] !== oldAttr[item]) {
          container.style[item] = newAttr[item]
        }
      })
      oldAttr && Object.keys(oldAttr).forEach(item => {
        if (!newAttr[item]) {
          container.style[item] = ''
        }
      })
    } else {
      container.style.cssText = ''
    }
  } else if (key.startsWith('@')) {
    container.removeEventListener(key.slice(1), oldAttr)
    if (newAttr) {
      container.addEventListener(key.slice(1), newAttr)
    }
  } else {
    if (newAttr) {
      container.setAttribute(key, newAttr)
    } else {
      container.removeAttribute(key)
    }
  }
}

function patchChildren (newChildren, oldChildren, el) {
  let index = 0
  // 123 old
  // 213
  for (let i = 0; i < newChildren.length; i++) {
    let node = newChildren[i]
    let oldNodeIndex = oldChildren.findIndex(item => item.key === node.key)
    if (oldNodeIndex >= 0) { // 存在节点 更新节点
      if (node.tag === oldChildren[oldNodeIndex].tag) {
        node.el = oldChildren[oldNodeIndex].el
        if (oldNodeIndex < index) { // 挪动节点
          const refNode = newChildren[i - 1].el.nextSibling
          el.insertBefore(oldChildren[oldNodeIndex].el, refNode)
        }
        index = oldNodeIndex
      } else {
        replaceNode(node, oldChildren[oldNodeIndex] ,el)
      }
      patch(oldChildren[oldNodeIndex], node, oldChildren[oldNodeIndex].el || el)
    } else { // 新增节点
      const refNode = i - 1 < 0 ? oldChildren[0].el : newChildren[i - 1].el.nextSibling
      mount(node, el, refNode)
    }
  }
  for(let i = 0; i < oldChildren.length; i++) { // 旧节点有 新节点没有
    let oldNode = oldChildren[i]
    let has = newChildren.find(item => item.key === oldNode.key) 
    if (!has) {
      el.removeChild(oldNode.el)
    }
  }
}