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

function mount(vnode, container) {
  let { nodeType } = vnode
  if (nodeType === NODE_TYPE.HTML) {
    renderHtmlNode(vnode, container)
  } else {
    renderTextNode(vnode.children[0], container)
  }
}

function renderTextNode(txt, container) {
  let textNode = document.createTextNode(txt)
  container.appendChild(textNode)
}

function renderHtmlNode (vnode, container) {
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
  container.appendChild(node)
}

function patch (oldNode, newNode, container) {
  if (oldNode == newNode) {
    return
  }
  const el = newNode.el = oldNode.el
  patchData(newNode.data, oldNode.data, el)
  if (newNode.nodeType === NODE_TYPE.TEXT) {
    if (newNode.children[0] !== oldNode.children[0]) {
      renderTextNode(newNode.children[0], container)
    }
  } else {
    const [oldCh, ch] = [oldNode.children, newNode.children]
    if (oldCh && ch) {
      patchChildren(oldNode.childrenType, newNode.childrenType ,oldCh, ch, el)
    } else if (oldCh) {
      for (let i = 0; i <nodes.length; i++) {
        container.removeChild(nodes[i].el)
      }
    } else if (ch) {
      for (let i =0; i <nodes.length; i++) {
        renderHtmlNode(nodes[i], container)
      }
    }
  }
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
      oldAttr && Object.keys[oldAttr].forEach(item => {
        if (!newAttr[item]) {
          container.style[item] = ''
        }
      })
    } else {
      container.style.cssText = ''
    }
  } else if (key.startsWith('@')) {
    if (newAttr) {
      container.addEventListener(key.slice(1), newAttr)
    } else {
      container.removeEventListener(key.slice(1), oldAttr)
    }
  } else {
    if (newAttr) {
      container.setAttribute(key, newAttr)
    } else {
      container.removeAttribute(key)
    }
  }
}

function patchChildren (oldChildrenType, newChildrenType, oldChildren, newChildren, el) {
  
}