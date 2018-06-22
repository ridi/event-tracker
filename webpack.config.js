const path = require("path");
const webpack = require("webpack");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");


module.exports = {
  mode: "production",
  entry: {
    "bundle": [
      'promise-polyfill',
      'whatwg-fetch',
      path.resolve(__dirname, "src/index.ts")
    ]
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true
            }
          }
        ],
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  output: {
    filename: "[name].min.js",
    path: path.resolve(__dirname, "dist/umd"),
    libraryTarget: "umd"
  },
  plugins: [
    new UglifyJsPlugin({
      sourceMap: true,
      include: /\.min\.js$/
    })
  ]
};
