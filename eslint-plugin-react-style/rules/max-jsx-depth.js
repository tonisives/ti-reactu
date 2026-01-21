module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce a maximum depth for JSX element nesting",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      tooDeep:
        "JSX nesting depth of {{depth}} exceeds maximum of {{max}}. Extract nested elements into separate components.",
    },
    schema: [
      {
        type: "object",
        properties: {
          max: {
            type: "integer",
            minimum: 1,
            default: 5,
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    let options = context.options[0] || {}
    let maxDepth = options.max || 5

    function getJsxDepth(node) {
      let depth = 0
      let current = node.parent

      while (current) {
        if (current.type === "JSXElement" || current.type === "JSXFragment") {
          depth++
        }
        current = current.parent
      }

      return depth
    }

    return {
      JSXElement(node) {
        let depth = getJsxDepth(node) + 1

        if (depth > maxDepth) {
          context.report({
            node: node.openingElement,
            messageId: "tooDeep",
            data: {
              depth: depth,
              max: maxDepth,
            },
          })
        }
      },
    }
  },
}
