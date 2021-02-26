const webpack = require('webpack'); // 用于访问内置插件
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const CopyPlugin = require('copy-webpack-plugin')
module.exports = {
  entry: './src/main.js',
  module: {
    rules: [
      { 
        test: /\.vue$/, 
        use: 'vue-loader' 
      },
      { 
        test: /\.js$/, 
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        } 
      },
      { 
        test: /\.css$/, 
        use: ['vue-style-loader', 'css-loader']
      }
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new CopyPlugin({
      patterns: [
        {
          from: "src/*.html",
          to: "[name].[ext]"
        },
      ],
    })
  ],
  mode: 'production'
}