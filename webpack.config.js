const {
  resolve
} = require("path");

const HtmlWebPackPlugin = require("html-webpack-plugin");

const config = {
  entry: {
    quantum: resolve("./src/index.ts"),
    kanban: resolve("./src/quants/kanban.js"),
    test: resolve("./src/quants/test.js"),
    state: resolve("./src/quants/state.js"),
    omotheme: resolve("./src/quants/omotheme.js"),
    ipfs: resolve("./src/quants/ipfs.js"),
    demo: resolve("./src/quants/demo.js"),
    milestone: resolve("./src/quants/milestone.js"),
    ipfstwo: resolve("./src/quants/ipfs2.js"),
    simple: resolve("./src/quants/simple.js"),
    tableView: resolve("./src/quants/tableView.js"),
    storeView: resolve("./src/quants/storeView.js"),
    person: resolve("./src/quants/person.js"),
    todo: resolve("./src/quants/todo.js")
  },
  module: {
    rules: [{
      test: /\.tsx?$/,
      loader: ["awesome-typescript-loader?module=esnext&target=esnext"],
      exclude: [/node_modules/]
    },
    {
      test: /\.js$/
    },
    {
      test: /\.html$/,
      use: [{
        loader: "html-loader",
        options: {
          minimize: false
        }
      }]
    }
    ]
  },
  resolve: {
    mainFields: ['esnext', 'browser', 'module', 'main'],
    extensions: [".js", ".ts", ".tsx"]
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "./src/index.html",
      filename: "./index.html",
      chunks: [""]
    })
  ]
};

module.exports = config;