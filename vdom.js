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
    children = createTextNode(children + '')
  }
  return {
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

  } else {
    mount(vnode, container)
  }
  container.vnode = vnode
}

function mount(vnode, container) {
  let { nodeType } = vnode
  if (nodeType === NODE_TYPE.HTML) {

  } else if (nodeType === NODE_TYPE.TEXT) {
    renderTextNode(vnode, container)
  }
}

function renderTextNode(vnode, container) {
  let textNode = document.createTextNode()
  container.appendChild(textNode)
}