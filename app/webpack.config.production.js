const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  devtool: '#cheap-module-source-map',
  entry: [
    'babel-polyfill',
    path.join(__dirname, 'src', 'index.js')
  ],
  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.js', '.jsx', '.less', '.css'],
    modules: [
      'node_modules',
      path.resolve(__dirname, './src')
    ],
    symlinks: false
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src/index.tpl.html'),
      inject: 'body',
      filename: 'index.html',
      minify: {
        collapseWhitespace: true
      }
    }),
    new ExtractTextPlugin({filename: '[name].css', allChunks: true}),
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(require('./package.json').version),
      'process.env': {NODE_ENV: '"production"'}
    }),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      beautify: false,
      mangle: {
        screw_ie8: true,
        keep_fnames: true
      },
      compress: {
        screw_ie8: true
      },
      comments: false
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),
    new CopyWebpackPlugin([{
      from: 'node_modules/monaco-editor/min/vs',
      to: 'vs'
    }])
  ],
  module: {
    rules: [{
      test: /\.jsx?$/,
      include: path.join(__dirname, 'src'),
      use: ['babel-loader']
    }, {
      test: /\.css$/,
      exclude: /\.import\.css$/,
      use: ['style-loader', 'css-loader']
    }, {
      test: /\.import\.css$/,
      include: path.resolve(__dirname, 'src'),
      use: ['style-loader', 'css-loader']
    }, {
      test: /\.less$/,
      include: path.resolve(__dirname, 'src'),
      exclude: /\.module\.less$/,
      use: ['style-loader', 'css-loader', 'less-loader']
    }, {
      test: /\.module\.less$/,
      include: path.resolve(__dirname, 'src'),
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            modules: true,
            importLoaders: 1,
            localIdentName: '[name]__[local]___[hash:base64:5]!'
          }
        },
        'less-loader'
      ]
    }, {
      test: /\.(jpg|png|jpg|png|woff|eot|ttf|svg|gif|eot|ttf|woff|woff2)(\?.*)?$/,
      use: ['file-loader']
    }]
  }
}
