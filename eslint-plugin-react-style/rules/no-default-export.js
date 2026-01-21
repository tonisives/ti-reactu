module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow default exports, prefer named exports",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      noDefaultExport:
        "Use named exports instead of default exports. Example: export let MyComponent = ...",
    },
    schema: [],
  },

  create(context) {
    return {
      ExportDefaultDeclaration(node) {
        context.report({
          node,
          messageId: "noDefaultExport",
        })
      },
    }
  },
}
