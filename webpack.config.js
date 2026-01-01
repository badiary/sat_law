const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === "development";

  return {
    mode: isDevelopment ? "development" : "production",

    entry: {
      api: "./src/api/main.tsx",
      viewer: "./src/viewer/main.ts"
    },

    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].js",
      clean: true
    },

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: {
            loader: "ts-loader",
            options: {
              transpileOnly: true, // 型チェックをスキップして高速化
              compilerOptions: {
                noEmit: false
              }
            }
          },
          exclude: /node_modules/
        },
        {
          test: /\.svg$/i,
          issuer: /\.[jt]sx?$/,
          use: ["@svgr/webpack"]
        },
        {
          test: /\.css$/,
          use: [
            "style-loader",
            { loader: "css-loader", options: { importLoaders: 1 } },
            "postcss-loader"
          ]
        }
      ]
    },

    resolve: {
      extensions: [".ts", ".tsx", ".js", ".json"],
      alias: {
        "@api": path.resolve(__dirname, "./src/api"),
        "@viewer": path.resolve(__dirname, "./src/viewer"),
        "@": path.resolve(__dirname, "./src")
      }
    },

    target: ["web", "es5"],

    optimization: {
      minimize: !isDevelopment,
      minimizer: [
        new TerserPlugin({
          extractComments: false,
          terserOptions: {
            format: {
              comments: false,
            },
          },
        })
      ]
    },

    devtool: isDevelopment ? "source-map" : false
  };
};