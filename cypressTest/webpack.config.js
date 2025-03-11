const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = (env, argv) => {
  const isProd = argv?.mode === "production";

  return {
    entry: "./src/index.js",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "bundle.[contenthash].js",
      publicPath: "/",
    },
    resolve: {
      extensions: [".js", ".jsx"],
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: "babel-loader",
        },
        {
          test: /\.css$/,
          use: [isProd ? MiniCssExtractPlugin.loader : "style-loader", "css-loader"],
        },
        {
          test: /\.scss$/,
          use: [isProd ? MiniCssExtractPlugin.loader : "style-loader", "css-loader", "sass-loader"],
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          type: "asset/resource",
        },
      ],
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: "./public/index.html",
        favicon: "./public/favicon.ico",
      }),
      new MiniCssExtractPlugin({
        filename: "styles.[contenthash].css",
      }),
    ],
    devServer: {
      static: path.join(__dirname, "public"),
      compress: true,
      port: 3000,
      historyApiFallback: true,
      hot: true,
    },
    devtool: isProd ? "source-map" : "eval-source-map",
  };
};