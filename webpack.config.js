const path = require("path");

module.exports = {
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
