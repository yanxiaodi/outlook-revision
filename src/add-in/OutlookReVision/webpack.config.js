/* eslint-disable no-undef */

const devCerts = require("office-addin-dev-certs");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

const urlDev = "https://localhost:3000/";
const urlProd = "https://www.contoso.com/"; // CHANGE THIS TO YOUR PRODUCTION DEPLOYMENT LOCATION

async function getHttpsOptions() {
  const httpsOptions = await devCerts.getHttpsServerOptions();
  return { ca: httpsOptions.ca, key: httpsOptions.key, cert: httpsOptions.cert };
}

module.exports = async (env, options) => {
  const dev = options.mode === "development";
  
  // Debug: Log environment configuration
  const apiHost = process.env.REACT_APP_API_HOST || 
    (options.mode === 'production' 
      ? 'https://outlook-revision-api-d0dqe4a6ggencehj.australiaeast-01.azurewebsites.net' 
      : 'http://localhost:5298');
  
  console.log('\n=== Webpack Configuration ===');
  console.log('Mode:', options.mode);
  console.log('REACT_APP_API_HOST env var:', process.env.REACT_APP_API_HOST || '(not set)');
  console.log('Final API Host:', apiHost);
  console.log('Proxy enabled:', !process.env.REACT_APP_API_HOST);
  console.log('=============================\n');
  
  const config = {
    devtool: "source-map",
    entry: {
      polyfill: ["core-js/stable", "regenerator-runtime/runtime"],
      react: ["react", "react-dom"],
      taskpane: {
        import: ["./src/taskpane/index.tsx", "./src/taskpane/taskpane.html"],
        dependOn: "react",
      },
      commands: "./src/commands/commands.ts",
    },
    output: {
      clean: true,
    },
    cache: false, // Disable caching to ensure environment variables are always fresh
    resolve: {
      extensions: [".ts", ".tsx", ".html", ".js", ".json"],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
          },
        },
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: ["ts-loader"],
        },
        {
          test: /\.html$/,
          exclude: /node_modules/,
          use: "html-loader",
        },
        {
          test: /\.(png|jpg|jpeg|ttf|woff|woff2|gif|ico)$/,
          type: "asset/resource",
          generator: {
            filename: "assets/[name][ext][query]",
          },
        },
        {
          test: /\.json$/,
          type: "json",
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: "index.html",
        template: "./src/index.html",
        inject: false,
      }),
      new HtmlWebpackPlugin({
        filename: "taskpane.html",
        template: "./src/taskpane/taskpane.html",
        chunks: ["polyfill", "taskpane", "react"],
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "assets/*",
            to: "assets/[name][ext][query]",
          },
          {
            from: "manifest*.json",
            to: "[name]" + "[ext]",
            transform(content) {
              if (dev) {
                return content;
              } else {
                return content.toString().replace(new RegExp(urlDev, "g"), urlProd);
              }
            },
          },
          {
            from: "manifest.xml",
            to: "manifest.xml",
            noErrorOnMissing: true,
            transform(content) {
              if (dev) {
                return content;
              } else {
                return content.toString().replace(new RegExp(urlDev, "g"), urlProd);
              }
            },
          },
        ],
      }),
      new HtmlWebpackPlugin({
        filename: "commands.html",
        template: "./src/commands/commands.html",
        chunks: ["polyfill", "commands"],
      }),
      new webpack.ProvidePlugin({
        Promise: ["es6-promise", "Promise"],
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(options.mode || 'development'),
        'process.env.REACT_APP_API_HOST': JSON.stringify(apiHost),
      }),
    ],
    devServer: {
      hot: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      server: {
        type: "https",
        options: env.WEBPACK_BUILD || options.https !== undefined ? options.https : await getHttpsOptions(),
      },
      port: process.env.npm_package_config_dev_server_port || 3000,
      // Only use proxy when connecting to local backend (when REACT_APP_API_HOST is not set)
      // When REACT_APP_API_HOST is set to Azure URL, the frontend makes direct calls
      ...(process.env.REACT_APP_API_HOST ? {} : {
        proxy: [
          {
            context: ['/api'],
            target: 'http://localhost:5298',
            secure: false,
            changeOrigin: true,
            logLevel: 'debug'
          }
        ]
      }),
    },
  };

  return config;
};
