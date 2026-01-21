module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow inline event handlers in JSX, extract to named functions",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      noInlineHandler:
        "Extract inline handler to a named function. Example: let handleClick = () => ...",
    },
    schema: [
      {
        type: "object",
        properties: {
          maxBodyLength: {
            type: "integer",
            minimum: 1,
            default: 30,
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    let options = context.options[0] || {}
    let maxBodyLength = options.maxBodyLength || 30

    function isEventHandler(name) {
      return /^on[A-Z]/.test(name)
    }

    return {
      JSXAttribute(node) {
        if (!node.name || node.name.type !== "JSXIdentifier") return
        if (!isEventHandler(node.name.name)) return
        if (!node.value || node.value.type !== "JSXExpressionContainer") return

        let expression = node.value.expression

        // Allow simple function references
        if (expression.type === "Identifier") return
        if (expression.type === "MemberExpression") return

        // Allow short arrow functions (single identifier call)
        if (expression.type === "ArrowFunctionExpression") {
          let sourceCode = context.getSourceCode()
          let expressionText = sourceCode.getText(expression)

          // Allow short handlers
          if (expressionText.length <= maxBodyLength) return
        }

        // Allow call expressions
        if (expression.type === "CallExpression") return

        context.report({
          node: node.value,
          messageId: "noInlineHandler",
        })
      },
    }
  },
}
