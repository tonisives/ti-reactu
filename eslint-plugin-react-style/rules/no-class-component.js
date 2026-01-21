module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow class components, prefer functional components",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      noClassComponent:
        "Use functional components instead of class components. Example: let {{name}} = (props) => ...",
    },
    schema: [],
  },

  create(context) {
    function isReactComponent(node) {
      if (!node.superClass) return false

      // Check for extends React.Component or extends Component
      if (node.superClass.type === "MemberExpression") {
        return (
          node.superClass.property.name === "Component" ||
          node.superClass.property.name === "PureComponent"
        )
      }

      if (node.superClass.type === "Identifier") {
        return (
          node.superClass.name === "Component" ||
          node.superClass.name === "PureComponent"
        )
      }

      return false
    }

    return {
      ClassDeclaration(node) {
        if (!isReactComponent(node)) return

        let name = node.id ? node.id.name : "Component"

        context.report({
          node,
          messageId: "noClassComponent",
          data: { name },
        })
      },

      ClassExpression(node) {
        if (!isReactComponent(node)) return

        context.report({
          node,
          messageId: "noClassComponent",
          data: { name: "Component" },
        })
      },
    }
  },
}
