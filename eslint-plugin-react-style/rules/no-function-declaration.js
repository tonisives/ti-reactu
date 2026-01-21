module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Prefer arrow functions over function declarations",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      preferArrowFunction:
        "Use arrow function syntax instead of function declaration. Example: let {{name}} = () => ...",
    },
    fixable: "code",
    schema: [],
  },

  create(context) {
    let sourceCode = context.getSourceCode()

    return {
      FunctionDeclaration(node) {
        // Skip if no name (shouldn't happen for declarations, but be safe)
        if (!node.id) return

        let name = node.id.name
        let isExported =
          node.parent.type === "ExportNamedDeclaration" ||
          node.parent.type === "ExportDefaultDeclaration"

        context.report({
          node,
          messageId: "preferArrowFunction",
          data: { name },
          fix(fixer) {
            let params = node.params.map((p) => sourceCode.getText(p)).join(", ")
            let body = sourceCode.getText(node.body)
            let async = node.async ? "async " : ""
            let typeParams = node.typeParameters
              ? sourceCode.getText(node.typeParameters)
              : ""
            let returnType = node.returnType
              ? sourceCode.getText(node.returnType)
              : ""

            let arrowFn = `${async}(${params})${returnType} => ${body}`
            let declaration = isExported
              ? `export let ${name} = ${typeParams}${arrowFn}`
              : `let ${name} = ${typeParams}${arrowFn}`

            // For export declarations, replace the whole export statement
            if (node.parent.type === "ExportNamedDeclaration") {
              return fixer.replaceText(node.parent, declaration)
            }

            return fixer.replaceText(node, `let ${name} = ${typeParams}${arrowFn}`)
          },
        })
      },
    }
  },
}
