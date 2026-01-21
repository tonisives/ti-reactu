module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce a maximum number of lines for React components",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      tooLarge:
        "Component '{{name}}' has {{lines}} lines, exceeds maximum of {{max}}. Consider splitting into smaller components.",
    },
    schema: [
      {
        type: "object",
        properties: {
          max: {
            type: "integer",
            minimum: 1,
            default: 100,
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    let options = context.options[0] || {}
    let maxLines = options.max || 100

    function isReactComponent(node) {
      // Check if function returns JSX
      let body = node.body

      if (body.type === "JSXElement" || body.type === "JSXFragment") {
        return true
      }

      if (body.type === "BlockStatement") {
        // Look for return statements with JSX
        for (let statement of body.body) {
          if (statement.type === "ReturnStatement" && statement.argument) {
            let arg = statement.argument

            // Handle parenthesized expressions
            while (arg.type === "ParenthesizedExpression") {
              arg = arg.expression
            }

            if (arg.type === "JSXElement" || arg.type === "JSXFragment") {
              return true
            }

            // Handle conditional returns
            if (arg.type === "ConditionalExpression") {
              if (
                arg.consequent.type === "JSXElement" ||
                arg.consequent.type === "JSXFragment" ||
                arg.alternate.type === "JSXElement" ||
                arg.alternate.type === "JSXFragment"
              ) {
                return true
              }
            }
          }
        }
      }

      return false
    }

    function getComponentName(node) {
      if (node.id && node.id.name) {
        return node.id.name
      }

      // Check if it's a variable declaration
      if (node.parent && node.parent.type === "VariableDeclarator" && node.parent.id) {
        return node.parent.id.name
      }

      return "Anonymous"
    }

    function checkComponent(node) {
      if (!isReactComponent(node)) return

      let startLine = node.loc.start.line
      let endLine = node.loc.end.line
      let lines = endLine - startLine + 1

      if (lines > maxLines) {
        context.report({
          node: node,
          messageId: "tooLarge",
          data: {
            name: getComponentName(node),
            lines: lines,
            max: maxLines,
          },
        })
      }
    }

    return {
      ArrowFunctionExpression: checkComponent,
      FunctionDeclaration: checkComponent,
      FunctionExpression: checkComponent,
    }
  },
}
