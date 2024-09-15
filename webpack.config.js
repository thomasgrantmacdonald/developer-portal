const path = require('path');

module.exports = {
  entry: './src/index.js', // Entry point for your source code
  output: {
    filename: 'bundle.js', // Output filename
    path: path.resolve(__dirname, 'dist'), // Output directory
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Transpile JavaScript files
        exclude: /node_modules/, // Exclude node_modules
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'], // Use preset-env for ES6+ compatibility
          },
        },
      },
    ],
  },
  devtool: 'source-map', // Generate source maps for easier debugging
  mode: 'development', // Use 'production' mode for final deployment
};
