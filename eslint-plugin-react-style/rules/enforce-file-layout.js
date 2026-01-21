module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Enforce file layout: exported types/functions/components first, then private functions",
      category: "Stylistic Issues",
      recommended: true,
    },
    messages: {
      exportAfterPrivate:
        "Exported {{type}} '{{name}}' should be declared before private declarations",
    },
    schema: [],
  },

  create(context) {
    let declarations = []

    function isExported(node) {
      if (!node.parent) return false

      if (
        node.parent.type === "ExportNamedDeclaration" ||
        node.parent.type === "ExportDefaultDeclaration"
      ) {
        return true
      }

      return false
    }

    function getDeclarationType(node) {
      switch (node.type) {
        case "FunctionDeclaration":
          return "function"
        case "VariableDeclaration":
          return node.kind
        case "ClassDeclaration":
          return "class"
        case "TSTypeAliasDeclaration":
          return "type"
        case "TSInterfaceDeclaration":
          return "interface"
        case "TSEnumDeclaration":
          return "enum"
        default:
          return "declaration"
      }
    }

    function isVariableFunction(node) {
      if (node.type !== "VariableDeclaration") return false
      if (node.declarations.length === 0) return false

      let declarator = node.declarations[0]
      if (!declarator.init) return false

      return (
        declarator.init.type === "ArrowFunctionExpression" ||
        declarator.init.type === "FunctionExpression"
      )
    }

    function getDeclarationName(node) {
      if (node.id && node.id.name) {
        return node.id.name
      }
      if (node.type === "VariableDeclaration" && node.declarations.length > 0) {
        let firstDeclarator = node.declarations[0]
        if (firstDeclarator.id && firstDeclarator.id.name) {
          return firstDeclarator.id.name
        }
      }
      return "unknown"
    }

    function checkTopLevelDeclaration(node) {
      if (
        node.parent.type !== "Program" &&
        node.parent.type !== "ExportNamedDeclaration" &&
        node.parent.type !== "ExportDefaultDeclaration"
      ) {
        return
      }

      let isExport = isExported(node)
      let type = getDeclarationType(node)
      let name = getDeclarationName(node)

      declarations.push({
        node,
        isExport,
        type,
        name,
        line: node.loc.start.line,
      })
    }

    return {
      FunctionDeclaration: checkTopLevelDeclaration,
      VariableDeclaration: checkTopLevelDeclaration,
      ClassDeclaration: checkTopLevelDeclaration,
      TSTypeAliasDeclaration: checkTopLevelDeclaration,
      TSInterfaceDeclaration: checkTopLevelDeclaration,
      TSEnumDeclaration: checkTopLevelDeclaration,

      "Program:exit"() {
        if (declarations.length === 0) return

        let firstPrivateFunctionIndex = declarations.findIndex((d) => {
          if (d.isExport) return false

          if (d.node.type === "FunctionDeclaration") return true
          if (d.type === "let") return true
          if (d.type === "const" && isVariableFunction(d.node)) return true

          return false
        })

        if (firstPrivateFunctionIndex === -1) return

        for (let i = firstPrivateFunctionIndex + 1; i < declarations.length; i++) {
          let decl = declarations[i]
          if (decl.isExport) {
            context.report({
              node: decl.node,
              messageId: "exportAfterPrivate",
              data: {
                type: decl.type,
                name: decl.name,
              },
            })
          }
        }
      },
    }
  },
}
