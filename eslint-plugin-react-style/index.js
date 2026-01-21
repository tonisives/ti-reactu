module.exports = {
  rules: {
    "prefer-concise-arrow-function": require("./rules/prefer-concise-arrow-function"),
    "no-const-variables": require("./rules/no-const-variables"),
    "no-function-declaration": require("./rules/no-function-declaration"),
    "no-default-export": require("./rules/no-default-export"),
    "no-interface": require("./rules/no-interface"),
    "no-class-component": require("./rules/no-class-component"),
    "enforce-file-layout": require("./rules/enforce-file-layout"),
    "no-inline-handler": require("./rules/no-inline-handler"),
    "prefer-early-return": require("./rules/prefer-early-return"),
  },
  configs: {
    recommended: {
      rules: {
        "react-style/prefer-concise-arrow-function": "error",
        "react-style/no-const-variables": "error",
        "react-style/no-function-declaration": "error",
        "react-style/no-default-export": "error",
        "react-style/no-interface": "error",
        "react-style/no-class-component": "error",
        "react-style/enforce-file-layout": "error",
        "react-style/no-inline-handler": ["error", { maxBodyLength: 30 }],
        "react-style/prefer-early-return": "warn",
      },
    },
  },
}
