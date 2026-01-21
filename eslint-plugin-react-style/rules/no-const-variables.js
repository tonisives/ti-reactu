module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Prefer let over const for variable declarations (except top-level constants)",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      preferLet:
        "Use 'let' instead of 'const'. Only use 'const' for top-level file constants (e.g., UPPER_CASE constants).",
    },
    fixable: "code",
    schema: [],
  },

  create(context) {
    return {
      VariableDeclaration(node) {
        if (node.kind !== "const") return

        let parent = node.parent
        let isTopLevel = parent && parent.type === "Program"

        if (isTopLevel) {
          let allUpperCase = node.declarations.every((decl) => {
            if (decl.id.type === "Identifier") {
              return decl.id.name === decl.id.name.toUpperCase()
            }
            return true
          })

          if (allUpperCase) {
            return
          }
        }

        context.report({
          node,
          messageId: "preferLet",
          fix(fixer) {
            return fixer.replaceTextRange([node.range[0], node.range[0] + 5], "let")
          },
        })
      },
    }
  },
}
