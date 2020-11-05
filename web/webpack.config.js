var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: {
  	app: [
      // 'webpack-dev-server/client?http://0.0.0.0:8086', // WebpackDevServer host and port
      // 'webpack/hot/only-dev-server', // "only" prevents reload on syntax errors
      'es6-promise',
      'whatwg-fetch',
      "./src/app.ts"
    ]
  },
  output: {
    path: path.resolve(__dirname),
    filename: 'dist/app.js', 
  }, 
  // devtool: 'cheap-module-eval-source-map',
  plugins: [
    // new webpack.optimize.UglifyJsPlugin({ minimize: true }),
    new webpack.NamedModulesPlugin(),
  ],
  resolve: {
      extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js']
  },
  mode: 'development',
  module: {
      rules: [
        { test: /\.tsx?$/, loader: 'ts-loader' },
        { test: /\.json$/, loader: 'json-loader' },
        { test: /\.css$/, loader: 'css-loader',
          options:{
            esModule: false
          }
        },
        { test: /\.svg$/, loader: 'raw-loader' },
        { test: /\.csv$/, loader: 'raw-loader' }
      ]
  },
};

