/**
 * Webpack HMR configuration for NestJS
 * @type {import('webpack').Configuration}
 */
module.exports = function(options, webpack) {
  const { merge } = require('webpack-merge');
  const path = require('path');

  const tsLoader = {
    test: /\.tsx?$/,
    loader: 'ts-loader',
    exclude: /node_modules/,
    options: {
      transpileOnly: true,
      configFile: path.resolve(__dirname, 'tsconfig.webpack.json'),
      getCustomTransformers: (program) => ({
        before: [
          require('@nestjs/swagger/plugin').before({}, program),
        ],
      }),
    },
  };

  return merge(options, {
    mode: process.env.NODE_ENV || 'development',
    module: {
      rules: [tsLoader],
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.WatchIgnorePlugin({
        paths: [/\.js$/, /\.d\.ts$/],
      }),
    ],
    stats: 'errors-only'
  });
}; 