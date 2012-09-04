;(function (html) {

  function insertNode(parent, node) {
    let insertbefore, insertafter;

    if (node.hasAttribute("insertbefore")) {
      insertbefore = node.getAttribute("insertbefore");
      node.removeAttribute("insertbefore");
    }

    if (node.hasAttribute("insertafter")) {
      insertafter = node.getAttribute("insertafter");
      node.removeAttribute("insertafter");
    }

    if (insertbefore) {
      let reference = parent.querySelector(insertbefore);

      if (reference && reference.parentNode)
        parent = reference.parentNode;

      parent.insertBefore(node, reference);
    } else if (insertafter) {
      let reference = parent.querySelector(insertafter);

      if (reference) {

        if (reference.parentNode)
          parent = reference.parentNode;

        reference = reference.nextElementSibling;

      }
      parent.insertBefore(node, reference);
    } else {
      parent.appendChild(node);
    }
  }

  function append(source) {
    if (source.nodeType !== 1)
      return;

    let parent = findHook(source);

    let nodes = parent === document.body ? [source] : Array.slice(source.children, 0);

    for (let i = 0, node; node = nodes[i]; i++) {
      insertNode(parent, node);
    }
  }

  function findHook(node) {
    let hook = null;

    if (node.id) {
      hook = document.getElementById(node.id);

      if (hook)
        return hook;
    }

    if (node.hasAttribute("class")) {
      let className = node.className.trim();

      if (className.length > 0) {
        let query = node.tagName + [""].concat(className.split(/\s+/)).join(".");

        hook = document.querySelector(query);

        if (hook)
          return hook;
      }
    }

    return document.body;
  }

  if (typeof html !== "string")
    return;

  let fragment = document.createRange().createContextualFragment(html);
  let nodes = fragment.childNodes;

  Array.forEach(nodes, append);
/*
  self.on("destroy", function() {
    for (let node of _insertedNodes)
      node.parentNode.removeChild(node);
  });
*/
}(self.options.overlay));
