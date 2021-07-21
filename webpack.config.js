/* eslint-disable */
const path = require('path');

const extensionConfig = {
  target: 'electron-main',
  entry: './src/extension.ts',
  output: {
    path: path.resolve(__dirname, 'out'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: '../[resource-path]'
  },
  devtool: 'source-map',
  externals: {
    vscode: 'commonjs vscode' // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      }
    ]
  }
};

const quickstartConfig = {
  entry: {
    quickstartsPreview: "./src/quickstarts/app/index.tsx",
  },
  output: {
    path: path.resolve(__dirname, "quickstartsPreview"),
    filename: "[name].js"
  },
  devtool: "source-map",
  externals: {
    vscode: 'commonjs vscode'
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx"],
    alias: {
      react: path.resolve('./node_modules/react'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        loader: "ts-loader",
        options: {},
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
          },
        ],
      },
      {
        test: /\.(png|jpe?g|webp|gif|svg)$/,
        loader: "null-loader"
      },
      {
        test: /.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
        loader: "null-loader"
      },
    ],
  },
};

module.exports = [extensionConfig, quickstartConfig]; 
