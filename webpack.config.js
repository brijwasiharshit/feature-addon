const defaults = require("./node_modules/@wordpress/scripts/config/webpack.config");

const webpack = require("webpack");
module.exports = {
  ...defaults,
  resolve: {
    ...defaults?.resolve,
    fallback: {
      util: require.resolve("util/"),
      process: require.resolve('process/browser')
    },
  },
  // externals: {
  //   react: 'React',
  //   'react-dom': 'ReactDOM',
  // }
  devServer: {
    ...defaults.devServer,
    
    proxy: [
      {
        context: ['/api'],
        target: 'http://harshitwordpress.local:3000',
      },
    ],
    plugins: [
      ...defaults?.plugins,
      new webpack.ProvidePlugin({
        process: 'process/browser',
      }),
    ],
  },
};
