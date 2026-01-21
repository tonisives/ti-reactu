module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Prefer type aliases over interfaces",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      preferType:
        "Use 'type' instead of 'interface'. Example: type {{name}} = { ... }",
    },
    fixable: "code",
    schema: [],
  },

  create(context) {
    let sourceCode = context.getSourceCode()

    return {
      TSInterfaceDeclaration(node) {
        let name = node.id.name
        let isExported = node.parent.type === "ExportNamedDeclaration"

        context.report({
          node,
          messageId: "preferType",
          data: { name },
          fix(fixer) {
            let typeParams = node.typeParameters
              ? sourceCode.getText(node.typeParameters)
              : ""
            let body = sourceCode.getText(node.body)
            let extendsClause = ""

            if (node.extends && node.extends.length > 0) {
              let extendedTypes = node.extends
                .map((ext) => sourceCode.getText(ext))
                .join(" & ")
              extendsClause = `${extendedTypes} & `
            }

            let typeDecl = `type ${name}${typeParams} = ${extendsClause}${body}`

            if (node.parent.type === "ExportNamedDeclaration") {
              return fixer.replaceText(node.parent, `export ${typeDecl}`)
            }

            return fixer.replaceText(node, typeDecl)
          },
        })
      },
    }
  },
}
