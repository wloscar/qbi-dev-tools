const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const config = require("../../config.json");
const TerserPlugin = require("terser-webpack-plugin");
let cwd = process.cwd();
module.exports = {
  entry: ["./src/index.ts"],
  devtool: "cheap-module-source-map",
  mode: "development",
  optimization: {
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: true,
        terserOptions: {},
      }),
    ],
    minimize: false,
    concatenateModules: false,
  },
  performance: {
    maxEntrypointSize: 1024000,
    maxAssetSize: 1024000,
    hints: false,
  },
  module: {
    rules: [
      {
        parser: {
          amd: false,
        },
      },
      {
        test: /\.json$/,
        loader: require.resolve("json-loader"),
        type: "javascript/auto",
      },
      {
        test: /(\.less)|(\.css)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: require.resolve("css-loader"),
          },
          {
            loader: require.resolve("less-loader"),
            options: {
              paths: [path.resolve(__dirname, "..", "node_modules")],
            },
          },
        ],
      },
      // {
      //   test: /\.s[ac]ss$/i,
      //   use: [
      //     {
      //       loader: MiniCssExtractPlugin.loader,
      //     },
      //     {
      //       loader: require.resolve("css-loader"),
      //     },
      //     {
      //       loader: require.resolve("sass-loader"),
      //     },
      //   ],
      // },
      {
        test: /\.(woff|ttf|ico|woff2|jpg|jpeg|png|webp|gif|svg|eot)$/i,
        use: [
          {
            loader: require.resolve("base64-inline-loader"),
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", ".css"],
  },
  output: {
    path: path.join(cwd, "build"),
    pathinfo: true,
    filename: "main.js",
    publicPath: "/",
    library: "BIComponent",
    libraryTarget: "umd",
  },
  devServer: {
    disableHostCheck: true,
    contentBase: null,
    compress: true,
    clientLogLevel: "none",
    watchContentBase: true,
    port: 8001,
    hot: true,
    quiet: false,
    inline: false,
    https: true,
    public: undefined,
    proxy: undefined,
    publicPath: "/",
    headers: {
      "access-control-allow-origin": "*",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers":
        "X-Requested-With, content-type, Authorization, x-csrf-token",
      "cache-control": "public, max-age=0",
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(cwd, "./public/index.html"),
      templateContent: false,
      filename: "index.html",
      compile: true,
      minify: false,
      chunks: "all",
      excludeChunks: [],
      title: "QBI App",
    }),
    new MiniCssExtractPlugin({
      filename: config.build.css,
      chunkFilename: "[id].css",
    }),
  ],
};
