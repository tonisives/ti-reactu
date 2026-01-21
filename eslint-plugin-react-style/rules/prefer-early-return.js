module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Prefer early returns in components for conditional rendering",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      preferEarlyReturn:
        "Consider using early return instead of wrapping entire component body in conditional. Example: if (loading) return <Loading />",
    },
    schema: [],
  },

  create(context) {
    function isJSXReturnStatement(node) {
      return (
        node.type === "ReturnStatement" &&
        node.argument &&
        (node.argument.type === "JSXElement" ||
          node.argument.type === "JSXFragment" ||
          (node.argument.type === "ConditionalExpression" &&
            (node.argument.consequent.type === "JSXElement" ||
              node.argument.alternate.type === "JSXElement")))
      )
    }

    function isComponentFunction(node) {
      // Check if it's a function that returns JSX
      if (node.body.type === "BlockStatement") {
        let returnStatements = node.body.body.filter(
          (stmt) => stmt.type === "ReturnStatement"
        )
        return returnStatements.some(isJSXReturnStatement)
      }
      return (
        node.body.type === "JSXElement" || node.body.type === "JSXFragment"
      )
    }

    function checkForTernaryWrappingBody(node) {
      if (!isComponentFunction(node)) return

      // Look for return statements with ternary that wraps the whole content
      if (node.body.type !== "BlockStatement") return

      let statements = node.body.body
      if (statements.length !== 1) return

      let returnStmt = statements[0]
      if (returnStmt.type !== "ReturnStatement") return
      if (!returnStmt.argument) return

      // Check if it's a ternary where both branches are JSX
      if (returnStmt.argument.type === "ConditionalExpression") {
        let { test, consequent, alternate } = returnStmt.argument

        // If one branch is null/undefined and the other is JSX, suggest early return
        let consequentIsJSX =
          consequent.type === "JSXElement" || consequent.type === "JSXFragment"
        let alternateIsJSX =
          alternate.type === "JSXElement" || alternate.type === "JSXFragment"
        let alternateIsNull =
          alternate.type === "Literal" && alternate.value === null
        let consequentIsNull =
          consequent.type === "Literal" && consequent.value === null

        if ((consequentIsJSX && alternateIsNull) || (alternateIsJSX && consequentIsNull)) {
          context.report({
            node: returnStmt,
            messageId: "preferEarlyReturn",
          })
        }
      }
    }

    return {
      ArrowFunctionExpression: checkForTernaryWrappingBody,
      FunctionExpression: checkForTernaryWrappingBody,
      FunctionDeclaration: checkForTernaryWrappingBody,
    }
  },
}
