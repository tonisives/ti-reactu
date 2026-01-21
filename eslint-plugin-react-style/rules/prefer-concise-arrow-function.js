module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Enforce concise arrow function syntax for single-expression functions",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      unnecessaryBracesReturn:
        "Single-expression arrow function should not use braces and return statement. Use expression body instead.",
    },
    fixable: "code",
    schema: [],
  },

  create(context) {
    let sourceCode = context.getSourceCode()

    return {
      ArrowFunctionExpression(node) {
        if (node.body.type !== "BlockStatement") return

        let statements = node.body.body
        if (statements.length !== 1) return

        let statement = statements[0]
        if (statement.type !== "ReturnStatement") return
        if (!statement.argument) return

        context.report({
          node: node,
          messageId: "unnecessaryBracesReturn",
          fix(fixer) {
            let returnExpression = statement.argument
            let expressionText = sourceCode.getText(returnExpression)

            let paramsText = sourceCode.getText(node).split("=>")[0] + "=>"

            // Wrap JSX in parentheses if needed
            let needsParens =
              returnExpression.type === "JSXElement" ||
              returnExpression.type === "JSXFragment"
            let newText = needsParens
              ? `${paramsText} (${expressionText})`
              : `${paramsText} ${expressionText}`

            return fixer.replaceText(node, newText)
          },
        })
      },
    }
  },
}
